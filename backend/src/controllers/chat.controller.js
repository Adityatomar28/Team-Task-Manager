const prisma = require("../db/prisma");
const { isNonEmptyString } = require("../utils/validators");

const MAX_HISTORY = 10;

function normalizeMessages(messages = []) {
  return messages
    .filter((message) => ["user", "assistant"].includes(message?.role) && isNonEmptyString(message?.content))
    .slice(-MAX_HISTORY)
    .map((message) => ({
      role: message.role,
      content: message.content.trim().slice(0, 2000),
    }));
}

function formatDate(value) {
  if (!value) return "No due date";
  return new Date(value).toISOString().slice(0, 10);
}

function buildWorkspaceSummary(projects) {
  if (!projects.length) {
    return "The user has no projects yet.";
  }

  return projects
    .map((project) => {
      const members = project.members
        .map((member) => `${member.user.name} <${member.user.email}> (${member.role})`)
        .join(", ");
      const tasks = project.tasks.length
        ? project.tasks
            .map((task) => {
              const assignee = task.assignedTo?.name || "Unassigned";
              return `- ${task.title} | ${task.status} | ${task.priority} | ${formatDate(task.dueDate)} | ${assignee}`;
            })
            .join("\n")
        : "- No tasks";

      return [
        `Project: ${project.name}`,
        `Description: ${project.description || "None"}`,
        `Members: ${members || "No members"}`,
        "Tasks:",
        tasks,
      ].join("\n");
    })
    .join("\n\n");
}

async function getWorkspaceContext(userId, projectId) {
  return prisma.project.findMany({
    where: {
      ...(projectId ? { id: projectId } : {}),
      OR: [{ ownerId: userId }, { members: { some: { userId } } }],
    },
    include: {
      members: {
        include: {
          user: {
            select: { name: true, email: true },
          },
        },
      },
      tasks: {
        include: {
          assignedTo: {
            select: { name: true, email: true },
          },
        },
        orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
        take: 40,
      },
    },
    orderBy: { updatedAt: "desc" },
    take: projectId ? 1 : 6,
  });
}

function getSystemPrompt(workspaceSummary) {
  return [
    "You are Project management system, a concise chatbot inside TeamSync.",
    "Help with planning, prioritization, delivery risks, team workload, task breakdowns, status summaries, and next actions.",
    "Use the workspace context when it is relevant. If the answer needs data that is not present, say what is missing.",
    "Do not claim to update projects or tasks. You can suggest changes the user may make in the app.",
    "",
    "Workspace context:",
    workspaceSummary,
  ].join("\n");
}

async function callOpenAI(messages) {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

  if (!apiKey) return null;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.3,
    }),
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload?.error?.message || "OpenAI request failed");
  }

  return payload.choices?.[0]?.message?.content?.trim();
}

async function callGemini(systemPrompt, messages) {
  const apiKey = process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";

  if (!apiKey) return null;

  const contents = messages.map((message) => ({
    role: message.role === "assistant" ? "model" : "user",
    parts: [{ text: message.content }],
  }));

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: systemPrompt }],
        },
        contents,
        generationConfig: {
          temperature: 0.3,
        },
      }),
    }
  );

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload?.error?.message || "Google AI request failed");
  }

  return payload.candidates?.[0]?.content?.parts
    ?.map((part) => part.text)
    .filter(Boolean)
    .join("\n")
    .trim();
}

async function sendChatMessage(req, res, next) {
  try {
    const { message, messages, projectId } = req.body;

    if (!isNonEmptyString(message)) {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    const history = normalizeMessages(messages);
    const workspaceProjects = await getWorkspaceContext(req.user.id, projectId);
    const systemPrompt = getSystemPrompt(buildWorkspaceSummary(workspaceProjects));
    const chatMessages = [
      { role: "system", content: systemPrompt },
      ...history,
      { role: "user", content: message.trim().slice(0, 2000) },
    ];

    let answer = await callOpenAI(chatMessages);
    if (!answer) {
      answer = await callGemini(systemPrompt, chatMessages.filter((item) => item.role !== "system"));
    }

    if (!answer) {
      return res.status(500).json({
        success: false,
        message: "AI chat is not configured. Set OPENAI_API_KEY or GOOGLE_AI_API_KEY in backend/.env",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        role: "assistant",
        content: answer,
      },
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  sendChatMessage,
};
