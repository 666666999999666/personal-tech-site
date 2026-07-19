import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { projects } from "@/lib/db/schema";
import type { Action, ActionResult } from "./types";

interface ListProjectInput {
  limit?: number;
}

interface ProjectItem {
  slug: string;
  title: string;
  description: string | null;
  tags: string[] | null;
  repoUrl: string | null;
  demoUrl: string | null;
  coverImageUrl: string | null;
  sortOrder: number;
}

interface ListProjectOutput {
  projects: ProjectItem[];
  total: number;
}

export const listProject: Action<ListProjectInput, ListProjectOutput> = {
  name: "list-project",
  description:
    "List published projects ordered by sortOrder (ascending priority). Returns slug, title, description, tags, repo/demo URLs, and cover image.",
  inputSchema: {
    type: "object",
    description: "List projects input",
    properties: {
      limit: {
        type: "number",
        description: "Maximum number of projects to return (default 20).",
      },
    },
  },
  handler: async (input): Promise<ActionResult<ListProjectOutput>> => {
    try {
      const limit = Math.max(1, Math.min(input?.limit ?? 20, 100));

      const rows = await db
        .select({
          slug: projects.slug,
          title: projects.title,
          description: projects.description,
          tags: projects.tags,
          repoUrl: projects.repoUrl,
          demoUrl: projects.demoUrl,
          coverImageUrl: projects.coverImageUrl,
          sortOrder: projects.sortOrder,
        })
        .from(projects)
        .where(eq(projects.status, "published"))
        .orderBy(projects.sortOrder)
        .limit(limit);

      return {
        ok: true,
        data: {
          projects: rows,
          total: rows.length,
        },
        summary: `Listed ${rows.length} published project(s).`,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return {
        ok: false,
        error: `List projects failed: ${message}`,
      };
    }
  },
};
