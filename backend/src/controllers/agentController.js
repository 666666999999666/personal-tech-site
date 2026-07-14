const agentService = require('../services/agentService');

const agentController = {
  /**
   * 非流式聊天（兼容旧接口）
   */
  chat: async (req, res) => {
    const { message } = req.body;
    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ message: 'message 字段不能为空' });
    }
    try {
      const response = await agentService.chat(message.trim());
      res.json({ response });
    } catch (error) {
      res.status(500).json({ message: 'Agent 服务错误' });
    }
  },

  /**
   * SSE 流式聊天
   * 使用 Server-Sent Events 实现流式输出
   */
  chatStream: async (req, res) => {
    const { message } = req.body;
    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ message: 'message 字段不能为空' });
    }

    // 设置 SSE 响应头
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // 监听客户端断连
    let clientDisconnected = false;
    req.on('close', () => {
      clientDisconnected = true;
    });

    try {
      // 发送开始标记
      res.write(`data: ${JSON.stringify({ type: 'start' })}\n\n`);

      let fullResponse = '';

      // 调用流式服务
      await agentService.chatStream(message.trim(), (chunk) => {
        // 客户端已断连，停止发送
        if (clientDisconnected) return;
        fullResponse += chunk;
        res.write(`data: ${JSON.stringify({ type: 'chunk', content: chunk })}\n\n`);
      });

      if (!clientDisconnected) {
        // 发送结束标记
        res.write(`data: ${JSON.stringify({ type: 'end', fullResponse })}\n\n`);
        res.end();
      }
    } catch (error) {
      if (!clientDisconnected) {
        res.write(`data: ${JSON.stringify({ type: 'error', message: '服务内部错误' })}\n\n`);
        res.end();
      }
    }
  },
};

module.exports = agentController;
