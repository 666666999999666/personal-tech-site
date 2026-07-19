import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { posts } from "@/lib/db/schema";

type PostUpdate = Partial<typeof posts.$inferInsert>;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const [post] = await db
      .select()
      .from(posts)
      .where(eq(posts.id, id))
      .limit(1);

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error("Failed to fetch post:", error);
    return NextResponse.json(
      { error: "Failed to fetch post" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const [existing] = await db
      .select()
      .from(posts)
      .where(eq(posts.id, id))
      .limit(1);

    if (!existing) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const body = await request.json();
    const {
      title,
      slug,
      contentMd,
      excerpt,
      tags,
      category,
      coverImageUrl,
      status,
      publishedAt,
      readingTimeMinutes,
    } = body;

    const updateData: PostUpdate = { updatedAt: new Date() };

    if (title !== undefined) updateData.title = title;
    if (slug !== undefined) updateData.slug = slug;
    if (contentMd !== undefined) updateData.contentMd = contentMd;
    if (excerpt !== undefined) updateData.excerpt = excerpt;
    if (tags !== undefined) updateData.tags = tags;
    if (category !== undefined) updateData.category = category;
    if (coverImageUrl !== undefined) updateData.coverImageUrl = coverImageUrl;
    if (status !== undefined) updateData.status = status;
    if (readingTimeMinutes !== undefined)
      updateData.readingTimeMinutes = readingTimeMinutes;

    // If status changes to "published" and publishedAt is null, set to now
    if (status === "published" && !existing.publishedAt) {
      updateData.publishedAt = new Date();
    } else if (publishedAt !== undefined) {
      updateData.publishedAt = publishedAt;
    }

    const [updated] = await db
      .update(posts)
      .set(updateData)
      .where(eq(posts.id, id))
      .returning();

    revalidatePath("/blog");
    revalidatePath("/blog/[slug]", "page");

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update post:", error);
    return NextResponse.json(
      { error: "Failed to update post" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    await db.delete(posts).where(eq(posts.id, id));

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("Failed to delete post:", error);
    return NextResponse.json(
      { error: "Failed to delete post" },
      { status: 500 }
    );
  }
}
