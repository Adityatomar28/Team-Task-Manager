const prisma = require("../db/prisma");

async function getDashboardOverview(req, res, next) {
  try {
    const now = new Date();
    const userId = req.user.id;

    const [
      totalProjects,
      totalAssignedTasks,
      todoTasks,
      inProgressTasks,
      doneTasks,
      overdueTasks,
    ] = await Promise.all([
      prisma.project.count({
        where: {
          OR: [{ ownerId: userId }, { members: { some: { userId } } }],
        },
      }),
      prisma.task.count({
        where: { assignedToId: userId },
      }),
      prisma.task.count({
        where: { assignedToId: userId, status: "TODO" },
      }),
      prisma.task.count({
        where: { assignedToId: userId, status: "IN_PROGRESS" },
      }),
      prisma.task.count({
        where: { assignedToId: userId, status: "DONE" },
      }),
      prisma.task.count({
        where: {
          assignedToId: userId,
          status: { not: "DONE" },
          dueDate: { lt: now },
        },
      }),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        projects: totalProjects,
        assignedTasks: totalAssignedTasks,
        statusBreakdown: {
          TODO: todoTasks,
          IN_PROGRESS: inProgressTasks,
          DONE: doneTasks,
        },
        overdueTasks,
      },
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getDashboardOverview,
};
