"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function DeletePostButton({ postId, postTitle }: { postId: string; postTitle: string }) {
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/blog/admin/posts/${postId}`, { method: "DELETE" });
      if (res.ok) {
        router.refresh();
      } else {
        alert("删除失败");
      }
    } catch {
      alert("删除失败");
    } finally {
      setDeleting(false);
      setConfirming(false);
    }
  }

  if (confirming) {
    return (
      <span className="inline-flex items-center gap-1">
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="inline-flex items-center justify-center rounded-md px-2 h-7 text-xs font-medium bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors disabled:opacity-50"
        >
          {deleting ? "删除中..." : "确认"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          disabled={deleting}
          className="inline-flex items-center justify-center rounded-md px-2 h-7 text-xs font-medium text-muted-foreground hover:bg-accent transition-colors"
        >
          取消
        </button>
      </span>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="inline-flex items-center justify-center size-7 rounded-md transition-colors hover:bg-destructive/10 hover:text-destructive text-muted-foreground"
      title={`删除 "${postTitle}"`}
    >
      <Trash2 className="size-3.5" />
    </button>
  );
}
