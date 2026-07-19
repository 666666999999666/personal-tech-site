import { Link } from "@/i18n/navigation";
import { ExternalLink, Link2 } from "lucide-react";
import type { Metadata } from "next";
import { getPublishedProjects } from "@/lib/data";
import { getTranslations, setRequestLocale } from "next-intl/server";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("projects");
  return {
    title: t("title"),
    description: t("subtitle"),
    openGraph: {
      title: t("title"),
      description: t("subtitle"),
      url: `${SITE_URL}/projects`,
    },
    alternates: {
      canonical: `${SITE_URL}/projects`,
    },
  };
}

export default async function ProjectsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("projects");
  const projects = await getPublishedProjects();

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-16">
      {/* Page header */}
      <div className="mb-12">
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="mt-2 text-muted-foreground">
          {t("subtitle")}
        </p>
      </div>

      {/* Project grid */}
      <div className="grid gap-6 sm:grid-cols-2">
        {projects.map((project) => (
          <div
            key={project.slug}
            className="group block rounded-lg border border-border/50 p-6 transition-all hover:border-border hover:bg-muted/30"
          >
            <div className="flex items-start justify-between gap-3">
              <Link
                href={`/projects/${project.slug}`}
                className="flex-1"
              >
                <h2 className="text-lg font-semibold tracking-tight group-hover:text-primary transition-colors">
                  {project.title}
                </h2>
              </Link>
              <div className="flex items-center gap-2 shrink-0">
                {project.demoUrl && (
                  <a
                    href={project.demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <ExternalLink className="size-3.5" />
                  </a>
                )}
                {project.repoUrl && (
                  <a
                    href={project.repoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <Link2 className="size-3.5" />
                  </a>
                )}
              </div>
            </div>
            <Link href={`/projects/${project.slug}`}>
              {project.description && (
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed line-clamp-3">
                  {project.description}
                </p>
              )}
            </Link>
            {project.tags && project.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Empty state */}
      {projects.length === 0 && (
        <div className="py-20 text-center">
          <p className="text-muted-foreground">{t("noProjects")}</p>
        </div>
      )}
    </div>
  );
}
