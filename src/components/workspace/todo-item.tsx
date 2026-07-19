"use client";

import { useState } from "react";
import { GripVertical, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

export interface Todo {
  id: string;
  groupId: string;
  text: string;
  done: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string, done: boolean) => void;
  onDelete: (id: string) => void;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, id: string) => void;
  isDragging: boolean;
  isDragOver: boolean;
}

export function TodoItem({
  todo,
  onToggle,
  onDelete,
  onDragStart,
  onDragOver,
  onDrop,
  isDragging,
  isDragOver,
}: TodoItemProps) {
  const t = useTranslations();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = () => {
    setIsDeleting(true);
    onDelete(todo.id);
  };

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, todo.id)}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, todo.id)}
      className={cn(
        "group flex items-center gap-2 rounded-lg border border-border/50 bg-card px-3 py-2 transition-all",
        isDragging && "opacity-40",
        isDragOver && "border-primary/50 ring-1 ring-primary/30"
      )}
    >
      {/* Drag handle */}
      <span className="cursor-grab text-muted-foreground/40 hover:text-muted-foreground active:cursor-grabbing">
        <GripVertical className="size-4" />
      </span>

      {/* Checkbox */}
      <button
        type="button"
        onClick={() => onToggle(todo.id, !todo.done)}
        className={cn(
          "flex size-4 shrink-0 items-center justify-center rounded border transition-colors",
          todo.done
            ? "border-primary bg-primary text-primary-foreground"
            : "border-input hover:border-primary/50"
        )}
        aria-label={todo.done ? t("workspace.markUndone") : t("workspace.markDone")}
      >
        {todo.done && (
          <svg
            className="size-3"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </button>

      {/* Text */}
      <span
        className={cn(
          "flex-1 text-sm",
          todo.done ? "text-muted-foreground line-through" : "text-foreground"
        )}
      >
        {todo.text}
      </span>

      {/* Delete button */}
      <button
        type="button"
        onClick={handleDelete}
        disabled={isDeleting}
        className="text-muted-foreground/40 opacity-0 transition-all hover:text-destructive group-hover:opacity-100 disabled:opacity-30"
        aria-label={t("workspace.deleteTodo")}
      >
        <Trash2 className="size-3.5" />
      </button>
    </div>
  );
}
