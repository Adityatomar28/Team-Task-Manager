const express = require("express");
const {
  createProject,
  listProjects,
  getProjectDetails,
  addProjectMember,
  updateProjectMemberRole,
  deleteProject,
  removeProjectMember,
} = require("../controllers/project.controller");
const { requireAuth } = require("../middlewares/auth.middleware");
const {
  requireProjectAdmin,
  requireProjectMember,
} = require("../middlewares/project-access.middleware");

const router = express.Router();

router.use(requireAuth);
router.post("/", createProject);
router.get("/", listProjects);
router.get("/:projectId", requireProjectMember(), getProjectDetails);
router.post("/:projectId/members", requireProjectAdmin(), addProjectMember);
router.delete("/:projectId", requireProjectAdmin(), deleteProject);
router.patch(
  "/:projectId/members/:memberId/role",
  requireProjectAdmin(),
  updateProjectMemberRole
);
router.delete(
  "/:projectId/members/:memberId",
  requireProjectAdmin(),
  removeProjectMember
);

module.exports = router;
