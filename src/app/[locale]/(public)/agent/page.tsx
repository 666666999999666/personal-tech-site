"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useAgentContext } from "@/components/agent-context-provider";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";

interface Session {
  id: string;
  title: string | null;
  createdAt: string;
  updatedAt: string;
  lastMessageAt: string | null;
}

interface Message {
  id: string;
  sessionId: string;
  role: "user" | "assistant" | "tool";
  content: string | null;
  toolCallId: string | null;
  createdAt: string;
}

export default function AgentPage() {
  const t = useTranslations();
  const locale = useLocale();
  const pageContext = useAgentContext();

  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const fetchSessions = useCallback(async () => {
    try {
      const res = await fetch("/api/agent/sessions");
      if (res.ok) {
        const data = await res.json();
        setSessions(data);
      }
    } catch {
      // Silently fail
    }
  }, []);

  // Fetch sessions on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/agent/sessions");
        if (!cancelled && res.ok) {
          const data = await res.json();
          setSessions(data);
        }
      } catch {
        // Silently fail
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingText]);

  const loadSession = useCallback(async (sessionId: string) => {
    try {
      const res = await fetch(`/api/agent/sessions/${sessionId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
        setActiveSessionId(sessionId);
        setStreamingText("");
      }
    } catch {
      // Silently fail
    }
  }, []);

  const createNewChat = async () => {
    try {
      const res = await fetch("/api/agent/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: t("agent.newChat") }),
      });
      if (res.ok) {
        const newSession = await res.json();
        setSessions((prev) => [newSession, ...prev]);
        setActiveSessionId(newSession.id);
        setMessages([]);
        setStreamingText("");
        inputRef.current?.focus();
      }
    } catch {
      // Silently fail
    }
  };

  const deleteSession = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/agent/sessions/${sessionId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setSessions((prev) => prev.filter((s) => s.id !== sessionId));
        if (activeSessionId === sessionId) {
          setActiveSessionId(null);
          setMessages([]);
          setStreamingText("");
        }
      }
    } catch {
      // Silently fail
    }
  };

  const sendMessage = async () => {
    const message = input.trim();
    if (!message || isLoading) return;

    // Add user message locally
    const userMessage: Message = {
      id: `temp-${Date.now()}`,
      sessionId: activeSessionId || "",
      role: "user",
      content: message,
      toolCallId: null,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setStreamingText("");

    abortRef.current = new AbortController();

    try {
      const res = await fetch("/api/agent/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          pageContext,
          sessionId: activeSessionId,
          locale,
        }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) {
        setMessages((prev) => [
          ...prev,
          {
            id: `error-${Date.now()}`,
            sessionId: activeSessionId || "",
            role: "assistant",
            content: t("agent.errorFailed"),
            toolCallId: null,
            createdAt: new Date().toISOString(),
          },
        ]);
        setIsLoading(false);
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) {
        setIsLoading(false);
        return;
      }

      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");
        for (const line of lines) {
          if (line.startsWith("0:")) {
            try {
              const text = JSON.parse(line.slice(2));
              accumulated += text;
            } catch {
              // Skip malformed lines
            }
          }
        }
        setStreamingText(accumulated);
      }

      // Add final assistant message
      if (accumulated) {
        setMessages((prev) => [
          ...prev,
          {
            id: `resp-${Date.now()}`,
            sessionId: activeSessionId || "",
            role: "assistant",
            content: accumulated,
            toolCallId: null,
            createdAt: new Date().toISOString(),
          },
        ]);
      }
      setStreamingText("");

      // Refresh sessions list (title may have been updated)
      fetchSessions();
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setMessages((prev) => [
          ...prev,
          {
            id: `error-${Date.now()}`,
            sessionId: activeSessionId || "",
            role: "assistant",
            content: t("agent.errorWrong"),
            toolCallId: null,
            createdAt: new Date().toISOString(),
          },
        ]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {/* Sidebar */}
      <div
        className={cn(
          "flex flex-col border-r border-border bg-muted/30 transition-all duration-200",
          sidebarOpen ? "w-64" : "w-0 overflow-hidden"
        )}
      >
        {/* New Chat Button */}
        <div className="p-3 border-b border-border">
          <button
            onClick={createNewChat}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium hover:bg-muted transition-colors"
          >
            <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Chat
          </button>
        </div>

        {/* Session List */}
        <div className="flex-1 overflow-y-auto p-2">
          {sessions.length === 0 ? (
            <p className="px-3 py-4 text-xs text-muted-foreground text-center">
              {t("agent.noConversations")}
            </p>
          ) : (
            sessions.map((s) => (
              <div
                key={s.id}
                onClick={() => loadSession(s.id)}
                className={cn(
                  "group flex items-center justify-between rounded-lg px-3 py-2 text-sm cursor-pointer transition-colors",
                  activeSessionId === s.id
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                )}
              >
                <span className="truncate flex-1">{s.title || t("agent.newChat")}</span>
                <button
                  onClick={(e) => deleteSession(s.id, e)}
                  className="shrink-0 opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-destructive/10 hover:text-destructive transition-all"
                >
                  <svg className="size-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="rounded-lg p-1.5 hover:bg-muted transition-colors"
            title={t("agent.toggleSidebar")}
          >
            <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="text-sm font-medium">{t("agent.title")}</h1>
          {pageContext.type !== "unknown" && (
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
              {pageContext.type}
            </span>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 && !streamingText ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-center space-y-3">
                <div className="mx-auto size-12 rounded-full bg-muted flex items-center justify-center">
                  <svg className="size-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
                <p className="text-sm text-muted-foreground">
                  {t("agent.startConversation")}
                </p>
                <button
                  onClick={createNewChat}
                  className="text-sm text-primary hover:underline"
                >
                  {t("agent.newChat")} →
                </button>
              </div>
            </div>
          ) : (
            <div className="mx-auto max-w-3xl px-4 py-6 space-y-6">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "flex",
                    msg.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    )}
                  >
                    {msg.role === "tool" ? (
                      <span className="text-xs text-muted-foreground italic">
                        {t("agent.toolPrefix")}{msg.content}
                      </span>
                    ) : (
                      <div className="whitespace-pre-wrap">{msg.content}</div>
                    )}
                  </div>
                </div>
              ))}

              {/* Streaming text */}
              {streamingText && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] rounded-2xl bg-muted px-4 py-3 text-sm leading-relaxed">
                    <div className="whitespace-pre-wrap">{streamingText}</div>
                  </div>
                </div>
              )}

              {/* Loading indicator */}
              {isLoading && !streamingText && (
                <div className="flex justify-start">
                  <div className="rounded-2xl bg-muted px-4 py-3">
                    <div className="flex gap-1.5">
                      <span className="size-2 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:0ms]" />
                      <span className="size-2 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:150ms]" />
                      <span className="size-2 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:300ms]" />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-border p-4">
          <div className="mx-auto max-w-3xl">
            <div className="flex items-end gap-2 rounded-xl border border-border bg-background p-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t("agent.placeholder")}
                rows={1}
                className="flex-1 resize-none bg-transparent px-2 py-1.5 text-sm outline-none placeholder:text-muted-foreground max-h-32"
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = "auto";
                  target.style.height = `${Math.min(target.scrollHeight, 128)}px`;
                }}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                className="shrink-0 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/80 disabled:opacity-50 disabled:pointer-events-none transition-colors"
              >
                {t("agent.send")}
              </button>
            </div>
            <p className="mt-2 text-center text-xs text-muted-foreground">
              {t("agent.sendHint")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
