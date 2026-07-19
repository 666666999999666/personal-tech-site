import { db } from "@/lib/db";
import { agentSessions, agentMessages } from "@/lib/db/schema";
import { auth } from "@/auth";
import { eq } from "drizzle-orm";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const [agentSession] = await db
    .select()
    .from(agentSessions)
    .where(eq(agentSessions.id, id));

  if (!agentSession) {
    return Response.json({ error: "Session not found" }, { status: 404 });
  }

  const messages = await db
    .select()
    .from(agentMessages)
    .where(eq(agentMessages.sessionId, id))
    .orderBy(agentMessages.createdAt);

  return Response.json({ ...agentSession, messages });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  // Delete messages first (foreign key constraint)
  await db.delete(agentMessages).where(eq(agentMessages.sessionId, id));
  await db.delete(agentSessions).where(eq(agentSessions.id, id));

  return Response.json({ ok: true });
}
