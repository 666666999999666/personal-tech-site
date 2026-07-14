import { useState, useRef, useEffect, useCallback } from 'react';

/**
 * Agent 交互页面 - SSE 流式通信
 * 支持实时流式输出，模拟 ChatGPT 打字效果
 */
export default function Agent() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const messagesEndRef = useRef(null);
  const abortControllerRef = useRef(null);

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 组件卸载时清理未完成的 SSE 请求
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, []);

  /**
   * 更新最后一条助手消息的辅助函数
   */
  const updateLastAssistant = useCallback((updater) => {
    setMessages(prev => {
      const newMessages = [...prev];
      const lastIndex = newMessages.length - 1;
      if (lastIndex >= 0 && newMessages[lastIndex].role === 'assistant') {
        newMessages[lastIndex] = updater(newMessages[lastIndex]);
      }
      return newMessages;
    });
  }, []);

  /**
   * 处理 SSE 数据
   */
  const handleSSEData = useCallback((data) => {
    switch (data.type) {
      case 'start':
        break;
      case 'chunk':
        updateLastAssistant(msg => ({
          ...msg,
          content: msg.content + data.content,
        }));
        break;
      case 'end':
        updateLastAssistant(msg => ({ ...msg, isStreaming: false }));
        break;
      case 'error':
        updateLastAssistant(() => ({
          role: 'assistant',
          content: '错误：' + data.message,
          isStreaming: false,
        }));
        break;
    }
  }, [updateLastAssistant]);

  /**
   * 发送消息（SSE 流式）
   */
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!input.trim() || streaming) return;

    const userMessage = input.trim();
    setInput('');

    // 添加用户消息
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    // 添加空的助手消息占位
    setMessages(prev => [...prev, { role: 'assistant', content: '', isStreaming: true }]);
    setLoading(true);
    setStreaming(true);

    // 创建 AbortController 支持中断
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const response = await fetch('/api/agent/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error('请求失败');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;


        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop();

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              handleSSEData(data);
            } catch (e) {
              // 忽略解析错误
            }
          }
        }
      }

      // 处理剩余数据
      if (buffer.startsWith('data: ')) {
        try {
          const data = JSON.parse(buffer.slice(6));
          handleSSEData(data);
        } catch (e) {
          // 忽略
        }
      }

    } catch (err) {
      if (err.name === 'AbortError') {
        // 用户主动中断
        updateLastAssistant(msg => ({ ...msg, isStreaming: false }));
      } else {
        updateLastAssistant(() => ({
          role: 'assistant',
          content: '抱歉，出现了错误：' + err.message,
          isStreaming: false,
        }));
      }
    } finally {
      setLoading(false);
      setStreaming(false);
      abortControllerRef.current = null;
    }
  }, [input, streaming, handleSSEData, updateLastAssistant]);

  /**
   * 中断当前流式请求
   */
  const handleStop = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  return (
    <div className="agent-page">
      <h1>AI Agent 交互</h1>
      <p className="agent-subtitle">基于 SSE 流式通信，实时展示 AI 回答</p>

      <div className="chat-container">
        <div className="messages" role="log" aria-label="对话消息">
          {messages.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">🤖</div>
              <p>开始与 AI Agent 对话...</p>
              <div className="empty-tips">
                <p>你可以问：</p>
                <ul>
                  <li>"什么是 React Router？"</li>
                  <li>"解释一下状态管理"</li>
                  <li>"如何设计 RESTful API？"</li>
                </ul>
              </div>
            </div>
          )}

          {messages.map((msg, index) => (
            <div
              key={index}
              className={`message ${msg.role} ${msg.isStreaming ? 'streaming' : ''}`}
            >
              <div className="message-avatar" aria-hidden="true">
                {msg.role === 'user' ? '👤' : '🤖'}
              </div>
              <div className="message-body">
                <div className="message-role">
                  {msg.role === 'user' ? '你' : 'AI Agent'}
                </div>
                <div className="message-content">
                  {msg.content || (msg.isStreaming ? <span className="typing">思考中...</span> : '')}
                  {msg.isStreaming && <span className="typing-cursor" aria-hidden="true">|</span>}
                </div>
              </div>
            </div>
          ))}

          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSubmit} className="input-area" aria-label="发送消息">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={streaming ? 'AI 正在回答...' : '输入消息...'}
            disabled={streaming}
            aria-label="消息输入框"
          />
          {streaming ? (
            <button type="button" onClick={handleStop} className="stop-btn">
              停止
            </button>
          ) : (
            <button type="submit" disabled={!input.trim()}>
              发送
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
