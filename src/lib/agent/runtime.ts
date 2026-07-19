import { streamText, isStepCount } from "ai";
import type { ModelMessage, Tool } from "@ai-sdk/provider-utils";
import { resolveModel } from "./providers";
import { invokeAction, getActionDescriptions } from "@/lib/actions";
import { buildContextSummary } from "./context";
import type { PageContext } from "@/lib/actions/types";
import { z } from "zod";

function buildSystemPrompt(pageContext: PageContext | null, locale?: string): string {
  const contextSection = pageContext
    ? `## Current Page Context\n\n${buildContextSummary(pageContext)}`
    : "## Current Page Context\n\nNo page context available.";

  const actions = getActionDescriptions();
  const actionList = actions
    .map((a) => `- **${a.name}**: ${a.description}`)
    .join("\n");

  return `You are the Agent for a personal website. You help visitors explore blog posts, projects, and other content.

## Role

- You are a knowledgeable assistant embedded in the website
- You have access to the site's content through Actions
- You understand the current page context and can provide relevant help
- You are concise and helpful — no unnecessary preamble

## Constraints

- Only use the provided Actions to access data — never make up content
- If an Action fails, explain the error honestly
- If you don't know something, say so
- Keep responses focused and relevant to the user's question
- When on a blog post page, you can summarize, explain, or find related content
- When on a project page, you can describe or find similar projects
- Always suggest relevant navigation when appropriate

${contextSection}

## Available Actions

${actionList}

Use these Actions to answer questions about the site's content. Call the appropriate Action based on the user's request.

${locale === "zh" ? "请使用中文回复。" : "Please respond in English."}`;
}

export interface RunAgentOptions {
  message: string;
  pageContext?: PageContext | null;
  sessionId?: string | null;
  userId?: string | null;
  history?: ModelMessage[];
  locale?: string;
}

export async function runAgent({
  message,
  pageContext = null,
  userId = null,
  history = [],
  locale,
}: RunAgentOptions) {
  const model = resolveModel();
  const systemPrompt = buildSystemPrompt(pageContext, locale);

  const actionCtx = {
    userId: userId ?? null,
    pageContext: pageContext ?? {
      route: "/",
      type: "unknown" as const,
    },
  };

  const actions = getActionDescriptions();
  const tools: Record<string, Tool> = {};
  for (const action of actions) {
    tools[action.name] = {
      description: action.description,
      inputSchema: z.object(
        Object.fromEntries(
          Object.entries(action.inputSchema.properties ?? {}).map(([key, schema]) => [
            key,
            schema.type === "string"
              ? z.string().describe(schema.description ?? "")
              : schema.type === "number"
                ? z.number().describe(schema.description ?? "")
                : z.any().describe(schema.description ?? ""),
          ])
        )
      ),
      execute: async (input: unknown) => {
        const result = await invokeAction(action.name, input, actionCtx);
        if (!result.ok) {
          return `Error: ${result.error}`;
        }
        return result.data ?? result.summary ?? "Done";
      },
    };
  }

  const messages: ModelMessage[] = [
    ...history,
    { role: "user", content: [{ type: "text", text: message }] } as ModelMessage,
  ];

  const result = streamText({
    model,
    instructions: systemPrompt,
    messages,
    tools,
    stopWhen: isStepCount(5),
  });

  return result;
}
