import { search } from "./search";
import { searchBlog } from "./searchBlog";
import { getBlog } from "./getBlog";
import { listProject } from "./listProject";
import { summarizeArticle } from "./summarizeArticle";
import { recommendRelated } from "./recommendRelated";
import { navigate } from "./navigate";
import type {
  Action,
  ActionContext,
  ActionResult,
  JSONSchema,
} from "./types";

// ==================== Registry ====================

// A registered action erases the input/output generics so heterogeneous
// actions can share a registry type. The handler accepts `unknown` input
// because each action validates and narrows its input at runtime.
interface RegisteredAction {
  name: string;
  description: string;
  inputSchema: JSONSchema;
  handler: (input: unknown, ctx: ActionContext) => Promise<ActionResult>;
}

// Wraps a typed action so it conforms to RegisteredAction. The cast to
// TInput is safe because each handler is responsible for validating input.
function register<TInput, TOutput>(
  action: Action<TInput, TOutput>
): RegisteredAction {
  return {
    name: action.name,
    description: action.description,
    inputSchema: action.inputSchema,
    handler: (input, ctx) =>
      action.handler(input as TInput, ctx) as Promise<ActionResult>,
  };
}

const actions: Record<string, RegisteredAction> = {
  search: register(search),
  "search-blog": register(searchBlog),
  "get-blog": register(getBlog),
  "list-project": register(listProject),
  "summarize-article": register(summarizeArticle),
  "recommend-related": register(recommendRelated),
  navigate: register(navigate),
};

// ==================== Invocation ====================

export async function invokeAction(
  name: string,
  input: unknown,
  ctx: ActionContext
): Promise<ActionResult> {
  const action = actions[name];

  if (!action) {
    const valid = Object.keys(actions).join(", ");
    console.error(`[action:error] unknown action "${name}". Valid: ${valid}`);
    return {
      ok: false,
      error: `Unknown action: "${name}". Valid actions: ${valid}.`,
    };
  }

  const startedAt = Date.now();
  console.log("[action:start]", name, { input });

  try {
    const result = await action.handler(input, ctx);
    const duration = Date.now() - startedAt;
    console.log("[action:end]", name, { success: result.ok, duration });
    return result;
  } catch (err) {
    const duration = Date.now() - startedAt;
    const message = err instanceof Error ? err.message : String(err);
    console.error("[action:end]", name, {
      success: false,
      duration,
      error: message,
    });
    return {
      ok: false,
      error: `Action "${name}" threw: ${message}`,
    };
  }
}

// ==================== AI SDK Tools ====================

/**
 * Convert the action registry into the Vercel AI SDK `tools` shape:
 *   { [toolName]: { description, parameters, execute } }
 *
 * The `ai` package is not a dependency of this project; this helper returns
 * a structurally-compatible object that callers can pass directly to the AI
 * SDK's `streamText` / `generateText` `tools` option, or wrap with `tool()`.
 */
export function actionListToAISDKTools() {
  const tools: Record<
    string,
    {
      description: string;
      parameters: JSONSchema;
      execute: (input: unknown, ctx: ActionContext) => Promise<ActionResult>;
    }
  > = {};

  for (const [name, action] of Object.entries(actions)) {
    tools[name] = {
      description: action.description,
      parameters: action.inputSchema,
      execute: async (input: unknown, ctx: ActionContext) =>
        invokeAction(name, input, ctx),
    };
  }

  return tools;
}

// ==================== Descriptions ====================

export interface ActionDescription {
  name: string;
  description: string;
  inputSchema: JSONSchema;
}

export function getActionDescriptions(): ActionDescription[] {
  return Object.entries(actions).map(([name, action]) => ({
    name,
    description: action.description,
    inputSchema: action.inputSchema,
  }));
}

export { search, searchBlog, getBlog, listProject, summarizeArticle, recommendRelated, navigate };
export type {
  Action,
  ActionContext,
  ActionResult,
  PageContext,
  JSONSchema,
} from "./types";
