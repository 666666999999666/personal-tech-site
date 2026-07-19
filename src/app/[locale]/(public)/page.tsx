import { Link } from "@/i18n/navigation";
import { ArrowRight } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getLatestPosts, getPublishedProjects } from "@/lib/data";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("home");
  const tc = await getTranslations("common");
  const tb = await getTranslations("blog");

  const [posts, projects] = await Promise.all([
    getLatestPosts(3),
    getPublishedProjects(),
  ]);

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6">
      {/* Hero */}
      <section className="flex flex-col items-center justify-center py-24 sm:py-36 text-center">
        <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-foreground">
          {t("title")}
        </h1>
        <p className="mt-4 text-lg sm:text-xl text-muted-foreground max-w-lg">
          {t("subtitle")}
        </p>
        <div className="mt-8 flex items-center gap-3">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/80 transition-colors"
          >
            {t("readBlog")}
            <ArrowRight className="size-3.5" />
          </Link>
          <Link
            href="/projects"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
          >
            {t("viewProjects")}
          </Link>
        </div>
      </section>

      {/* Latest Posts */}
      {posts.length > 0 && (
        <section className="pb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-semibold tracking-tight">
              {t("latestPosts")}
            </h2>
            <Link
              href="/blog"
              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {tc("viewAll")} <ArrowRight className="size-3" />
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group rounded-lg border border-border/50 p-5 transition-colors hover:border-border hover:bg-muted/50"
              >
                {post.category && (
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {post.category}
                  </span>
                )}
                <h3 className="mt-2 font-semibold leading-snug group-hover:text-primary transition-colors">
                  {post.title}
                </h3>
                {post.excerpt && (
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                    {post.excerpt}
                  </p>
                )}
                <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                  <time>
                    {post.publishedAt
                      ? new Date(post.publishedAt).toLocaleDateString(locale === "zh" ? "zh-CN" : "en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : ""}
                  </time>
                  {post.readingTimeMinutes && (
                    <span>{tb("minRead", { count: post.readingTimeMinutes })}</span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured Projects */}
      {projects.length > 0 && (
        <section className="pb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-semibold tracking-tight">{t("projects")}</h2>
            <Link
              href="/projects"
              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {tc("viewAll")} <ArrowRight className="size-3" />
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            {projects.map((project) => (
              <Link
                key={project.slug}
                href={`/projects/${project.slug}`}
                className="group rounded-lg border border-border/50 p-5 transition-colors hover:border-border hover:bg-muted/50"
              >
                <h3 className="font-semibold group-hover:text-primary transition-colors">
                  {project.title}
                </h3>
                {project.description && (
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                    {project.description}
                  </p>
                )}
                {project.tags && project.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {project.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
