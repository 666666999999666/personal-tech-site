import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { todoGroups, todos } from "@/lib/db/schema";

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
      .from(todoGroups)
      .where(eq(todoGroups.id, id))
      .limit(1);

    if (!existing) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    const body = await request.json();
    const { name, sortOrder } = body;

    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (name !== undefined) updateData.name = name;
    if (sortOrder !== undefined) updateData.sortOrder = sortOrder;

    const [updated] = await db
      .update(todoGroups)
      .set(updateData)
      .where(eq(todoGroups.id, id))
      .returning();

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update todo group:", error);
    return NextResponse.json(
      { error: "Failed to update todo group" },
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

    // Cascade delete: first delete all todos in this group
    await db.delete(todos).where(eq(todos.groupId, id));
    // Then delete the group
    await db.delete(todoGroups).where(eq(todoGroups.id, id));

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("Failed to delete todo group:", error);
    return NextResponse.json(
      { error: "Failed to delete todo group" },
      { status: 500 }
    );
  }
}
