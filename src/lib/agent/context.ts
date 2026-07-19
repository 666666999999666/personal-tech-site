import type { PageContext } from "@/lib/actions/types";

export type { PageContext };

export function inferPageType(route: string): PageContext["type"] {
  if (route === "/") return "home";
  if (route === "/blog") return "blog-list";
  if (route.startsWith("/blog/")) return "blog-post";
  if (route.startsWith("/projects/")) return "project";
  if (route === "/projects") return "project";
  if (route === "/about") return "about";
  if (route === "/agent") return "agent";
  if (route.startsWith("/workspace")) return "workspace";
  return "unknown";
}

export function buildContextSummary(ctx: PageContext): string {
  const parts: string[] = [];

  parts.push(`Current page: ${ctx.route} (type: ${ctx.type})`);

  if (ctx.title) parts.push(`Title: ${ctx.title}`);
  if (ctx.slug) parts.push(`Slug: ${ctx.slug}`);
  if (ctx.section) parts.push(`Current section: ${ctx.section}`);
  if (ctx.scrollProgress !== undefined)
    parts.push(`Scroll progress: ${Math.round(ctx.scrollProgress * 100)}%`);
  if (ctx.selection) parts.push(`User selected text: "${ctx.selection}"`);

  if (ctx.metadata) {
    const meta = ctx.metadata;
    if (meta.tags) parts.push(`Tags: ${(meta.tags as string[]).join(", ")}`);
    if (meta.category) parts.push(`Category: ${meta.category}`);
    if (meta.publishedAt)
      parts.push(`Published: ${new Date(meta.publishedAt as string).toLocaleDateString()}`);
    if (meta.readingTime) parts.push(`Reading time: ${meta.readingTime} min`);
  }

  return parts.join("\n");
}
