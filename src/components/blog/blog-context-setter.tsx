"use client";

import { useSetAgentContext } from "@/components/agent-context-provider";
import { useEffect } from "react";

interface BlogContextSetterProps {
  title: string;
  slug: string;
  tags?: string[];
  category?: string;
  publishedAt?: string;
  readingTime?: number;
}

export function BlogContextSetter({
  title,
  slug,
  tags,
  category,
  publishedAt,
  readingTime,
}: BlogContextSetterProps) {
  const setPageContext = useSetAgentContext();

  useEffect(() => {
    setPageContext({
      type: "blog-post",
      title,
      slug,
      metadata: {
        tags: tags ?? [],
        category: category ?? undefined,
        publishedAt: publishedAt ?? undefined,
        readingTime: readingTime ?? undefined,
      },
    });
  }, [title, slug, tags, category, publishedAt, readingTime, setPageContext]);

  return null;
}
