import { NextResponse } from "next/server";
import { desc } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { posts } from "@/lib/db/schema";

function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const allPosts = await db
      .select()
      .from(posts)
      .orderBy(desc(posts.createdAt));

    return NextResponse.json(allPosts);
  } catch (error) {
    console.error("Failed to fetch posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, slug, contentMd, excerpt, tags, category, coverImageUrl } =
      body;

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const finalSlug = slug || slugify(title);

    const [created] = await db
      .insert(posts)
      .values({
        title,
        slug: finalSlug,
        contentMd,
        excerpt,
        tags,
        category,
        coverImageUrl,
        status: "draft",
      })
      .returning();

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("Failed to create post:", error);
    return NextResponse.json(
      { error: "Failed to create post" },
      { status: 500 }
    );
  }
}
