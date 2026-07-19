import { getAllPublishedPosts } from "@/lib/data";
import { getTranslations, setRequestLocale } from "next-intl/server";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com";

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ locale: string }> }
) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("rss");
  const SITE_TITLE = t("title");
  const SITE_DESCRIPTION = t("description");

  let posts: Array<{
    title: string;
    slug: string;
    excerpt: string | null;
    publishedAt: Date | null;
  }> = [];

  try {
    posts = await getAllPublishedPosts();
  } catch {
    // DB not available, return empty feed
  }

  const items = posts
    .map(
      (post) => `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${SITE_URL}/blog/${post.slug}</link>
      <guid>${SITE_URL}/blog/${post.slug}</guid>
      <description>${escapeXml(post.excerpt || "")}</description>
      ${post.publishedAt ? `<pubDate>${new Date(post.publishedAt).toUTCString()}</pubDate>` : ""}
    </item>`
    )
    .join("\n");

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(SITE_TITLE)}</title>
    <link>${SITE_URL}</link>
    <description>${escapeXml(SITE_DESCRIPTION)}</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
