// Agent 服务 - Phase 5 SSE 流式通信
// 模拟 LLM 流式响应

const agentService = {
  /**
   * 模拟流式响应
   * @param {string} message - 用户消息
   * @param {Function} onChunk - 每收到一个 chunk 的回调
   */
  chatStream: async (message, onChunk) => {
    const response = `收到你的问题：**"${message}"**

我来为你详细解答：

## 分析

这是一个很好的问题。让我从几个角度来回答：

1. **核心概念**: 理解问题的本质
2. **实现思路**: 具体的实现步骤
3. **最佳实践**: 推荐的做法

## 详细解答

javascript
// 示例代码
function example() {
  console.log("这是一个示例");
}


## 总结

希望这个回答对你有帮助！如果有其他问题，欢迎继续提问。

---
*这是模拟的流式响应，实际接入 LLM 后会显示真实的 AI 回答。*`;

    // 模拟流式输出：将响应分成多个 chunk
    const chunks = response.split(/(?<=\n)/); // 按行分割
    const delay = 50; // 每 chunk 间隔 50ms

    for (const chunk of chunks) {
      if (chunk.trim()) {
        await new Promise(resolve => setTimeout(resolve, delay));
        onChunk(chunk);
      }
    }
  },

  /**
   * 非流式响应（兼容旧接口）
   */
  chat: async (message) => {
    return `收到消息："${message}"\n\n（这是模拟响应，Phase 5 已支持 SSE 流式通信）`;
  },
};

module.exports = agentService;
