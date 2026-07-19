// JSONSchema type (simplified)
export type JSONSchema = {
  type: string;
  properties?: Record<string, JSONSchema>;
  required?: string[];
  description?: string;
  items?: JSONSchema;
};

export interface Action<TInput = unknown, TOutput = unknown> {
  name: string;
  description: string;
  inputSchema: JSONSchema;
  handler: (
    input: TInput,
    ctx: ActionContext
  ) => Promise<ActionResult<TOutput>>;
}

export interface ActionContext {
  userId: string | null;
  pageContext: PageContext;
}

export interface ActionResult<T = unknown> {
  ok: boolean;
  data?: T;
  error?: string;
  summary?: string;
}

export interface PageContext {
  route: string;
  type:
    | "home"
    | "blog-list"
    | "blog-post"
    | "project"
    | "about"
    | "agent"
    | "workspace"
    | "unknown";
  title?: string;
  slug?: string;
  section?: string;
  scrollProgress?: number;
  selection?: string;
  metadata?: Record<string, unknown>;
}
