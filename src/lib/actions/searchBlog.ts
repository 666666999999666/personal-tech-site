import { sql, eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { posts } from "@/lib/db/schema";
import type { Action, ActionResult } from "./types";

interface SearchBlogInput {
  query: string;
  limit?: number;
}

interface BlogHit {
  slug: string;
  title: string;
  excerpt: string;
  category: string | null;
}

interface SearchBlogOutput {
  query: string;
  results: BlogHit[];
  total: number;
}

export const searchBlog: Action<SearchBlogInput, SearchBlogOutput> = {
  name: "search-blog",
  description:
    "Search blog posts by matching the query against title and content using case-insensitive ILIKE. Returns slug, title, excerpt, and category for each hit.",
  inputSchema: {
    type: "object",
    description: "Blog search input",
    properties: {
      query: {
        type: "string",
        description: "The search query string.",
      },
      limit: {
        type: "number",
        description: "Maximum number of results to return (default 10).",
      },
    },
    required: ["query"],
  },
  handler: async (input): Promise<ActionResult<SearchBlogOutput>> => {
    try {
      const query = (input?.query ?? "").trim();
      if (!query) {
        return {
          ok: false,
          error: "Query is required.",
        };
      }

      const limit = Math.max(1, Math.min(input.limit ?? 10, 50));
      const pattern = `%${query}%`;

      const rows = await db
        .select({
          slug: posts.slug,
          title: posts.title,
          excerpt: posts.excerpt,
          contentMd: posts.contentMd,
          category: posts.category,
        })
        .from(posts)
        .where(
          and(
            eq(posts.status, "published"),
            sql`(${posts.title} ILIKE ${pattern} OR ${posts.contentMd} ILIKE ${pattern})`
          )
        )
        .limit(limit);

      const results: BlogHit[] = rows.map((r) => ({
        slug: r.slug,
        title: r.title,
        excerpt: r.excerpt ?? r.contentMd?.slice(0, 160) ?? "",
        category: r.category,
      }));

      return {
        ok: true,
        data: {
          query,
          results,
          total: results.length,
        },
        summary: `Found ${results.length} blog post(s) for "${query}".`,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return {
        ok: false,
        error: `Blog search failed: ${message}`,
      };
    }
  },
};
