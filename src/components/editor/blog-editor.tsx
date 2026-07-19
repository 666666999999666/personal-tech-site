"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  Eye,
  PanelLeft,
  Maximize,
  Minimize,
  Check,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { TiptapEditor } from "@/components/editor/tiptap-editor";
import {
  FrontMatterPanel,
  type FrontMatterData,
} from "@/components/editor/frontmatter-panel";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Post } from "@/lib/data";
import { cn } from "@/lib/utils";

type SaveStatus = "saved" | "saving" | "unsaved" | "error";

function postToFrontMatter(post: Post): FrontMatterData {
  return {
    title: post.title ?? "",
    slug: post.slug ?? "",
    tags: post.tags ?? [],
    category: post.category ?? "",
    excerpt: post.excerpt ?? "",
    coverImageUrl: post.coverImageUrl ?? "",
    status: post.status === "published" ? "published" : "draft",
    publishedAt: post.publishedAt
      ? new Date(post.publishedAt).toISOString()
      : "",
  };
}

interface BlogEditorProps {
  post: Post;
}

export function BlogEditor({ post }: BlogEditorProps) {
  const postId = post.id;
  const initialContent = post.contentMd ?? "";
  const initialFrontmatter = postToFrontMatter(post);

  // Refs hold the latest values without triggering re-renders on every keystroke.
  const contentRef = useRef(initialContent);
  const frontmatterRef = useRef(initialFrontmatter);
  const isFirstRender = useRef(true);

  // UI state
  const [showFrontmatter, setShowFrontmatter] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("saved");
  const [previewContent, setPreviewContent] = useState(initialContent);
  const [dirtyCounter, setDirtyCounter] = useState(0);

  const markDirty = useCallback(() => {
    setDirtyCounter((c) => c + 1);
    setSaveStatus("unsaved");
  }, []);

  const handleContentChange = useCallback(
    (markdown: string) => {
      contentRef.current = markdown;
      markDirty();
    },
    [markDirty]
  );

  const handleFrontmatterChange = useCallback(
    (data: FrontMatterData) => {
      frontmatterRef.current = data;
      markDirty();
    },
    [markDirty]
  );

  // Debounced markdown preview update (300ms after last change)
  useEffect(() => {
    const timer = setTimeout(() => {
      setPreviewContent(contentRef.current);
    }, 300);
    return () => clearTimeout(timer);
  }, [dirtyCounter]);

  // Debounced auto-save (5s after last change)
  useEffect(() => {
    if (dirtyCounter === 0) return;
    // Skip the very first run to avoid saving on mount
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const timer = setTimeout(async () => {
      setSaveStatus("saving");
      try {
        const res = await fetch(`/api/blog/admin/posts/${postId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...frontmatterRef.current,
            contentMd: contentRef.current,
            publishedAt: frontmatterRef.current.publishedAt || null,
          }),
        });
        if (!res.ok) throw new Error("Save failed");
        setSaveStatus("saved");
      } catch (err) {
        console.error("Auto-save failed:", err);
        setSaveStatus("error");
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [dirtyCounter, postId]);

  // --- Fullscreen layout ---

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col bg-background">
        <div className="flex h-12 shrink-0 items-center justify-between border-b border-border/50 px-4">
          <SaveStatusIndicator status={saveStatus} />
          <button
            type="button"
            onClick={() => setIsFullscreen(false)}
            className="flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs text-muted-foreground hover:bg-muted transition-colors"
          >
            <Minimize className="size-3.5" />
            Exit fullscreen
          </button>
        </div>
        <div className="min-h-0 flex-1">
          <TiptapEditor
            initialContent={initialContent}
            onContentChange={handleContentChange}
            slug={initialFrontmatter.slug}
          />
        </div>
      </div>
    );
  }

  // --- Normal layout ---

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      {/* Top bar */}
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-border/50 px-4">
        <div className="flex items-center gap-3">
          <h1 className="text-sm font-semibold truncate max-w-xs">
            {initialFrontmatter.title || "Untitled"}
          </h1>
          <SaveStatusIndicator status={saveStatus} />
        </div>
        <div className="flex items-center gap-1">
          <ToggleButton
            active={showFrontmatter}
            onClick={() => setShowFrontmatter((v) => !v)}
            title="Toggle metadata panel"
          >
            <PanelLeft className="size-3.5" />
          </ToggleButton>
          <ToggleButton
            active={showPreview}
            onClick={() => setShowPreview((v) => !v)}
            title="Toggle preview"
          >
            <Eye className="size-3.5" />
          </ToggleButton>
          <ToggleButton
            active={false}
            onClick={() => setIsFullscreen(true)}
            title="Fullscreen"
          >
            <Maximize className="size-3.5" />
          </ToggleButton>
        </div>
      </div>

      {/* Main content */}
      <div className="flex min-h-0 flex-1">
        {/* Frontmatter sidebar */}
        {showFrontmatter && (
          <div className="w-72 shrink-0 overflow-y-auto border-r border-border/50 p-4">
            <h2 className="mb-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Metadata
            </h2>
            <FrontMatterPanel
              initialData={initialFrontmatter}
              onChange={handleFrontmatterChange}
            />
          </div>
        )}

        {/* Editor */}
        <div className="flex min-w-0 flex-1 flex-col p-4">
          <TiptapEditor
            initialContent={initialContent}
            onContentChange={handleContentChange}
            slug={initialFrontmatter.slug}
          />
        </div>

        {/* Markdown preview */}
        {showPreview && (
          <div className="w-1/2 shrink-0 overflow-y-auto border-l border-border/50">
            <div className="border-b border-border/50 px-4 py-2">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Preview
              </span>
            </div>
            <div className="prose prose-sm dark:prose-invert max-w-none p-4">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {previewContent || "*Nothing to preview yet*"}
              </ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SaveStatusIndicator({ status }: { status: SaveStatus }) {
  if (status === "saving") {
    return (
      <span className="flex items-center gap-1 text-xs text-muted-foreground">
        <Loader2 className="size-3 animate-spin" />
        Saving…
      </span>
    );
  }
  if (status === "unsaved") {
    return (
      <span className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
        <span className="size-1.5 rounded-full bg-amber-500" />
        Unsaved changes
      </span>
    );
  }
  if (status === "error") {
    return (
      <span className="flex items-center gap-1 text-xs text-destructive">
        <AlertCircle className="size-3" />
        Save failed
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1 text-xs text-muted-foreground">
      <Check className="size-3 text-emerald-500" />
      Saved
    </span>
  );
}

function ToggleButton({
  active,
  onClick,
  title,
  children,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={cn(
        "flex h-7 w-7 items-center justify-center rounded-md text-sm transition-colors hover:bg-muted",
        active ? "bg-muted text-foreground" : "text-muted-foreground"
      )}
    >
      {children}
    </button>
  );
}
