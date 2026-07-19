import { sql, eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { posts, projects } from "@/lib/db/schema";
import type { Action, ActionResult } from "./types";

interface SearchInput {
  query: string;
  limit?: number;
}

interface SearchItem {
  type: "blog" | "project";
  slug: string;
  title: string;
  excerpt: string;
}

interface SearchOutput {
  query: string;
  results: SearchItem[];
  total: number;
}

export const search: Action<SearchInput, SearchOutput> = {
  name: "search",
  description:
    "Global search across blog posts and projects. Matches the query against titles, descriptions, and content using case-insensitive ILIKE. Returns a unified list of results with type, slug, title, and excerpt.",
  inputSchema: {
    type: "object",
    description: "Search input",
    properties: {
      query: {
        type: "string",
        description: "The search query string.",
      },
      limit: {
        type: "number",
        description:
          "Maximum number of results to return (default 10). Applied per-type after merging.",
      },
    },
    required: ["query"],
  },
  handler: async (input): Promise<ActionResult<SearchOutput>> => {
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

      const [blogRows, projectRows] = await Promise.all([
        db
          .select({
            slug: posts.slug,
            title: posts.title,
            excerpt: posts.excerpt,
            contentMd: posts.contentMd,
          })
          .from(posts)
          .where(
            and(
              eq(posts.status, "published"),
              sql`(${posts.title} ILIKE ${pattern} OR ${posts.contentMd} ILIKE ${pattern} OR ${posts.excerpt} ILIKE ${pattern})`
            )
          )
          .limit(limit),
        db
          .select({
            slug: projects.slug,
            title: projects.title,
            description: projects.description,
            contentMd: projects.contentMd,
          })
          .from(projects)
          .where(
            and(
              eq(projects.status, "published"),
              sql`(${projects.title} ILIKE ${pattern} OR ${projects.description} ILIKE ${pattern} OR ${projects.contentMd} ILIKE ${pattern})`
            )
          )
          .limit(limit),
      ]);

      const blogItems: SearchItem[] = blogRows.map((r) => ({
        type: "blog",
        slug: r.slug,
        title: r.title,
        excerpt: r.excerpt ?? r.contentMd?.slice(0, 160) ?? "",
      }));

      const projectItems: SearchItem[] = projectRows.map((r) => ({
        type: "project",
        slug: r.slug,
        title: r.title,
        excerpt: r.description ?? r.contentMd?.slice(0, 160) ?? "",
      }));

      const merged = [...blogItems, ...projectItems].slice(0, limit);

      return {
        ok: true,
        data: {
          query,
          results: merged,
          total: merged.length,
        },
        summary: `Found ${merged.length} result(s) for "${query}".`,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return {
        ok: false,
        error: `Search failed: ${message}`,
      };
    }
  },
};
