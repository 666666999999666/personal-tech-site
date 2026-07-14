const express = require('express');
const router = express.Router();
const agentController = require('../controllers/agentController');

// 非流式聊天（兼容旧接口）
router.post('/chat', agentController.chat);

// SSE 流式聊天
router.post('/chat/stream', agentController.chatStream);

module.exports = router;
