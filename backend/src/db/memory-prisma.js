const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const DATA_FILE = path.resolve(__dirname, "../../.dev-data.json");
const DATE_KEYS = new Set(["createdAt", "updatedAt", "joinedAt", "dueDate"]);

function reviveDates(record) {
  return Object.fromEntries(
    Object.entries(record).map(([key, value]) => [
      key,
      DATE_KEYS.has(key) && value ? new Date(value) : value,
    ])
  );
}

function loadState() {
  try {
    const parsed = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
    return {
      users: (parsed.users || []).map(reviveDates),
      projects: (parsed.projects || []).map(reviveDates),
      projectMembers: (parsed.projectMembers || []).map(reviveDates),
      tasks: (parsed.tasks || []).map(reviveDates),
    };
  } catch (error) {
    return { users: [], projects: [], projectMembers: [], tasks: [] };
  }
}

const state = loadState();
const users = state.users;
const projects = state.projects;
const projectMembers = state.projectMembers;
const tasks = state.tasks;

function saveState() {
  fs.writeFileSync(
    DATA_FILE,
    JSON.stringify({ users, projects, projectMembers, tasks }, null, 2)
  );
}

function id() {
  return crypto.randomUUID();
}

function now() {
  return new Date();
}

function pick(record, select) {
  if (!record || !select) return record || null;
  return Object.fromEntries(
    Object.keys(select)
      .filter((key) => select[key])
      .map((key) => [key, record[key]])
  );
}

function userPublic(user) {
  return pick(user, { id: true, name: true, email: true, globalRole: true });
}

function matchesUserWhere(user, where = {}) {
  if (where.id && user.id !== where.id) return false;
  if (where.email && user.email !== where.email) return false;
  if (where.clerkId && user.clerkId !== where.clerkId) return false;
  if (where.OR) return where.OR.some((condition) => matchesUserWhere(user, condition));
  return true;
}

function matchesProjectWhere(project, where = {}) {
  if (where.id && project.id !== where.id) return false;
  if (where.ownerId && project.ownerId !== where.ownerId) return false;
  if (where.members?.some?.userId) {
    return projectMembers.some(
      (member) => member.projectId === project.id && member.userId === where.members.some.userId
    );
  }
  if (where.OR) return where.OR.some((condition) => matchesProjectWhere(project, condition));
  return true;
}

function matchesTaskWhere(task, where = {}) {
  if (where.id && task.id !== where.id) return false;
  if (where.projectId && task.projectId !== where.projectId) return false;
  if (where.assignedToId && task.assignedToId !== where.assignedToId) return false;
  if (where.status && typeof where.status === "string" && task.status !== where.status) return false;
  if (where.status?.not && task.status === where.status.not) return false;
  if (where.priority && task.priority !== where.priority) return false;
  if (where.dueDate?.lt && (!task.dueDate || task.dueDate >= where.dueDate.lt)) return false;
  return true;
}

function matchesProjectMemberWhere(member, where = {}) {
  if (where.id && member.id !== where.id) return false;
  if (where.projectId && member.projectId !== where.projectId) return false;
  if (where.userId && member.userId !== where.userId) return false;
  if (where.userId_projectId) {
    return member.userId === where.userId_projectId.userId && member.projectId === where.userId_projectId.projectId;
  }
  return true;
}

function includeProject(project, include = {}) {
  const result = { ...project };

  if (include.owner) {
    result.owner = pick(users.find((user) => user.id === project.ownerId), include.owner.select);
  }

  if (include.members) {
    result.members = projectMembers
      .filter((member) => member.projectId === project.id)
      .map((member) => ({
        ...member,
        ...(include.members.include?.user
          ? { user: pick(users.find((user) => user.id === member.userId), include.members.include.user.select) }
          : {}),
      }));
  }

  if (include.tasks) {
    result.tasks = tasks
      .filter((task) => task.projectId === project.id)
      .sort((a, b) => b.createdAt - a.createdAt)
      .map((task) => includeTask(task, include.tasks.include || {}));
  }

  if (include._count) {
    result._count = {
      members: projectMembers.filter((member) => member.projectId === project.id).length,
      tasks: tasks.filter((task) => task.projectId === project.id).length,
    };
  }

  return result;
}

function includeTask(task, include = {}) {
  return {
    ...task,
    ...(include.assignedTo
      ? { assignedTo: pick(users.find((user) => user.id === task.assignedToId), include.assignedTo.select) }
      : {}),
    ...(include.createdBy
      ? { createdBy: pick(users.find((user) => user.id === task.createdById), include.createdBy.select) }
      : {}),
  };
}

function includeMembership(member, include = {}) {
  return {
    ...member,
    ...(include.user ? { user: pick(users.find((user) => user.id === member.userId), include.user.select) } : {}),
  };
}

const memoryPrisma = {
  user: {
    async findUnique({ where, select }) {
      return pick(users.find((user) => matchesUserWhere(user, where)), select);
    },
    async findFirst({ where, select }) {
      return pick(users.find((user) => matchesUserWhere(user, where)), select);
    },
    async create({ data, select }) {
      const user = {
        id: id(),
        clerkId: data.clerkId || null,
        name: data.name,
        email: data.email,
        password: data.password,
        globalRole: data.globalRole || "MEMBER",
        createdAt: now(),
        updatedAt: now(),
      };
      users.push(user);
      saveState();
      return pick(user, select);
    },
    async update({ where, data, select }) {
      const user = users.find((candidate) => matchesUserWhere(candidate, where));
      if (!user) return null;
      Object.assign(user, data, { updatedAt: now() });
      saveState();
      return pick(user, select);
    },
    async upsert({ where, update, create, select }) {
      const user = users.find((candidate) => matchesUserWhere(candidate, where));
      if (user) {
        Object.assign(user, update, { updatedAt: now() });
        return pick(user, select);
      }
      return memoryPrisma.user.create({ data: create, select });
    },
  },
  project: {
    async count({ where }) {
      return projects.filter((project) => matchesProjectWhere(project, where)).length;
    },
    async create({ data, include }) {
      const project = {
        id: id(),
        name: data.name,
        description: data.description || null,
        ownerId: data.ownerId,
        createdAt: now(),
        updatedAt: now(),
      };
      projects.push(project);
      if (data.members?.create) {
        projectMembers.push({
          id: id(),
          userId: data.members.create.userId,
          projectId: project.id,
          role: data.members.create.role || "MEMBER",
          joinedAt: now(),
        });
      }
      saveState();
      return includeProject(project, include);
    },
    async findMany({ where, include }) {
      return projects
        .filter((project) => matchesProjectWhere(project, where))
        .sort((a, b) => b.updatedAt - a.updatedAt)
        .map((project) => includeProject(project, include));
    },
    async findUnique({ where, select, include }) {
      const project = projects.find((candidate) => matchesProjectWhere(candidate, where));
      if (!project) return null;
      return include ? includeProject(project, include) : pick(project, select);
    },
    async delete({ where }) {
      const projectIndex = projects.findIndex((candidate) => matchesProjectWhere(candidate, where));
      if (projectIndex === -1) return null;
      const [project] = projects.splice(projectIndex, 1);

      for (let index = projectMembers.length - 1; index >= 0; index -= 1) {
        if (projectMembers[index].projectId === project.id) projectMembers.splice(index, 1);
      }

      for (let index = tasks.length - 1; index >= 0; index -= 1) {
        if (tasks[index].projectId === project.id) tasks.splice(index, 1);
      }

      saveState();
      return project;
    },
  },
  projectMember: {
    async findUnique({ where, select }) {
      return pick(projectMembers.find((member) => matchesProjectMemberWhere(member, where)), select);
    },
    async findFirst({ where, select }) {
      return pick(projectMembers.find((member) => matchesProjectMemberWhere(member, where)), select);
    },
    async create({ data, include }) {
      const member = {
        id: id(),
        projectId: data.projectId,
        userId: data.userId,
        role: data.role || "MEMBER",
        joinedAt: now(),
      };
      projectMembers.push(member);
      saveState();
      return includeMembership(member, include);
    },
    async update({ where, data, include }) {
      const member = projectMembers.find((candidate) => matchesProjectMemberWhere(candidate, where));
      if (!member) return null;
      Object.assign(member, data);
      saveState();
      return includeMembership(member, include);
    },
    async delete({ where }) {
      const memberIndex = projectMembers.findIndex((candidate) => matchesProjectMemberWhere(candidate, where));
      if (memberIndex === -1) return null;
      const [member] = projectMembers.splice(memberIndex, 1);

      tasks.forEach((task) => {
        if (task.assignedToId === member.userId && task.projectId === member.projectId) {
          task.assignedToId = null;
          task.updatedAt = now();
        }
      });

      saveState();
      return member;
    },
  },
  task: {
    async count({ where }) {
      return tasks.filter((task) => matchesTaskWhere(task, where)).length;
    },
    async create({ data, include }) {
      const task = {
        id: id(),
        projectId: data.projectId,
        title: data.title,
        description: data.description || null,
        status: data.status || "TODO",
        priority: data.priority || "MEDIUM",
        dueDate: data.dueDate || null,
        assignedToId: data.assignedToId || null,
        createdById: data.createdById,
        createdAt: now(),
        updatedAt: now(),
      };
      tasks.push(task);
      saveState();
      return includeTask(task, include);
    },
    async findMany({ where, include }) {
      return tasks
        .filter((task) => matchesTaskWhere(task, where))
        .sort((a, b) => b.createdAt - a.createdAt)
        .map((task) => includeTask(task, include));
    },
    async findFirst({ where, select }) {
      return pick(tasks.find((task) => matchesTaskWhere(task, where)), select);
    },
    async update({ where, data, include }) {
      const task = tasks.find((candidate) => matchesTaskWhere(candidate, where));
      if (!task) return null;
      Object.assign(task, data, { updatedAt: now() });
      saveState();
      return includeTask(task, include);
    },
  },
  async $disconnect() {},
};

module.exports = memoryPrisma;
