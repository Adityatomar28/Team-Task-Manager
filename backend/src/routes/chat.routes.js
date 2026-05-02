const express = require("express");
const { sendChatMessage } = require("../controllers/chat.controller");
const { requireAuth } = require("../middlewares/auth.middleware");

const router = express.Router();

router.post("/", requireAuth, sendChatMessage);

module.exports = router;
