"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useTranslations } from "next-intl";

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  items: TocItem[];
}

export function TableOfContents({ items }: TableOfContentsProps) {
  const t = useTranslations("components");
  const [activeId, setActiveId] = useState<string>("");
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (items.length === 0) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      {
        rootMargin: "-80px 0px -80% 0px",
        threshold: 0,
      }
    );

    for (const item of items) {
      const element = document.getElementById(item.id);
      if (element) observerRef.current.observe(element);
    }

    return () => {
      observerRef.current?.disconnect();
    };
  }, [items]);

  const handleClick = useCallback((id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  if (items.length === 0) return null;

  return (
    <nav className="sticky top-20" aria-label="Table of contents">
      <h4 className="mb-3 text-sm font-semibold text-foreground">
        {t("onThisPage")}
      </h4>
      <ul className="space-y-1 text-sm">
        {items.map((item) => (
          <li key={item.id}>
            <button
              onClick={() => handleClick(item.id)}
              className={`block w-full text-left py-1 transition-colors hover:text-foreground ${
                item.level === 3 ? "pl-4" : ""
              } ${
                activeId === item.id
                  ? "text-foreground font-medium"
                  : "text-muted-foreground"
              }`}
            >
              {item.text}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export type { TocItem };
