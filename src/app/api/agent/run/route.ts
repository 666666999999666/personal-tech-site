import { runAgent } from "@/lib/agent/runtime";
import { auth } from "@/auth";
import type { PageContext } from "@/lib/actions/types";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { message, pageContext, sessionId, locale } = body as {
      message: string;
      pageContext?: PageContext | null;
      sessionId?: string | null;
      locale?: string;
    };

    if (!message || typeof message !== "string") {
      return Response.json({ error: "message is required" }, { status: 400 });
    }

    const userId = session.user.id ?? null;

    const result = await runAgent({
      message,
      pageContext: pageContext ?? null,
      sessionId: sessionId ?? null,
      userId,
      locale,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("[agent/run] Error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
