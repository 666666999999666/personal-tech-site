import { NextResponse } from "next/server";
import { asc, eq, max } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { todos } from "@/lib/db/schema";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get("groupId");

    let query = db.select().from(todos).orderBy(asc(todos.sortOrder));

    if (groupId) {
      const result = await db
        .select()
        .from(todos)
        .where(eq(todos.groupId, groupId))
        .orderBy(asc(todos.sortOrder));
      return NextResponse.json(result);
    }

    const allTodos = await query;
    return NextResponse.json(allTodos);
  } catch (error) {
    console.error("Failed to fetch todos:", error);
    return NextResponse.json(
      { error: "Failed to fetch todos" },
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
    const { text, groupId } = body;

    if (!text || typeof text !== "string" || !text.trim()) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    if (!groupId) {
      return NextResponse.json({ error: "groupId is required" }, { status: 400 });
    }

    const [result] = await db
      .select({ maxSort: max(todos.sortOrder) })
      .from(todos)
      .where(eq(todos.groupId, groupId));

    const nextSortOrder = (result?.maxSort ?? 0) + 1;

    const [created] = await db
      .insert(todos)
      .values({
        text: text.trim(),
        groupId,
        sortOrder: nextSortOrder,
      })
      .returning();

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("Failed to create todo:", error);
    return NextResponse.json(
      { error: "Failed to create todo" },
      { status: 500 }
    );
  }
}
