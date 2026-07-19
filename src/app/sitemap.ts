import type { MetadataRoute } from "next";
import { getAllPublishedPostSlugs, getAllPublishedProjectSlugs } from "@/lib/data";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 1 },
    { url: `${SITE_URL}/blog`, lastModified: new Date(), changeFrequency: "daily" as const, priority: 0.8 },
    { url: `${SITE_URL}/projects`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.7 },
    { url: `${SITE_URL}/about`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.5 },
  ];

  let postRoutes: MetadataRoute.Sitemap = [];
  let projectRoutes: MetadataRoute.Sitemap = [];

  try {
    const [postSlugs, projectSlugs] = await Promise.all([
      getAllPublishedPostSlugs(),
      getAllPublishedProjectSlugs(),
    ]);

    postRoutes = postSlugs.map((slug) => ({
      url: `${SITE_URL}/blog/${slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }));

    projectRoutes = projectSlugs.map((slug) => ({
      url: `${SITE_URL}/projects/${slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }));
  } catch {
    // DB not available, return static routes only
  }

  return [...staticRoutes, ...postRoutes, ...projectRoutes];
}
