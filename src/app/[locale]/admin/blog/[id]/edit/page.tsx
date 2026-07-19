import { notFound } from "next/navigation";
import { getPostById } from "@/lib/data";
import { BlogEditor } from "@/components/editor/blog-editor";
import { setRequestLocale } from "next-intl/server";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const { id, locale } = await params;
  setRequestLocale(locale);

  const post = await getPostById(id);

  if (!post) {
    notFound();
  }

  return <BlogEditor post={post} />;
}
