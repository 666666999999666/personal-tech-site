"use client";

import {
  Lightbulb,
  Info,
  AlertTriangle,
  OctagonAlert,
} from "lucide-react";
import { useTranslations } from "next-intl";

type CalloutType = "tip" | "info" | "warning" | "danger";

const calloutConfig: Record<
  CalloutType,
  { icon: React.ElementType; className: string }
> = {
  tip: {
    icon: Lightbulb,
    className:
      "border-emerald-500/30 bg-emerald-500/5 text-emerald-800 dark:text-emerald-200",
  },
  info: {
    icon: Info,
    className:
      "border-blue-500/30 bg-blue-500/5 text-blue-800 dark:text-blue-200",
  },
  warning: {
    icon: AlertTriangle,
    className:
      "border-amber-500/30 bg-amber-500/5 text-amber-800 dark:text-amber-200",
  },
  danger: {
    icon: OctagonAlert,
    className:
      "border-red-500/30 bg-red-500/5 text-red-800 dark:text-red-200",
  },
};

interface CalloutProps {
  type?: CalloutType;
  children: React.ReactNode;
}

export function Callout({ type = "info", children }: CalloutProps) {
  const t = useTranslations();
  const config = calloutConfig[type];
  const Icon = config.icon;

  const labelKey = `components.${type}` as const;

  return (
    <div
      className={`my-4 rounded-lg border p-4 ${config.className}`}
      data-callout={type}
    >
      <div className="flex items-center gap-2 font-semibold text-sm mb-2">
        <Icon className="size-4" />
        {t(labelKey)}
      </div>
      <div className="text-sm [&>p]:m-0">{children}</div>
    </div>
  );
}

export function parseCalloutType(
  children: React.ReactNode
): { type: CalloutType; rest: React.ReactNode } | null {
  const text = extractText(children);
  const match = text?.match(/^\[!(tip|info|warning|danger)\]\s*/i);
  if (!match) return null;

  const type = match[1].toLowerCase() as CalloutType;
  const rest = removeCalloutPrefix(children, match[0].length);
  return { type, rest };
}

function extractText(node: React.ReactNode): string {
  if (typeof node === "string") return node;
  if (typeof node === "number") return String(node);
  if (!node) return "";
  if (Array.isArray(node)) return node.map(extractText).join("");
  if (typeof node === "object" && node !== null && "props" in node) {
    return extractText(
      (node as React.ReactElement<{ children?: React.ReactNode }>).props
        .children
    );
  }
  return "";
}

function removeCalloutPrefix(
  node: React.ReactNode,
  prefixLength: number
): React.ReactNode {
  if (typeof node === "string") {
    return node.slice(prefixLength);
  }
  if (Array.isArray(node)) {
    let remaining = prefixLength;
    return node.map((child) => {
      const text = extractText(child);
      const len = text.length;
      if (remaining <= 0) return child;
      const result = removeCalloutPrefix(child, remaining);
      remaining -= len;
      return result;
    });
  }
  if (typeof node === "object" && node !== null && "props" in node) {
    const el = node as React.ReactElement<Record<string, unknown>>;
    return {
      ...el,
      props: {
        ...(el.props as Record<string, unknown>),
        children: removeCalloutPrefix(el.props.children as React.ReactNode, prefixLength),
      },
    };
  }
  return node;
}
