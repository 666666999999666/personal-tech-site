import { eq, and, ne, or, sql, desc, lte } from "drizzle-orm";
import { db } from "@/lib/db";
import { posts } from "@/lib/db/schema";
import type { Action, ActionResult } from "./types";

interface RecommendRelatedInput {
  slug: string;
  limit?: number;
}

interface RelatedPost {
  slug: string;
  title: string;
  excerpt: string | null;
  category: string | null;
  tags: string[] | null;
  publishedAt: Date | null;
  matchReason: "tag" | "category" | "recent";
}

interface RecommendRelatedOutput {
  source: { slug: string; title: string };
  results: RelatedPost[];
  total: number;
}

export const recommendRelated: Action<
  RecommendRelatedInput,
  RecommendRelatedOutput
> = {
  name: "recommend-related",
  description:
    "Recommend related blog posts for a given slug. Finds the source post, then returns posts that share a tag or the same category, falling back to recent posts. Results are capped by limit (default 5).",
  inputSchema: {
    type: "object",
    description: "Recommend related posts input",
    properties: {
      slug: {
        type: "string",
        description: "The slug of the source blog post.",
      },
      limit: {
        type: "number",
        description: "Maximum number of related posts to return (default 5).",
      },
    },
    required: ["slug"],
  },
  handler: async (
    input
  ): Promise<ActionResult<RecommendRelatedOutput>> => {
    try {
      const slug = (input?.slug ?? "").trim();
      if (!slug) {
        return {
          ok: false,
          error: "Slug is required.",
        };
      }

      const limit = Math.max(1, Math.min(input?.limit ?? 5, 20));

      // Find source post
      const sourceRows = await db
        .select({
          slug: posts.slug,
          title: posts.title,
          tags: posts.tags,
          category: posts.category,
        })
        .from(posts)
        .where(and(eq(posts.slug, slug), eq(posts.status, "published")))
        .limit(1);

      const source = sourceRows[0];

      if (!source) {
        return {
          ok: false,
          error: `Blog post not found for slug: ${slug}`,
        };
      }

      const sourceTags = Array.isArray(source.tags) ? source.tags : [];
      const sourceCategory = source.category ?? null;

      // Build related conditions: matching tags OR matching category, excluding the source.
      const tagMatch =
        sourceTags.length > 0
          ? or(
              ...sourceTags.map((t) =>
                sql`${posts.tags}::jsonb @> ${JSON.stringify([t])}::jsonb`
              )
            ) ?? undefined
          : undefined;

      const categoryMatch = sourceCategory
        ? eq(posts.category, sourceCategory)
        : undefined;

      const relatedConditions = [tagMatch, categoryMatch].filter(
        (c): c is NonNullable<typeof c> => Boolean(c)
      );
      const relatedCondition =
        relatedConditions.length > 0 ? or(...relatedConditions) : undefined;

      const publishedCondition = and(
        eq(posts.status, "published"),
        lte(posts.publishedAt, new Date()),
        ne(posts.slug, slug)
      );

      let related: RelatedPost[] = [];

      if (relatedCondition) {
        const rows = await db
          .select({
            slug: posts.slug,
            title: posts.title,
            excerpt: posts.excerpt,
            category: posts.category,
            tags: posts.tags,
            publishedAt: posts.publishedAt,
          })
          .from(posts)
          .where(and(publishedCondition, relatedCondition))
          .orderBy(desc(posts.publishedAt))
          .limit(limit);

        related = rows.map((r) => {
          const rTags = Array.isArray(r.tags) ? r.tags : [];
          const sharesTag =
            sourceTags.length > 0 &&
            rTags.some((t) => sourceTags.includes(t));
          return {
            slug: r.slug,
            title: r.title,
            excerpt: r.excerpt,
            category: r.category,
            tags: r.tags,
            publishedAt: r.publishedAt,
            matchReason: sharesTag ? "tag" : "category",
          };
        });
      }

      // Fallback: fill with recent posts if not enough related.
      if (related.length < limit) {
        const excludeSlugs = new Set([slug, ...related.map((r) => r.slug)]);
        const fallbackRows = await db
          .select({
            slug: posts.slug,
            title: posts.title,
            excerpt: posts.excerpt,
            category: posts.category,
            tags: posts.tags,
            publishedAt: posts.publishedAt,
          })
          .from(posts)
          .where(
            and(
              eq(posts.status, "published"),
              lte(posts.publishedAt, new Date())
            )
          )
          .orderBy(desc(posts.publishedAt))
          .limit(limit * 2);

        for (const r of fallbackRows) {
          if (related.length >= limit) break;
          if (excludeSlugs.has(r.slug)) continue;
          excludeSlugs.add(r.slug);
          related.push({
            slug: r.slug,
            title: r.title,
            excerpt: r.excerpt,
            category: r.category,
            tags: r.tags,
            publishedAt: r.publishedAt,
            matchReason: "recent",
          });
        }
      }

      return {
        ok: true,
        data: {
          source: { slug: source.slug, title: source.title },
          results: related.slice(0, limit),
          total: Math.min(related.length, limit),
        },
        summary: `Recommended ${Math.min(
          related.length,
          limit
        )} related post(s) for "${source.title}".`,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return {
        ok: false,
        error: `Recommend related failed: ${message}`,
      };
    }
  },
};
