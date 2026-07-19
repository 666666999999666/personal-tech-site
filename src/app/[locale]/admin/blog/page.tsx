import { Link } from "@/i18n/navigation";
import { Plus, Pencil, FileText, Trash2 } from "lucide-react";
import { getAllPostsAdmin } from "@/lib/data";
import { setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { DeletePostButton } from "./delete-post-button";

export const metadata: Metadata = {
  title: "Blog Admin",
};

function formatDate(date: Date | string | null): string {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function StatusBadge({ status }: { status: string }) {
  const isPublished = status === "published";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
        isPublished
          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
      }`}
    >
      {isPublished ? "Published" : "Draft"}
    </span>
  );
}

export default async function BlogAdminPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  let posts: Awaited<ReturnType<typeof getAllPostsAdmin>> = [];

  try {
    posts = await getAllPostsAdmin();
  } catch {
    posts = [];
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Blog Posts</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {posts.length} {posts.length === 1 ? "post" : "posts"} total
          </p>
        </div>
        <Link
          href="/admin/blog/new"
          className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground hover:bg-primary/80 px-2.5 h-8 gap-1.5 text-sm font-medium transition-colors"
        >
          <Plus className="size-3.5" />
          New Post
        </Link>
      </div>

      {/* Table */}
      {posts.length > 0 ? (
        <div className="overflow-hidden rounded-lg border border-border/50">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr className="text-left">
                <th className="px-4 py-3 font-medium text-muted-foreground">
                  Title
                </th>
                <th className="px-4 py-3 font-medium text-muted-foreground">
                  Status
                </th>
                <th className="hidden px-4 py-3 font-medium text-muted-foreground sm:table-cell">
                  Published
                </th>
                <th className="hidden px-4 py-3 font-medium text-muted-foreground md:table-cell">
                  Created
                </th>
                <th className="px-4 py-3 font-medium text-muted-foreground text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {posts.map((post) => (
                <tr key={post.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/blog/${post.id}/edit`}
                      className="font-medium hover:text-primary transition-colors"
                    >
                      {post.title || "Untitled"}
                    </Link>
                    {post.slug && (
                      <p className="text-xs text-muted-foreground">/{post.slug}</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={post.status} />
                  </td>
                  <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">
                    {formatDate(post.publishedAt)}
                  </td>
                  <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                    {formatDate(post.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/admin/blog/${post.id}/edit`}
                        className="inline-flex items-center justify-center size-7 rounded-md transition-colors hover:bg-accent hover:text-accent-foreground"
                      >
                        <Pencil className="size-3.5" />
                      </Link>
                      <DeletePostButton postId={post.id} postTitle={post.title || "Untitled"} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-20 text-center">
          <FileText className="size-8 text-muted-foreground/40" />
          <p className="mt-4 text-sm text-muted-foreground">No posts yet.</p>
          <Link
            href="/admin/blog/new"
            className="mt-4 inline-flex items-center justify-center rounded-md border border-border bg-background hover:bg-muted hover:text-foreground px-2.5 h-7 gap-1 text-sm font-medium transition-colors"
          >
            <Plus className="size-3.5" />
            Create your first post
          </Link>
        </div>
      )}
    </div>
  );
}
