"use client";

import { useState, useCallback } from "react";

export interface FrontMatterData {
  title: string;
  slug: string;
  tags: string[];
  category: string;
  excerpt: string;
  coverImageUrl: string;
  status: "draft" | "published";
  publishedAt: string;
}

/** Convert a Date or ISO string to the value expected by <input type="datetime-local">. */
function toDatetimeLocal(value: Date | string | null | undefined): string {
  if (!value) return "";
  const date = new Date(value);
  if (isNaN(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

interface Props {
  initialData: FrontMatterData;
  onChange: (data: FrontMatterData) => void;
}

const inputClass =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/20";
const labelClass =
  "mb-1.5 block text-xs font-medium text-muted-foreground";

export function FrontMatterPanel({ initialData, onChange }: Props) {
  const [data, setData] = useState<FrontMatterData>(initialData);

  const update = useCallback(
    <K extends keyof FrontMatterData>(
      field: K,
      value: FrontMatterData[K]
    ) => {
      setData((prev) => {
        const next = { ...prev, [field]: value };
        onChange(next);
        return next;
      });
    },
    [onChange]
  );

  return (
    <div className="space-y-4">
      {/* Title */}
      <div>
        <label className={labelClass} htmlFor="fm-title">
          Title
        </label>
        <input
          id="fm-title"
          type="text"
          className={inputClass}
          value={data.title}
          onChange={(e) => update("title", e.target.value)}
          placeholder="Post title"
        />
      </div>

      {/* Slug */}
      <div>
        <label className={labelClass} htmlFor="fm-slug">
          Slug
        </label>
        <input
          id="fm-slug"
          type="text"
          className={inputClass}
          value={data.slug}
          onChange={(e) => update("slug", e.target.value)}
          placeholder="url-friendly-slug"
        />
      </div>

      {/* Tags */}
      <div>
        <label className={labelClass} htmlFor="fm-tags">
          Tags
        </label>
        <input
          id="fm-tags"
          type="text"
          className={inputClass}
          value={data.tags.join(", ")}
          onChange={(e) =>
            update(
              "tags",
              e.target.value
                .split(",")
                .map((t) => t.trim())
                .filter(Boolean)
            )
          }
          placeholder="react, nextjs, tutorial"
        />
        <p className="mt-1 text-xs text-muted-foreground">
          Comma-separated
        </p>
      </div>

      {/* Category */}
      <div>
        <label className={labelClass} htmlFor="fm-category">
          Category
        </label>
        <input
          id="fm-category"
          type="text"
          className={inputClass}
          value={data.category}
          onChange={(e) => update("category", e.target.value)}
          placeholder="Tutorial"
        />
      </div>

      {/* Excerpt */}
      <div>
        <label className={labelClass} htmlFor="fm-excerpt">
          Excerpt
        </label>
        <textarea
          id="fm-excerpt"
          className={`${inputClass} resize-none`}
          rows={3}
          value={data.excerpt}
          onChange={(e) => update("excerpt", e.target.value)}
          placeholder="Short summary of the post"
        />
      </div>

      {/* Cover image URL */}
      <div>
        <label className={labelClass} htmlFor="fm-cover">
          Cover image URL
        </label>
        <input
          id="fm-cover"
          type="text"
          className={inputClass}
          value={data.coverImageUrl}
          onChange={(e) => update("coverImageUrl", e.target.value)}
          placeholder="https://example.com/image.jpg"
        />
      </div>

      {/* Status */}
      <div>
        <label className={labelClass} htmlFor="fm-status">
          Status
        </label>
        <select
          id="fm-status"
          className={inputClass}
          value={data.status}
          onChange={(e) =>
            update("status", e.target.value as "draft" | "published")
          }
        >
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>
      </div>

      {/* Published at */}
      <div>
        <label className={labelClass} htmlFor="fm-published-at">
          Published at
        </label>
        <input
          id="fm-published-at"
          type="datetime-local"
          className={inputClass}
          value={toDatetimeLocal(data.publishedAt)}
          onChange={(e) => {
            const val = e.target.value;
            update("publishedAt", val ? new Date(val).toISOString() : "");
          }}
        />
      </div>
    </div>
  );
}
