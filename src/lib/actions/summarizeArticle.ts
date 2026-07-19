import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { posts } from "@/lib/db/schema";
import type { Action, ActionResult } from "./types";

interface SummarizeArticleInput {
  slug: string;
}

interface SummarizeArticleOutput {
  slug: string;
  title: string;
  content: string;
  wordCount: number;
}

export const summarizeArticle: Action<
  SummarizeArticleInput,
  SummarizeArticleOutput
> = {
  name: "summarize-article",
  description:
    "Fetch the full content of a blog post by slug so the agent can summarize it. The actual summarization is performed by the LLM in the agent runtime; this action only retrieves the content and returns its title, content, and word count.",
  inputSchema: {
    type: "object",
    description: "Summarize article input",
    properties: {
      slug: {
        type: "string",
        description: "The slug of the blog post to summarize.",
      },
    },
    required: ["slug"],
  },
  handler: async (
    input
  ): Promise<ActionResult<SummarizeArticleOutput>> => {
    try {
      const slug = (input?.slug ?? "").trim();
      if (!slug) {
        return {
          ok: false,
          error: "Slug is required.",
        };
      }

      const rows = await db
        .select({
          slug: posts.slug,
          title: posts.title,
          contentMd: posts.contentMd,
        })
        .from(posts)
        .where(and(eq(posts.slug, slug), eq(posts.status, "published")))
        .limit(1);

      const post = rows[0];

      if (!post) {
        return {
          ok: false,
          error: `Blog post not found for slug: ${slug}`,
        };
      }

      const content = post.contentMd ?? "";
      const wordCount = content
        ? content.trim().split(/\s+/).filter(Boolean).length
        : 0;

      return {
        ok: true,
        data: {
          slug: post.slug,
          title: post.title,
          content,
          wordCount,
        },
        summary: `${post.title} - ${wordCount} words`,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return {
        ok: false,
        error: `Summarize article failed: ${message}`,
      };
    }
  },
};
