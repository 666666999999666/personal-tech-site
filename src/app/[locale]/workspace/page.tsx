"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, FolderPlus, Trash2, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { TodoItem, type Todo } from "@/components/workspace/todo-item";

// ---- Group types (from DB) ----
interface TodoGroup {
  id: string;
  name: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export default function WorkspacePage() {
  const t = useTranslations("workspace");
  const [groups, setGroups] = useState<TodoGroup[]>([]);
  const [todoMap, setTodoMap] = useState<Record<string, Todo[]>>({});
  const [activeGroupId, setActiveGroupId] = useState<string>("");
  const [newTodoText, setNewTodoText] = useState("");
  const [newGroupName, setNewGroupName] = useState("");
  const [showGroupInput, setShowGroupInput] = useState(false);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [deletingGroupId, setDeletingGroupId] = useState<string | null>(null);

  // Load data from DB on mount
  useEffect(() => {
    async function loadData() {
      try {
        // Fetch groups
        const groupsRes = await fetch("/api/workspace/todo-groups");
        let groupsData: TodoGroup[] = [];
        if (groupsRes.ok) {
          groupsData = await groupsRes.json();
        }

        // If no groups exist, create a default one
        if (groupsData.length === 0) {
          const createRes = await fetch("/api/workspace/todo-groups", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: "默认" }),
          });
          if (createRes.ok) {
            const created = await createRes.json();
            groupsData = [created];
          }
        }

        setGroups(groupsData);
        if (groupsData.length > 0) {
          setActiveGroupId(groupsData[0].id);
        }

        // Fetch all todos
        const todosRes = await fetch("/api/workspace/todos");
        if (todosRes.ok) {
          const allTodos: Todo[] = await todosRes.json();
          const map: Record<string, Todo[]> = {};
          for (const g of groupsData) {
            map[g.id] = [];
          }
          for (const todo of allTodos) {
            if (!map[todo.groupId]) map[todo.groupId] = [];
            map[todo.groupId].push(todo);
          }
          setTodoMap(map);
        }
      } catch (err) {
        console.error("Failed to load workspace data:", err);
      } finally {
        setLoaded(true);
      }
    }
    loadData();
  }, []);

  const activeTodos = todoMap[activeGroupId] || [];
  const pendingCount = activeTodos.filter((t) => !t.done).length;
  const doneCount = activeTodos.length - pendingCount;

  // Refresh todos for a specific group
  const refreshTodos = useCallback(async (groupId: string) => {
    try {
      const res = await fetch(`/api/workspace/todos?groupId=${groupId}`);
      if (res.ok) {
        const data: Todo[] = await res.json();
        setTodoMap((prev) => ({ ...prev, [groupId]: data }));
      }
    } catch {}
  }, []);

  // ---- Group CRUD ----
  const handleAddGroup = useCallback(async () => {
    const name = newGroupName.trim();
    if (!name) return;
    try {
      const res = await fetch("/api/workspace/todo-groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (res.ok) {
        const created = await res.json();
        setGroups((prev) => [...prev, created]);
        setTodoMap((prev) => ({ ...prev, [created.id]: [] }));
        setActiveGroupId(created.id);
      }
    } catch {}
    setNewGroupName("");
    setShowGroupInput(false);
  }, [newGroupName]);

  const handleDeleteGroup = useCallback(async (groupId: string) => {
    if (deletingGroupId) return;
    setDeletingGroupId(groupId);
    try {
      const res = await fetch(`/api/workspace/todo-groups/${groupId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        const updated = groups.filter((g) => g.id !== groupId);
        setGroups(updated);
        setTodoMap((prev) => {
          const newMap = { ...prev };
          delete newMap[groupId];
          return newMap;
        });
        if (activeGroupId === groupId && updated.length > 0) {
          setActiveGroupId(updated[0].id);
        }
      }
    } catch {}
    setDeletingGroupId(null);
  }, [groups, activeGroupId, deletingGroupId]);

  // ---- Todo CRUD ----
  const handleAddTodo = useCallback(async () => {
    const text = newTodoText.trim();
    if (!text) return;
    try {
      const res = await fetch("/api/workspace/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, groupId: activeGroupId }),
      });
      if (res.ok) {
        await refreshTodos(activeGroupId);
      }
    } catch {}
    setNewTodoText("");
  }, [newTodoText, activeGroupId, refreshTodos]);

  const handleToggle = useCallback(async (id: string, done: boolean) => {
    try {
      const res = await fetch(`/api/workspace/todos/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ done }),
      });
      if (res.ok) {
        setTodoMap((prev) => ({
          ...prev,
          [activeGroupId]: (prev[activeGroupId] || []).map((t) =>
            t.id === id ? { ...t, done } : t
          ),
        }));
      }
    } catch {}
  }, [activeGroupId]);

  const handleDelete = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/workspace/todos/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setTodoMap((prev) => ({
          ...prev,
          [activeGroupId]: (prev[activeGroupId] || []).filter((t) => t.id !== id),
        }));
      }
    } catch {}
  }, [activeGroupId]);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggingId(id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDrop = async (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    setDragOverId(null);
    if (!draggingId || draggingId === targetId) {
      setDraggingId(null);
      return;
    }
    const draggedIndex = activeTodos.findIndex((t) => t.id === draggingId);
    const targetIndex = activeTodos.findIndex((t) => t.id === targetId);
    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggingId(null);
      return;
    }
    const reordered = [...activeTodos];
    const [moved] = reordered.splice(draggedIndex, 1);
    reordered.splice(targetIndex, 0, moved);
    const updated = reordered.map((t, i) => ({ ...t, sortOrder: i + 1 }));

    // Optimistic update
    setTodoMap((prev) => ({ ...prev, [activeGroupId]: updated }));
    setDraggingId(null);

    // Persist reorder
    try {
      await fetch("/api/workspace/todos/reorder", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: updated.map((t) => ({ id: t.id, sortOrder: t.sortOrder })),
        }),
      });
    } catch {}
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAddTodo();
    }
  };

  if (!loaded) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-32 bg-muted rounded" />
          <div className="h-10 bg-muted rounded" />
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-10 bg-muted/50 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="flex gap-6">
        {/* Left: Group sidebar */}
        <div className="w-48 shrink-0 hidden sm:block">
          <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
            {t("groups")}
          </h2>
          <div className="space-y-1">
            {groups.map((group) => (
              <div
                key={group.id}
                className={`group flex items-center justify-between rounded-md px-3 py-2 text-sm cursor-pointer transition-colors ${
                  activeGroupId === group.id
                    ? "bg-accent text-accent-foreground font-medium"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground"
                }`}
                onClick={() => setActiveGroupId(group.id)}
              >
                <span className="truncate">{group.name}</span>
                {groups.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (deletingGroupId !== group.id) {
                        handleDeleteGroup(group.id);
                      }
                    }}
                    disabled={deletingGroupId === group.id}
                    className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all disabled:opacity-30"
                  >
                    <X className="size-3" />
                  </button>
                )}
              </div>
            ))}

            {/* Add group */}
            {showGroupInput ? (
              <div className="flex items-center gap-1 px-1">
                <input
                  type="text"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddGroup();
                    if (e.key === "Escape") { setShowGroupInput(false); setNewGroupName(""); }
                  }}
                  placeholder={t("groupNamePlaceholder")}
                  autoFocus
                  className="flex-1 min-w-0 rounded border border-border bg-background px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-ring"
                />
                <button onClick={handleAddGroup} className="text-primary hover:text-primary/80">
                  <Check className="size-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowGroupInput(true)}
                className="flex items-center gap-1.5 w-full rounded-md px-3 py-2 text-xs text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground transition-colors"
              >
                <FolderPlus className="size-3.5" /> {t("addGroup")}
              </button>
            )}
          </div>
        </div>

        {/* Mobile: group tabs */}
        <div className="sm:hidden w-full">
          <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
            {groups.map((group) => (
              <button
                key={group.id}
                onClick={() => setActiveGroupId(group.id)}
                className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  activeGroupId === group.id
                    ? "bg-foreground text-background"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                {group.name}
              </button>
            ))}
            <button
              onClick={() => setShowGroupInput(!showGroupInput)}
              className="shrink-0 rounded-full px-2 py-1 text-xs text-muted-foreground hover:bg-accent transition-colors"
            >
              <Plus className="size-3" />
            </button>
          </div>
          {showGroupInput && (
            <div className="flex items-center gap-2 mb-4">
              <input
                type="text"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddGroup();
                  if (e.key === "Escape") { setShowGroupInput(false); setNewGroupName(""); }
                }}
                placeholder={t("groupNamePlaceholder")}
                autoFocus
                className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring"
              />
              <Button onClick={handleAddGroup} size="sm">{t("add")}</Button>
            </div>
          )}
        </div>

        {/* Right: Todo list */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="mb-4">
            <h1 className="text-xl font-semibold tracking-tight">
              {groups.find((g) => g.id === activeGroupId)?.name || t("todo")}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {activeTodos.length === 0
                ? t("noTodos")
                : `${pendingCount} ${t("pending")} · ${doneCount} ${t("done")}`}
            </p>
          </div>

          {/* Add input */}
          <div className="mb-4 flex gap-2">
            <input
              type="text"
              value={newTodoText}
              onChange={(e) => setNewTodoText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t("addPlaceholder")}
              autoFocus
              className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/50"
            />
            <Button
              onClick={handleAddTodo}
              disabled={!newTodoText.trim()}
              size="default"
            >
              <Plus className="size-4" />
              {t("add")}
            </Button>
          </div>

          {/* Todo list */}
          {activeTodos.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border/60 py-12 text-center">
              <p className="text-sm text-muted-foreground">{t("nothingTodo")}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {activeTodos.map((todo) => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  onToggle={handleToggle}
                  onDelete={handleDelete}
                  onDragStart={handleDragStart}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOverId(todo.id);
                  }}
                  onDrop={handleDrop}
                  isDragging={draggingId === todo.id}
                  isDragOver={dragOverId === todo.id && draggingId !== todo.id}
                />
              ))}
            </div>
          )}

          {/* Footer hint */}
          {activeTodos.length > 0 && (
            <p className="mt-6 text-center text-xs text-muted-foreground/50">
              {t("dragHint")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
