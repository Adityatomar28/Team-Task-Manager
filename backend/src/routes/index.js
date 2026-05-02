const express = require("express");
const authRoutes = require("./auth.routes");
const projectRoutes = require("./project.routes");
const taskRoutes = require("./task.routes");
const dashboardRoutes = require("./dashboard.routes");
const chatRoutes = require("./chat.routes");

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/projects", projectRoutes);
router.use("/projects", taskRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/chat", chatRoutes);

module.exports = router;
