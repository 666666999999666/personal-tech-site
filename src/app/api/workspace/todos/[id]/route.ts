import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { todos } from "@/lib/db/schema";

type TodoUpdate = Partial<typeof todos.$inferInsert>;

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
      .from(todos)
      .where(eq(todos.id, id))
      .limit(1);

    if (!existing) {
      return NextResponse.json({ error: "Todo not found" }, { status: 404 });
    }

    const body = await request.json();
    const { text, done } = body;

    const updateData: TodoUpdate = { updatedAt: new Date() };

    if (text !== undefined) updateData.text = text;
    if (done !== undefined) updateData.done = done;

    const [updated] = await db
      .update(todos)
      .set(updateData)
      .where(eq(todos.id, id))
      .returning();

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update todo:", error);
    return NextResponse.json(
      { error: "Failed to update todo" },
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

    await db.delete(todos).where(eq(todos.id, id));

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("Failed to delete todo:", error);
    return NextResponse.json(
      { error: "Failed to delete todo" },
      { status: 500 }
    );
  }
}
