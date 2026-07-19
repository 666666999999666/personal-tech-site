import { Link } from "@/i18n/navigation";
import type { Metadata } from "next";
import { getAllPublishedPosts, getAllTags, getAllCategories } from "@/lib/data";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { BlogSearch } from "@/components/blog/blog-search";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("blog");
  return {
    title: t("title"),
    description: t("subtitle"),
    openGraph: {
      title: t("title"),
      description: t("subtitle"),
      url: `${SITE_URL}/blog`,
    },
    alternates: {
      canonical: `${SITE_URL}/blog`,
    },
  };
}

async function getBlogData(searchParams: { tag?: string; category?: string }) {
  const tag = searchParams.tag;
  const category = searchParams.category;

  const [allPosts, categories, tags] = await Promise.all([
    getAllPublishedPosts(),
    getAllCategories(),
    getAllTags(),
  ]);

  let filtered = allPosts;
  if (category) {
    filtered = filtered.filter((p) => p.category === category);
  }
  if (tag) {
    filtered = filtered.filter((p) => p.tags?.includes(tag));
  }

  // Build category info with counts
  const categoryInfo = categories.map((cat) => ({
    name: cat,
    count: allPosts.filter((p) => p.category === cat).length,
  }));

  return { posts: filtered, categories: categoryInfo, tags };
}

export default async function BlogPage({
  searchParams,
  params,
}: {
  searchParams: Promise<{ tag?: string; category?: string }>;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("blog");
  const search = await searchParams;
  const data = await getBlogData(search);

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-16">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="mt-2 text-muted-foreground">
          {t("subtitle")}
        </p>
      </div>

      {/* Category / Tag filters */}
      <div className="mb-6 space-y-3 border-b border-border/50 pb-4">
        {data.categories.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider mr-1">
              {t("category")}
            </span>
            <Link
              href="/blog"
              className={`rounded-full px-3 py-1 text-xs transition-colors ${
                !search.category
                  ? "bg-foreground text-background"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {t("all")}
            </Link>
            {data.categories.map((cat) => (
              <Link
                key={cat.name}
                href={`/blog?category=${encodeURIComponent(cat.name)}`}
                className={`rounded-full px-3 py-1 text-xs transition-colors ${
                  search.category === cat.name
                    ? "bg-foreground text-background"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                {cat.name} ({cat.count})
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Search + Post list (client component) */}
      <BlogSearch
        posts={data.posts}
        categories={data.categories}
        locale={locale}
      />
    </div>
  );
}
