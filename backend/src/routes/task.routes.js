const express = require("express");
const {
  createTask,
  listProjectTasks,
  updateTask,
} = require("../controllers/task.controller");
const { requireAuth } = require("../middlewares/auth.middleware");
const { requireProjectMember } = require("../middlewares/project-access.middleware");

const router = express.Router();

router.use(requireAuth);
router.post("/:projectId/tasks", requireProjectMember(), createTask);
router.get("/:projectId/tasks", requireProjectMember(), listProjectTasks);
router.patch("/:projectId/tasks/:taskId", requireProjectMember(), updateTask);

module.exports = router;
