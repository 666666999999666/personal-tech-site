import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { posts } from "@/lib/db/schema";
import type { Action, ActionResult } from "./types";

interface GetBlogInput {
  slug: string;
}

interface BlogDetail {
  slug: string;
  title: string;
  contentMd: string | null;
  excerpt: string | null;
  tags: string[] | null;
  category: string | null;
  publishedAt: Date | null;
  coverImageUrl: string | null;
  readingTimeMinutes: number | null;
}

export const getBlog: Action<GetBlogInput, BlogDetail> = {
  name: "get-blog",
  description:
    "Fetch a full blog post by its slug, including content, tags, category, and metadata. Only returns published posts.",
  inputSchema: {
    type: "object",
    description: "Get blog post input",
    properties: {
      slug: {
        type: "string",
        description: "The slug of the blog post to retrieve.",
      },
    },
    required: ["slug"],
  },
  handler: async (input): Promise<ActionResult<BlogDetail>> => {
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
          excerpt: posts.excerpt,
          tags: posts.tags,
          category: posts.category,
          publishedAt: posts.publishedAt,
          coverImageUrl: posts.coverImageUrl,
          readingTimeMinutes: posts.readingTimeMinutes,
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

      return {
        ok: true,
        data: post,
        summary: `Retrieved blog post "${post.title}".`,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return {
        ok: false,
        error: `Get blog failed: ${message}`,
      };
    }
  },
};
