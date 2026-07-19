"use client";

import { useState, useCallback } from "react";
import { Check, Copy } from "lucide-react";
import { useTranslations } from "next-intl";

interface CodeBlockProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
}

function extractText(node: React.ReactNode): string {
  if (typeof node === "string") return node;
  if (typeof node === "number") return String(node);
  if (!node) return "";
  if (Array.isArray(node)) return node.map(extractText).join("");
  if (typeof node === "object" && "props" in node) {
    return extractText((node as React.ReactElement<Record<string, unknown>>).props.children as React.ReactNode);
  }
  return "";
}

export function CodeBlock({ children, className, title }: CodeBlockProps) {
  const t = useTranslations();
  const [copied, setCopied] = useState(false);

  const language = className?.replace("language-", "") || "";
  const displayTitle = title || language.toUpperCase();

  const handleCopy = useCallback(() => {
    const text = extractText(children);
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [children]);

  return (
    <div className="group relative my-6 overflow-hidden rounded-lg border border-border bg-zinc-950 dark:bg-zinc-900">
      <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-2">
        <span className="text-xs font-medium text-zinc-400">{displayTitle}</span>
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
          aria-label={t("components.copyCode")}
        >
          {copied ? (
            <>
              <Check className="size-3" />
              {t("components.copied")}
            </>
          ) : (
            <>
              <Copy className="size-3" />
              {t("components.copy")}
            </>
          )}
        </button>
      </div>
      <div className="overflow-x-auto">
        <div className="relative">
          {/* Line numbers column */}
          <div
            className="absolute left-0 top-0 flex flex-col items-end py-4 pr-2 pl-4 text-xs leading-6 text-zinc-600 select-none"
            aria-hidden="true"
          >
            {Array.from(
              { length: String(children).split("\n").length },
              (_, i) => (
                <span key={i}>{i + 1}</span>
              )
            )}
          </div>
          <div className="py-4 pl-12 pr-4">
            <code className={className}>{children}</code>
          </div>
        </div>
      </div>
    </div>
  );
}
