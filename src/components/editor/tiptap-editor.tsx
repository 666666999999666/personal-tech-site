"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useEditor, useEditorState, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { Markdown } from "tiptap-markdown";
import type { MarkdownStorage } from "tiptap-markdown";
import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Link as LinkIcon,
  Image as ImageIcon,
  Maximize,
  Minimize,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TiptapEditorProps {
  initialContent: string;
  onContentChange: (markdown: string) => void;
  slug: string;
}

interface ToolbarState {
  isBold: boolean;
  isItalic: boolean;
  isH2: boolean;
  isH3: boolean;
  isBulletList: boolean;
  isOrderedList: boolean;
  isCodeBlock: boolean;
  isBlockquote: boolean;
  isLink: boolean;
}

const defaultToolbarState: ToolbarState = {
  isBold: false,
  isItalic: false,
  isH2: false,
  isH3: false,
  isBulletList: false,
  isOrderedList: false,
  isCodeBlock: false,
  isBlockquote: false,
  isLink: false,
};

async function uploadImage(file: File, slug: string): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("slug", slug);
  const res = await fetch("/api/upload", { method: "POST", body: formData });
  if (!res.ok) throw new Error("Upload failed");
  const data = await res.json();
  return data.url as string;
}

function ToolbarButton({
  onClick,
  isActive,
  disabled,
  title,
  children,
}: {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-md text-sm transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40",
        isActive ? "bg-muted text-foreground" : "text-muted-foreground"
      )}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div className="mx-1 h-5 w-px bg-border" />;
}

export function TiptapEditor({
  initialContent,
  onContentChange,
  slug,
}: TiptapEditorProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Refs to always access latest values inside editor callbacks without
  // causing the editor instance to be re-created.
  const onContentChangeRef = useRef(onContentChange);
  const slugRef = useRef(slug);
  useEffect(() => {
    onContentChangeRef.current = onContentChange;
  }, [onContentChange]);
  useEffect(() => {
    slugRef.current = slug;
  }, [slug]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        link: false,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { rel: "noopener noreferrer nofollow" },
      }),
      Image.configure({ inline: false }),
      Placeholder.configure({ placeholder: "Start writing…" }),
      Markdown.configure({
        html: true,
        tightLists: true,
        linkify: false,
        breaks: false,
        transformPastedText: true,
        transformCopiedText: true,
      }),
    ],
    content: initialContent,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "prose prose-sm dark:prose-invert max-w-none p-4",
      },
    },
    onUpdate: ({ editor }) => {
      const markdown = (editor.storage as unknown as { markdown: MarkdownStorage }).markdown.getMarkdown();
      onContentChangeRef.current(markdown);
    },
  });

  const toolbarState =
    useEditorState({
      editor,
      selector: ({ editor }): ToolbarState => {
        if (!editor) return defaultToolbarState;
        return {
          isBold: editor.isActive("bold"),
          isItalic: editor.isActive("italic"),
          isH2: editor.isActive("heading", { level: 2 }),
          isH3: editor.isActive("heading", { level: 3 }),
          isBulletList: editor.isActive("bulletList"),
          isOrderedList: editor.isActive("orderedList"),
          isCodeBlock: editor.isActive("codeBlock"),
          isBlockquote: editor.isActive("blockquote"),
          isLink: editor.isActive("link"),
        };
      },
    }) ?? defaultToolbarState;

  // --- Image upload helpers ---

  const handleFileUpload = useCallback(
    async (file: File) => {
      if (!editor) return;
      setIsUploading(true);
      try {
        const url = await uploadImage(file, slugRef.current);
        editor.chain().focus().setImage({ src: url }).run();
      } catch (err) {
        console.error("Image upload failed:", err);
      } finally {
        setIsUploading(false);
      }
    },
    [editor]
  );

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFileUpload(file);
      e.target.value = "";
    },
    [handleFileUpload]
  );

  // --- Drag-and-drop image upload (capture phase to intercept before ProseMirror) ---

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    const onDrop = (e: DragEvent) => {
      const files = e.dataTransfer?.files;
      if (!files || files.length === 0) return;
      const images = Array.from(files).filter((f) =>
        f.type.startsWith("image/")
      );
      if (images.length === 0) return;
      e.preventDefault();
      e.stopPropagation();
      images.forEach((file) => handleFileUpload(file));
    };

    const onDragOver = (e: DragEvent) => {
      if (e.dataTransfer?.types?.includes("Files")) {
        e.preventDefault();
      }
    };

    el.addEventListener("drop", onDrop, true);
    el.addEventListener("dragover", onDragOver, true);
    return () => {
      el.removeEventListener("drop", onDrop, true);
      el.removeEventListener("dragover", onDragOver, true);
    };
  }, [handleFileUpload]);

  // --- Link ---

  const toggleLink = useCallback(() => {
    if (!editor) return;
    if (editor.isActive("link")) {
      editor.chain().focus().unsetLink().run();
      return;
    }
    const url = window.prompt("Enter URL");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().unsetLink().run();
      return;
    }
    editor.chain().focus().toggleLink({ href: url }).run();
  }, [editor]);

  return (
    <div
      ref={wrapperRef}
      className={cn(
        "flex flex-col bg-background",
        isFullscreen
          ? "fixed inset-0 z-50"
          : "h-full min-h-[400px] rounded-lg border border-border/50"
      )}
    >
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-border/50 p-2">
        <ToolbarButton
          title="Bold"
          onClick={() => editor?.chain().focus().toggleBold().run()}
          isActive={toolbarState.isBold}
          disabled={!editor}
        >
          <Bold className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Italic"
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          isActive={toolbarState.isItalic}
          disabled={!editor}
        >
          <Italic className="size-4" />
        </ToolbarButton>

        <Divider />

        <ToolbarButton
          title="Heading 2"
          onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={toolbarState.isH2}
          disabled={!editor}
        >
          <Heading2 className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Heading 3"
          onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
          isActive={toolbarState.isH3}
          disabled={!editor}
        >
          <Heading3 className="size-4" />
        </ToolbarButton>

        <Divider />

        <ToolbarButton
          title="Bullet list"
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
          isActive={toolbarState.isBulletList}
          disabled={!editor}
        >
          <List className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Ordered list"
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          isActive={toolbarState.isOrderedList}
          disabled={!editor}
        >
          <ListOrdered className="size-4" />
        </ToolbarButton>

        <Divider />

        <ToolbarButton
          title="Quote"
          onClick={() => editor?.chain().focus().toggleBlockquote().run()}
          isActive={toolbarState.isBlockquote}
          disabled={!editor}
        >
          <Quote className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Code block"
          onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
          isActive={toolbarState.isCodeBlock}
          disabled={!editor}
        >
          <Code className="size-4" />
        </ToolbarButton>

        <Divider />

        <ToolbarButton
          title="Link"
          onClick={toggleLink}
          isActive={toolbarState.isLink}
          disabled={!editor}
        >
          <LinkIcon className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Insert image"
          onClick={() => fileInputRef.current?.click()}
          disabled={!editor || isUploading}
        >
          {isUploading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <ImageIcon className="size-4" />
          )}
        </ToolbarButton>

        <div className="ml-auto">
          <ToolbarButton
            title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
            onClick={() => setIsFullscreen((v) => !v)}
          >
            {isFullscreen ? (
              <Minimize className="size-4" />
            ) : (
              <Maximize className="size-4" />
            )}
          </ToolbarButton>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-y-auto">
        {editor ? (
          <EditorContent editor={editor} />
        ) : (
          <div className="flex items-center gap-2 p-4 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Loading editor…
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileInputChange}
      />
    </div>
  );
}
