import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { todos } from "@/lib/db/schema";

export async function PATCH(request: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { items } = body;

    if (!Array.isArray(items)) {
      return NextResponse.json(
        { error: "items must be an array" },
        { status: 400 }
      );
    }

    await db.transaction(async (tx) => {
      await Promise.all(
        items.map(
          (item: { id: string; sortOrder: number }) =>
            tx
              .update(todos)
              .set({ sortOrder: item.sortOrder, updatedAt: new Date() })
              .where(eq(todos.id, item.id))
        )
      );
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to reorder todos:", error);
    return NextResponse.json(
      { error: "Failed to reorder todos" },
      { status: 500 }
    );
  }
}
