"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkFootnotes from "remark-footnotes";
import rehypeHighlight from "rehype-highlight";
import rehypeKatex from "rehype-katex";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import { useState, useCallback } from "react";
import { CodeBlock } from "./CodeBlock";
import { Callout, parseCalloutType } from "./Callout";
import { Lightbox } from "@/components/ui/Lightbox";

import "highlight.js/styles/github-dark.css";
import "katex/dist/katex.min.css";

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const [lightboxState, setLightboxState] = useState<{
    src: string;
    alt: string;
    open: boolean;
  } | null>(null);

  const handleImageClick = useCallback((src: string, alt: string) => {
    setLightboxState({ src, alt, open: true });
  }, []);

  const closeLightbox = useCallback(() => {
    setLightboxState(null);
  }, []);

  return (
    <>
      <div className="prose prose-neutral dark:prose-invert max-w-none prose-headings:scroll-mt-16 prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-img:rounded-lg prose-pre:bg-transparent prose-pre:p-0">
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkMath, remarkFootnotes as unknown as typeof remarkGfm]}
          rehypePlugins={[
            rehypeHighlight,
            rehypeKatex,
            rehypeSlug,
            [rehypeAutolinkHeadings, { behavior: "wrap" }],
          ]}
          components={{
            pre({ children, ...props }) {
              const child = children && React.Children.toArray(children)[0];
              if (child && typeof child === "object" && "props" in child) {
                const codeProps = (child as React.ReactElement<{
                  className?: string;
                  children?: React.ReactNode;
                  title?: string;
                }>).props;
                return (
                  <CodeBlock className={codeProps.className} title={codeProps.title}>
                    {codeProps.children}
                  </CodeBlock>
                );
              }
              return <pre {...props}>{children}</pre>;
            },

            code({ className, children, ...props }) {
              const isInline = !className;
              if (isInline) {
                return (
                  <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono" {...props}>
                    {children}
                  </code>
                );
              }
              return (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            },

            blockquote({ children, ...props }) {
              const parsed = parseCalloutType(children);
              if (parsed) {
                return <Callout type={parsed.type}>{parsed.rest}</Callout>;
              }
              return <blockquote {...props}>{children}</blockquote>;
            },

            img({ src, alt, ...props }) {
              const srcStr = typeof src === "string" ? src : "";
              if (!srcStr) return null;
              return (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={srcStr}
                  alt={alt || ""}
                  className="cursor-zoom-in"
                  onClick={() => handleImageClick(srcStr, alt || "")}
                  loading="lazy"
                  {...props}
                />
              );
            },

            a({ href, children, ...props }) {
              if (href?.startsWith("#")) {
                return (
                  <a href={href} {...props}>
                    {children}
                  </a>
                );
              }
              return (
                <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
                  {children}
                </a>
              );
            },

            table({ children, ...props }) {
              return (
                <div className="overflow-x-auto my-6">
                  <table {...props}>{children}</table>
                </div>
              );
            },
          }}
        >
          {content}
        </ReactMarkdown>
      </div>

      {lightboxState?.open && (
        <Lightbox src={lightboxState.src} alt={lightboxState.alt} onClose={closeLightbox} />
      )}
    </>
  );
}
