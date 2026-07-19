import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { getPostBySlug, getAllPublishedPostSlugs } from "@/lib/data";
import { MarkdownRenderer } from "@/components/markdown/MarkdownRenderer";
import { TableOfContents, type TocItem } from "@/components/blog/TableOfContents";
import { ReadingProgressBar } from "@/components/blog/ReadingProgressBar";
import { BlogContextSetter } from "@/components/blog/blog-context-setter";
import { Calendar, Clock, ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com";

export async function generateStaticParams() {
  const slugs = await getAllPublishedPostSlugs();
  return slugs.flatMap((slug) =>
    routing.locales.map((locale) => ({ slug, locale }))
  );
}

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return {};

  const title = post.title;
  const description = post.excerpt || "";
  const url = `${SITE_URL}/blog/${slug}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      type: "article",
      publishedTime: post.publishedAt ? new Date(post.publishedAt).toISOString() : undefined,
      tags: post.tags || [],
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

function extractToc(content: string): TocItem[] {
  const headingRegex = /^(#{2,4})\s+(.+)$/gm;
  const items: TocItem[] = [];
  let match;
  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length;
    const text = match[2].trim();
    // Support Chinese characters in anchor IDs
    const id = text
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w一-鿿-]/g, "")
      .replace(/(^-|-$)/g, "");
    items.push({ id, text, level });
  }
  return items;
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}) {
  const { slug, locale } = await params;
  setRequestLocale(locale);

  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const t = await getTranslations("blog");

  const tocItems = post.contentMd ? extractToc(post.contentMd) : [];

  function formatDate(date: Date | string | null): string {
    if (!date) return "";
    return new Date(date).toLocaleDateString(locale === "zh" ? "zh-CN" : "en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt || "",
    datePublished: post.publishedAt ? new Date(post.publishedAt).toISOString() : undefined,
    url: `${SITE_URL}/blog/${slug}`,
    keywords: post.tags?.join(", ") || "",
  };

  return (
    <>
      <BlogContextSetter
        title={post.title}
        slug={post.slug}
        tags={post.tags ?? undefined}
        category={post.category ?? undefined}
        publishedAt={post.publishedAt ? new Date(post.publishedAt).toISOString() : undefined}
        readingTime={post.readingTimeMinutes ?? undefined}
      />
      <ReadingProgressBar />
      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-12">
        {/* Back link */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="size-3.5" />
          {t("backToBlog")}
        </Link>

        <div className="flex gap-12">
          {/* Article content */}
          <article className="min-w-0 flex-1">
            <header className="mb-10">
              {post.category && (
                <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  {post.category}
                </span>
              )}
              <h1 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight">
                {post.title}
              </h1>
              <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
                {post.publishedAt && (
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="size-3.5" />
                    <time>{formatDate(post.publishedAt)}</time>
                  </span>
                )}
                {post.readingTimeMinutes && (
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="size-3.5" />
                    {t("minRead", { count: post.readingTimeMinutes })}
                  </span>
                )}
              </div>
              {post.tags && post.tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {post.tags.map((tag) => (
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
            <div className="max-w-3xl">
              {post.contentMd && <MarkdownRenderer content={post.contentMd} />}
            </div>

            {/* Footer */}
            <footer className="mt-16 border-t border-border/50 pt-6">
              <Link
                href="/blog"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {t("backToBlog")}
              </Link>
            </footer>
          </article>

          {/* Table of contents sidebar */}
          {tocItems.length > 0 && (
            <aside className="hidden lg:block w-56 shrink-0">
              <TableOfContents items={tocItems} />
            </aside>
          )}
        </div>
      </div>
    </>
  );
}
