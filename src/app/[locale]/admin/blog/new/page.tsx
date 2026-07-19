"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function NewPostPage() {
  const router = useRouter();
  const created = useRef(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (created.current) return;
    created.current = true;

    async function createDraft() {
      try {
        const res = await fetch("/api/blog/admin/posts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: "Untitled",
            status: "draft",
          }),
        });

        if (!res.ok) {
          throw new Error(`Failed to create draft (${res.status})`);
        }

        const post = await res.json();
        router.replace(`/admin/blog/${post.id}/edit`);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create post");
      }
    }

    createDraft();
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center py-20">
      {error ? (
        <div className="text-center">
          <p className="text-sm text-destructive">{error}</p>
          <p className="mt-2 text-xs text-muted-foreground">
            Make sure the blog API route exists at /api/blog/admin/posts
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="size-5 animate-spin" />
          <p className="text-sm">Creating draft…</p>
        </div>
      )}
    </div>
  );
}
