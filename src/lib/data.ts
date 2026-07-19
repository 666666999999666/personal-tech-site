import { desc, eq, and, lte, sql } from "drizzle-orm";
import { posts, projects } from "@/lib/db/schema";
import { db } from "@/lib/db";
import { InferSelectModel } from "drizzle-orm";

export type Post = InferSelectModel<typeof posts>;

// ==================== Posts ====================

export async function getPublishedPosts({
  page = 1,
  perPage = 12,
  tag,
  category,
}: {
  page?: number;
  perPage?: number;
  tag?: string;
  category?: string;
} = {}) {
  const conditions = [eq(posts.status, "published"), lte(posts.publishedAt, new Date())];

  if (tag) {
    conditions.push(sql`${posts.tags}::jsonb @> ${JSON.stringify([tag])}::jsonb`);
  }
  if (category) {
    conditions.push(eq(posts.category, category));
  }

  const offset = (page - 1) * perPage;

  const [items, countResult] = await Promise.all([
    db
      .select()
      .from(posts)
      .where(and(...conditions))
      .orderBy(desc(posts.publishedAt))
      .limit(perPage)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)` })
      .from(posts)
      .where(and(...conditions)),
  ]);

  const total = Number(countResult[0]?.count ?? 0);

  return { items, total, page, perPage, totalPages: Math.ceil(total / perPage) };
}

export async function getPostBySlug(slug: string) {
  const result = await db
    .select()
    .from(posts)
    .where(and(eq(posts.slug, slug), eq(posts.status, "published")))
    .limit(1);

  return result[0] ?? null;
}

export async function getAllPublishedPostSlugs() {
  const result = await db
    .select({ slug: posts.slug })
    .from(posts)
    .where(eq(posts.status, "published"));

  return result.map((r) => r.slug);
}

export async function getLatestPosts(limit = 3) {
  return db
    .select()
    .from(posts)
    .where(and(eq(posts.status, "published"), lte(posts.publishedAt, new Date())))
    .orderBy(desc(posts.publishedAt))
    .limit(limit);
}

// ==================== Projects ====================

export async function getPublishedProjects() {
  return db
    .select()
    .from(projects)
    .where(eq(projects.status, "published"))
    .orderBy(desc(projects.sortOrder));
}

export async function getProjectBySlug(slug: string) {
  const result = await db
    .select()
    .from(projects)
    .where(and(eq(projects.slug, slug), eq(projects.status, "published")))
    .limit(1);

  return result[0] ?? null;
}

export async function getAllPublishedProjectSlugs() {
  const result = await db
    .select({ slug: projects.slug })
    .from(projects)
    .where(eq(projects.status, "published"));

  return result.map((r) => r.slug);
}

// ==================== Categories & Tags ====================

export async function getCategories() {
  const result = await db
    .selectDistinct({ category: posts.category })
    .from(posts)
    .where(and(eq(posts.status, "published"), sql`${posts.category} IS NOT NULL`));

  return result.map((r) => r.category).filter(Boolean) as string[];
}

export async function getTags() {
  const result = await db
    .select({ tags: posts.tags })
    .from(posts)
    .where(eq(posts.status, "published"));

  const tagSet = new Set<string>();
  for (const row of result) {
    if (Array.isArray(row.tags)) {
      for (const t of row.tags) {
        if (t) tagSet.add(t);
      }
    }
  }
  return Array.from(tagSet).sort();
}

// Aliases for simpler imports
export async function getAllPublishedPosts() {
  return db
    .select()
    .from(posts)
    .where(and(eq(posts.status, "published"), lte(posts.publishedAt, new Date())))
    .orderBy(desc(posts.publishedAt));
}

export const getAllTags = getTags;
export const getAllCategories = getCategories;

// Search posts by keyword
export async function searchPosts(query: string) {
  const likeQuery = `%${query}%`;
  return db
    .select()
    .from(posts)
    .where(
      and(
        eq(posts.status, "published"),
        lte(posts.publishedAt, new Date()),
        sql`(${posts.title} ILIKE ${likeQuery} OR ${posts.contentMd} ILIKE ${likeQuery} OR ${posts.category} ILIKE ${likeQuery})`
      )
    )
    .orderBy(desc(posts.publishedAt))
    .limit(20);
}

// ==================== Admin ====================

export async function getAllPostsAdmin() {
  return db.select().from(posts).orderBy(desc(posts.createdAt));
}

export async function getPostById(id: string) {
  const result = await db
    .select()
    .from(posts)
    .where(eq(posts.id, id))
    .limit(1);
  return result[0] ?? null;
}
