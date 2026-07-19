import type { Action, ActionResult } from "./types";

interface NavigateInput {
  target: string;
}

interface NavigateOutput {
  target: string;
  route: string;
  description: string;
}

const ROUTE_MAP: Record<string, { route: string; description: string }> = {
  blog: { route: "/blog", description: "Blog listing page." },
  home: { route: "/", description: "Home page." },
  projects: { route: "/projects", description: "Projects showcase page." },
  about: { route: "/about", description: "About page." },
  workspace: { route: "/workspace", description: "Workspace page." },
  agent: { route: "/agent", description: "AI agent page." },
};

export const navigate: Action<NavigateInput, NavigateOutput> = {
  name: "navigate",
  description:
    "Resolve a navigation target name into a route URL and human-readable description. Supports: blog, home, projects, about, workspace, agent.",
  inputSchema: {
    type: "object",
    description: "Navigate input",
    properties: {
      target: {
        type: "string",
        description:
          "The navigation target. One of: blog, home, projects, about, workspace, agent.",
      },
    },
    required: ["target"],
  },
  handler: async (input): Promise<ActionResult<NavigateOutput>> => {
    try {
      const target = (input?.target ?? "").trim().toLowerCase();
      if (!target) {
        return {
          ok: false,
          error: "Target is required.",
        };
      }

      const match = ROUTE_MAP[target];

      if (!match) {
        const valid = Object.keys(ROUTE_MAP).join(", ");
        return {
          ok: false,
          error: `Unknown navigation target: "${target}". Valid targets: ${valid}.`,
        };
      }

      return {
        ok: true,
        data: {
          target,
          route: match.route,
          description: match.description,
        },
        summary: `Navigate to ${match.route} (${match.description})`,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return {
        ok: false,
        error: `Navigate failed: ${message}`,
      };
    }
  },
};
