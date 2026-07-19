import { NextResponse } from "next/server";
import { asc, max } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { todoGroups } from "@/lib/db/schema";

export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const groups = await db
      .select()
      .from(todoGroups)
      .orderBy(asc(todoGroups.sortOrder));

    return NextResponse.json(groups);
  } catch (error) {
    console.error("Failed to fetch todo groups:", error);
    return NextResponse.json(
      { error: "Failed to fetch todo groups" },
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
    const { name } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const [result] = await db
      .select({ maxSort: max(todoGroups.sortOrder) })
      .from(todoGroups);

    const nextSortOrder = (result?.maxSort ?? -1) + 1;

    const [created] = await db
      .insert(todoGroups)
      .values({
        name: name.trim(),
        sortOrder: nextSortOrder,
      })
      .returning();

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("Failed to create todo group:", error);
    return NextResponse.json(
      { error: "Failed to create todo group" },
      { status: 500 }
    );
  }
}
