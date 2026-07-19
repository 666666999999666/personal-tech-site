import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { getProjectBySlug, getAllPublishedProjectSlugs } from "@/lib/data";
import { MarkdownRenderer } from "@/components/markdown/MarkdownRenderer";
import { ExternalLink, Link2, ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com";

const placeholderProject = {
  slug: "personal-site-v2",
  title: "Personal Site V2",
  description:
    "This website — an agent-native personal site built with Next.js 15, Tailwind CSS v4, and more.",
  contentMd:
    "## Overview\n\nThis is my personal website, rebuilt from scratch with modern technologies.\n\n## Tech Stack\n\n- **Next.js 15** with App Router\n- **Tailwind CSS v4** for styling\n- **TypeScript** for type safety\n- **Drizzle ORM** for database\n\n## Features\n\n- Blog with Markdown support\n- Project showcase\n- Dark mode\n- SSG/ISR for performance",
  tags: ["Next.js", "TypeScript", "Tailwind"],
  demoUrl: "/",
  repoUrl: "https://github.com",
  coverImageUrl: null,
};

async function getProject(slug: string) {
  try {
    const project = await getProjectBySlug(slug);
    return project;
  } catch {
    if (slug === placeholderProject.slug) return placeholderProject;
    return null;
  }
}

export async function generateStaticParams() {
  try {
    const slugs = await getAllPublishedProjectSlugs();
    return slugs.flatMap((slug) =>
      routing.locales.map((locale) => ({ slug, locale }))
    );
  } catch {
    return routing.locales.map((locale) => ({ slug: placeholderProject.slug, locale }));
  }
}

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) return {};

  const title = project.title;
  const description = project.description || "";
  const url = `${SITE_URL}/projects/${slug}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    alternates: {
      canonical: url,
    },
  };
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}) {
  const { slug, locale } = await params;
  setRequestLocale(locale);

  const project = await getProject(slug);
  if (!project) notFound();

  const t = await getTranslations("projects");

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-12">
      {/* Back link */}
      <Link
        href="/projects"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
      >
        <ArrowLeft className="size-3.5" />
        {t("backToProjects")}
      </Link>

      <article className="max-w-3xl">
        <header className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            {project.title}
          </h1>
          {project.description && (
            <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
              {project.description}
            </p>
          )}
          <div className="mt-5 flex items-center gap-4">
            {project.demoUrl && (
              <a
                href={project.demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full bg-foreground text-background px-4 py-1.5 text-sm font-medium hover:opacity-90 transition-opacity"
              >
                <ExternalLink className="size-3.5" />
                {t("liveDemo")}
              </a>
            )}
            {project.repoUrl && (
              <a
                href={project.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <Link2 className="size-3.5" />
                {t("sourceCode")}
              </a>
            )}
          </div>
          {project.tags && project.tags.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-1.5">
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
        </header>

        {/* Content */}
        {project.contentMd && <MarkdownRenderer content={project.contentMd} />}

        {/* Footer */}
        <footer className="mt-16 border-t border-border/50 pt-6">
          <Link
            href="/projects"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-3.5" />
            {t("backToProjects")}
          </Link>
        </footer>
      </article>
    </div>
  );
}
