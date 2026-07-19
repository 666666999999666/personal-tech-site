"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { useAgentContext } from "@/components/agent-context-provider";
import { getSuggestions } from "@/lib/agent/suggestions";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const t = useTranslations();
  const locale = useLocale();
  const pageContext = useAgentContext();
  const suggestions = getSuggestions(pageContext, locale);

  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<"idle" | "responding">("idle");

  const inputRef = useRef<HTMLInputElement>(null);
  const responseRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Reset state when palette opens (React-recommended pattern for adjusting state when prop changes)
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setInput("");
      setResponse("");
      setIsLoading(false);
      setMode("idle");
    }
  }

  // Focus input when opening
  useEffect(() => {
    if (open) {
      // Small delay so the portal renders first
      requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
    }
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  const sendMessage = useCallback(
    async (message: string) => {
      if (!message.trim() || isLoading) return;

      setInput("");
      setResponse("");
      setIsLoading(true);
      setMode("responding");

      abortRef.current = new AbortController();

      try {
        const res = await fetch("/api/agent/run", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: message.trim(),
            pageContext,
            locale,
          }),
          signal: abortRef.current.signal,
        });

        if (!res.ok) {
          setResponse(t("agent.errorFailed"));
          setIsLoading(false);
          return;
        }

        const reader = res.body?.getReader();
        if (!reader) {
          setResponse("Error: No response stream");
          setIsLoading(false);
          return;
        }

        const decoder = new TextDecoder();
        let accumulated = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          // Parse AI SDK text stream format: lines like "0:..." or data lines
          const lines = chunk.split("\n");
          for (const line of lines) {
            if (line.startsWith("0:")) {
              try {
                const text = JSON.parse(line.slice(2));
                accumulated += text;
              } catch {
                // Skip malformed lines
              }
            } else if (line.startsWith("data:")) {
              try {
                const data = JSON.parse(line.slice(5));
                if (typeof data === "string") {
                  accumulated += data;
                }
              } catch {
                // Skip
              }
            }
          }
          setResponse(accumulated);
        }
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setResponse(t("agent.errorWrong"));
        }
      } finally {
        setIsLoading(false);
      }
    },
    [pageContext, isLoading, locale, t]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleSuggestionClick = (action: string) => {
    sendMessage(action);
  };

  // Click outside to close
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]"
      onClick={handleOverlayClick}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-2xl mx-4 rounded-xl border border-border bg-background shadow-2xl overflow-hidden">
        {/* Search / Chat Input */}
        <form onSubmit={handleSubmit} className="flex items-center border-b border-border px-4">
          <svg
            className="size-4 shrink-0 text-muted-foreground mr-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t("agent.askAnything")}
            className="flex-1 bg-transparent py-4 text-sm outline-none placeholder:text-muted-foreground"
          />
          {isLoading && (
            <div className="size-4 shrink-0 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
          )}
        </form>

        {/* Content area */}
        <div className="max-h-[60vh] overflow-y-auto">
          {mode === "idle" ? (
            /* Suggestions */
            <div className="p-2">
              <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                {t("agent.suggestions")}
              </div>
              {suggestions.map((suggestion, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSuggestionClick(suggestion.action)}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-foreground hover:bg-muted transition-colors text-left"
                >
                  <span className="flex size-5 items-center justify-center rounded bg-muted text-xs text-muted-foreground">
                    {suggestion.icon || "→"}
                  </span>
                  <span>{suggestion.label}</span>
                </button>
              ))}
            </div>
          ) : (
            /* Response area */
            <div ref={responseRef} className="p-4">
              {response ? (
                <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap text-sm leading-relaxed">
                  {response}
                </div>
              ) : isLoading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="flex gap-1">
                    <span className="size-1.5 rounded-full bg-current animate-bounce [animation-delay:0ms]" />
                    <span className="size-1.5 rounded-full bg-current animate-bounce [animation-delay:150ms]" />
                    <span className="size-1.5 rounded-full bg-current animate-bounce [animation-delay:300ms]" />
                  </div>
                  <span>{t("agent.thinking")}</span>
                </div>
              ) : null}
            </div>
          )}
        </div>

        {/* Footer hint */}
        <div className="border-t border-border px-4 py-2 flex items-center justify-between text-xs text-muted-foreground">
          <span>{t("agent.sendHint")}</span>
          <kbd className="rounded border border-border px-1.5 py-0.5 text-[10px] font-mono">
            ⌘K
          </kbd>
        </div>
      </div>
    </div>,
    document.body
  );
}
