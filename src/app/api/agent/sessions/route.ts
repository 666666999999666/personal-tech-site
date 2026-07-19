import { db } from "@/lib/db";
import { agentSessions } from "@/lib/db/schema";
import { auth } from "@/auth";
import { desc } from "drizzle-orm";
import { NextRequest } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sessions = await db
    .select({
      id: agentSessions.id,
      title: agentSessions.title,
      createdAt: agentSessions.createdAt,
      updatedAt: agentSessions.updatedAt,
      lastMessageAt: agentSessions.lastMessageAt,
    })
    .from(agentSessions)
    .orderBy(desc(agentSessions.lastMessageAt));

  return Response.json(sessions);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { title } = body as { title?: string };

  const [newSession] = await db
    .insert(agentSessions)
    .values({
      title: title ?? "New Chat",
    })
    .returning();

  return Response.json(newSession, { status: 201 });
}
