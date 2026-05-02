const prisma = require("../db/prisma");
const {
  isNonEmptyString,
  isEnumValue,
  isOptionalDate,
} = require("../utils/validators");

const TASK_STATUSES = ["TODO", "IN_PROGRESS", "DONE"];
const PRIORITIES = ["LOW", "MEDIUM", "HIGH"];

async function createTask(req, res, next) {
  try {
    const { projectId } = req.params;
    const { title, description, status, priority, dueDate, assignedToId } = req.body;

    if (!isNonEmptyString(title)) {
      return res.status(400).json({
        success: false,
        message: "Task title is required",
      });
    }

    if (status && !isEnumValue(status, TASK_STATUSES)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task status",
      });
    }

    if (priority && !isEnumValue(priority, PRIORITIES)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task priority",
      });
    }

    if (!isOptionalDate(dueDate)) {
      return res.status(400).json({
        success: false,
        message: "Invalid due date",
      });
    }

    if (assignedToId) {
      const assigneeMembership = await prisma.projectMember.findUnique({
        where: {
          userId_projectId: {
            userId: assignedToId,
            projectId,
          },
        },
        select: { id: true },
      });

      if (!assigneeMembership) {
        return res.status(400).json({
          success: false,
          message: "Assignee must be a member of the project",
        });
      }
    }

    const task = await prisma.task.create({
      data: {
        projectId,
        title: title.trim(),
        description: description?.trim() || null,
        status: status || "TODO",
        priority: priority || "MEDIUM",
        dueDate: dueDate ? new Date(dueDate) : null,
        assignedToId: assignedToId || null,
        createdById: req.user.id,
      },
      include: {
        assignedTo: {
          select: { id: true, name: true, email: true },
        },
        createdBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return res.status(201).json({
      success: true,
      message: "Task created successfully",
      data: task,
    });
  } catch (error) {
    return next(error);
  }
}

async function listProjectTasks(req, res, next) {
  try {
    const { projectId } = req.params;
    const { status, priority, assignedToId } = req.query;

    if (status && !isEnumValue(status, TASK_STATUSES)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task status filter",
      });
    }

    if (priority && !isEnumValue(priority, PRIORITIES)) {
      return res.status(400).json({
        success: false,
        message: "Invalid priority filter",
      });
    }

    const tasks = await prisma.task.findMany({
      where: {
        projectId,
        ...(status ? { status } : {}),
        ...(priority ? { priority } : {}),
        ...(assignedToId ? { assignedToId } : {}),
      },
      include: {
        assignedTo: {
          select: { id: true, name: true, email: true },
        },
        createdBy: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: [{ status: "asc" }, { dueDate: "asc" }, { createdAt: "desc" }],
    });

    return res.status(200).json({
      success: true,
      data: tasks,
    });
  } catch (error) {
    return next(error);
  }
}

async function updateTask(req, res, next) {
  try {
    const { projectId, taskId } = req.params;
    const { title, description, status, priority, dueDate, assignedToId } = req.body;

    const existingTask = await prisma.task.findFirst({
      where: {
        id: taskId,
        projectId,
      },
      select: { id: true },
    });

    if (!existingTask) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    if (title !== undefined && !isNonEmptyString(title)) {
      return res.status(400).json({
        success: false,
        message: "Invalid title",
      });
    }

    if (status !== undefined && !isEnumValue(status, TASK_STATUSES)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task status",
      });
    }

    if (priority !== undefined && !isEnumValue(priority, PRIORITIES)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task priority",
      });
    }

    if (dueDate !== undefined && !isOptionalDate(dueDate)) {
      return res.status(400).json({
        success: false,
        message: "Invalid due date",
      });
    }

    if (assignedToId !== undefined && assignedToId !== null) {
      const assigneeMembership = await prisma.projectMember.findUnique({
        where: {
          userId_projectId: {
            userId: assignedToId,
            projectId,
          },
        },
        select: { id: true },
      });

      if (!assigneeMembership) {
        return res.status(400).json({
          success: false,
          message: "Assignee must be a member of the project",
        });
      }
    }

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        ...(title !== undefined ? { title: title.trim() } : {}),
        ...(description !== undefined
          ? { description: description?.trim() || null }
          : {}),
        ...(status !== undefined ? { status } : {}),
        ...(priority !== undefined ? { priority } : {}),
        ...(dueDate !== undefined
          ? { dueDate: dueDate ? new Date(dueDate) : null }
          : {}),
        ...(assignedToId !== undefined ? { assignedToId } : {}),
      },
      include: {
        assignedTo: {
          select: { id: true, name: true, email: true },
        },
        createdBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return res.status(200).json({
      success: true,
      message: "Task updated successfully",
      data: updatedTask,
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  createTask,
  listProjectTasks,
  updateTask,
};
