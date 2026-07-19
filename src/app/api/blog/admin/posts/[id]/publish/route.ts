import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { posts } from "@/lib/db/schema";

export async function POST(
  _request: Request,
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

    const updateData: Partial<typeof posts.$inferInsert> = {
      status: "published",
      updatedAt: new Date(),
    };

    if (!existing.publishedAt) {
      updateData.publishedAt = new Date();
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
    console.error("Failed to publish post:", error);
    return NextResponse.json(
      { error: "Failed to publish post" },
      { status: 500 }
    );
  }
}
