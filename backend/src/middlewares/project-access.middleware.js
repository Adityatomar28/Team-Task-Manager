const prisma = require("../db/prisma");

async function getProjectAccess(projectId, userId) {
  const membership = await prisma.projectMember.findUnique({
    where: {
      userId_projectId: {
        userId,
        projectId,
      },
    },
    select: {
      role: true,
    },
  });

  return membership;
}

function requireProjectMember() {
  return async function projectMemberGuard(req, res, next) {
    try {
      const { projectId } = req.params;

      const project = await prisma.project.findUnique({
        where: { id: projectId },
        select: { id: true, ownerId: true },
      });

      if (!project) {
        return res.status(404).json({
          success: false,
          message: "Project not found",
        });
      }

      if (project.ownerId === req.user.id || req.user.globalRole === "ADMIN") {
        req.project = project;
        return next();
      }

      const membership = await getProjectAccess(projectId, req.user.id);
      if (!membership) {
        return res.status(403).json({
          success: false,
          message: "You are not a member of this project",
        });
      }

      req.project = project;
      req.projectMembership = membership;
      return next();
    } catch (error) {
      return next(error);
    }
  };
}

function requireProjectAdmin() {
  return async function projectAdminGuard(req, res, next) {
    try {
      const { projectId } = req.params;

      const project = await prisma.project.findUnique({
        where: { id: projectId },
        select: { id: true, ownerId: true },
      });

      if (!project) {
        return res.status(404).json({
          success: false,
          message: "Project not found",
        });
      }

      if (project.ownerId === req.user.id || req.user.globalRole === "ADMIN") {
        req.project = project;
        return next();
      }

      const membership = await getProjectAccess(projectId, req.user.id);
      if (!membership || membership.role !== "ADMIN") {
        return res.status(403).json({
          success: false,
          message: "Project admin access required",
        });
      }

      req.project = project;
      req.projectMembership = membership;
      return next();
    } catch (error) {
      return next(error);
    }
  };
}

module.exports = {
  requireProjectMember,
  requireProjectAdmin,
};
