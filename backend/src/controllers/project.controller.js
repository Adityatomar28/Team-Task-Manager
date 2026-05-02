const prisma = require("../db/prisma");
const { isNonEmptyString, isEnumValue, isValidEmail } = require("../utils/validators");

const PROJECT_ROLES = ["ADMIN", "MEMBER"];

async function createProject(req, res, next) {
  try {
    const { name, description } = req.body;

    if (!isNonEmptyString(name)) {
      return res.status(400).json({
        success: false,
        message: "Project name is required",
      });
    }

    const project = await prisma.project.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        ownerId: req.user.id,
        members: {
          create: {
            userId: req.user.id,
            role: "ADMIN",
          },
        },
      },
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return res.status(201).json({
      success: true,
      message: "Project created successfully",
      data: project,
    });
  } catch (error) {
    return next(error);
  }
}

async function listProjects(req, res, next) {
  try {
    const projects = await prisma.project.findMany({
      where: {
        OR: [
          { ownerId: req.user.id },
          { members: { some: { userId: req.user.id } } },
        ],
      },
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
        _count: {
          select: { members: true, tasks: true },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      data: projects,
    });
  } catch (error) {
    return next(error);
  }
}

async function getProjectDetails(req, res, next) {
  try {
    const { projectId } = req.params;
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
        tasks: {
          include: {
            assignedTo: {
              select: { id: true, name: true, email: true },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: project,
    });
  } catch (error) {
    return next(error);
  }
}

async function addProjectMember(req, res, next) {
  try {
    const { projectId } = req.params;
    const { email, userId, role } = req.body;

    if (!email && !userId) {
      return res.status(400).json({
        success: false,
        message: "Either email or userId is required",
      });
    }

    if (email && !isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email",
      });
    }

    if (role && !isEnumValue(role, PROJECT_ROLES)) {
      return res.status(400).json({
        success: false,
        message: "Invalid project role",
      });
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          ...(userId ? [{ id: userId }] : []),
          ...(email ? [{ email: email.toLowerCase() }] : []),
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const existingMember = await prisma.projectMember.findUnique({
      where: {
        userId_projectId: {
          userId: user.id,
          projectId,
        },
      },
      select: { id: true },
    });

    if (existingMember) {
      return res.status(409).json({
        success: false,
        message: "User is already a project member",
      });
    }

    const membership = await prisma.projectMember.create({
      data: {
        projectId,
        userId: user.id,
        role: role || "MEMBER",
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return res.status(201).json({
      success: true,
      message: "Project member added",
      data: membership,
    });
  } catch (error) {
    return next(error);
  }
}

async function updateProjectMemberRole(req, res, next) {
  try {
    const { projectId, memberId } = req.params;
    const { role } = req.body;

    if (!isEnumValue(role, PROJECT_ROLES)) {
      return res.status(400).json({
        success: false,
        message: "Invalid project role",
      });
    }

    const membership = await prisma.projectMember.findFirst({
      where: {
        id: memberId,
        projectId,
      },
      select: {
        id: true,
        userId: true,
      },
    });

    if (!membership) {
      return res.status(404).json({
        success: false,
        message: "Project member not found",
      });
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { ownerId: true },
    });

    if (project?.ownerId === membership.userId && role !== "ADMIN") {
      return res.status(400).json({
        success: false,
        message: "Project owner must remain ADMIN",
      });
    }

    const updatedMembership = await prisma.projectMember.update({
      where: { id: memberId },
      data: { role },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return res.status(200).json({
      success: true,
      message: "Member role updated",
      data: updatedMembership,
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  createProject,
  listProjects,
  getProjectDetails,
  addProjectMember,
  updateProjectMemberRole,
};
