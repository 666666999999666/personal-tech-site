"use client";

import { useState, useCallback } from "react";
import { Search, X, LayoutGrid, List } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Calendar, Clock } from "lucide-react";
import { useTranslations } from "next-intl";

interface Post {
  slug: string;
  title: string;
  excerpt?: string | null;
  publishedAt?: Date | string | null;
  tags?: string[] | null;
  category?: string | null;
  readingTimeMinutes?: number | null;
}

interface CategoryInfo {
  name: string;
  count: number;
}

interface BlogSearchProps {
  posts: Post[];
  categories: CategoryInfo[];
  locale: string;
}

export function BlogSearch({ posts, categories, locale }: BlogSearchProps) {
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Post[] | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const t = useTranslations("blog");

  const handleSearch = useCallback(async (value: string) => {
    setQuery(value);
    if (!value.trim()) {
      setSearchResults(null);
      return;
    }
    try {
      const res = await fetch(`/api/blog/search?q=${encodeURIComponent(value)}`);
      const data = await res.json();
      setSearchResults(data.posts || []);
    } catch {
      setSearchResults([]);
    }
  }, []);

  const displayPosts = searchResults ?? posts;

  function formatDate(date: Date | string | null): string {
    if (!date) return "";
    return new Date(date).toLocaleDateString(locale === "zh" ? "zh-CN" : "en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }

  return (
    <>
      {/* Search bar + view toggle */}
      <div className="mb-6 flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="w-full rounded-lg border border-border/50 bg-background pl-9 pr-9 py-2 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-ring focus:border-border transition-colors"
          />
          {query && (
            <button
              onClick={() => handleSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>
        <button
          onClick={() => setViewMode(viewMode === "list" ? "grid" : "list")}
          className="inline-flex items-center justify-center rounded-lg border border-border/50 p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
          title={viewMode === "list" ? t("gridView") : t("listView")}
        >
          {viewMode === "list" ? <LayoutGrid className="size-4" /> : <List className="size-4" />}
        </button>
      </div>

      {/* Search result indicator */}
      {searchResults !== null && (
        <p className="mb-4 text-sm text-muted-foreground">
          {searchResults.length > 0
            ? t("searchResults", { count: searchResults.length })
            : t("noSearchResults")}
        </p>
      )}

      {/* Grid view: category cards */}
      {viewMode === "grid" && searchResults === null ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => (
            <Link
              key={cat.name}
              href={`/blog?category=${encodeURIComponent(cat.name)}`}
              className="group rounded-lg border border-border/50 p-5 transition-all hover:border-border hover:bg-muted/30"
            >
              <h3 className="font-semibold group-hover:text-primary transition-colors">
                {cat.name}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {cat.count} {cat.count === 1 ? t("singlePost") : t("pluralPost")}
              </p>
            </Link>
          ))}
        </div>
      ) : (
        /* List view */
        <div className="grid gap-8">
          {displayPosts.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="group block">
              <article className="flex flex-col gap-3 py-4">
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  {post.category && (
                    <span className="font-medium uppercase tracking-wider">
                      {post.category}
                    </span>
                  )}
                  {post.category && post.publishedAt && (
                    <span className="text-border">·</span>
                  )}
                  {post.publishedAt && (
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="size-3" />
                      <time>{formatDate(post.publishedAt)}</time>
                    </span>
                  )}
                  {post.readingTimeMinutes && (
                    <>
                      <span className="text-border">·</span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="size-3" />
                        {t("minRead", { count: post.readingTimeMinutes })}
                      </span>
                    </>
                  )}
                </div>
                <h2 className="text-xl font-semibold tracking-tight group-hover:text-primary transition-colors">
                  {post.title}
                </h2>
                {post.excerpt && (
                  <p className="text-muted-foreground leading-relaxed line-clamp-2">
                    {post.excerpt}
                  </p>
                )}
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </article>
            </Link>
          ))}
        </div>
      )}

      {/* Empty state */}
      {displayPosts.length === 0 && (
        <div className="py-20 text-center">
          <p className="text-muted-foreground">{t("noPosts")}</p>
        </div>
      )}
    </>
  );
}
