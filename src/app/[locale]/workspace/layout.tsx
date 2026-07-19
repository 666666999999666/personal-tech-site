"use client";

import { Link, usePathname } from "@/i18n/navigation";
import {
  CheckSquare,
  StickyNote,
  Lightbulb,
  Bookmark,
  FileEdit,
  KanbanSquare,
  Home,
} from "lucide-react";
import { LogoutButton } from "@/components/logout-button";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const t = useTranslations();

  const placeholderModules = [
    { label: t("workspace.dailyNote"), icon: StickyNote },
    { label: t("workspace.ideas"), icon: Lightbulb },
    { label: t("workspace.bookmarks"), icon: Bookmark },
    { label: t("workspace.draft"), icon: FileEdit },
    { label: t("workspace.projectBoard"), icon: KanbanSquare },
  ];

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="hidden w-60 shrink-0 border-r border-border/50 bg-sidebar md:flex md:flex-col">
        <div className="flex h-14 items-center border-b border-border/50 px-4">
          <span className="text-sm font-semibold tracking-tight">{t("workspace.title")}</span>
        </div>

        <nav className="flex-1 space-y-1 p-3">
          <Link
            href="/workspace"
            className={
              pathname === "/workspace"
                ? "inline-flex items-center justify-start rounded-md px-3 py-1.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground w-full bg-muted text-foreground"
                : "inline-flex items-center justify-start rounded-md px-3 py-1.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground w-full text-muted-foreground"
            }
          >
            <CheckSquare className="size-3.5" />
            {t("workspace.todo")}
          </Link>

          {placeholderModules.map((mod) => {
            const Icon = mod.icon;
            return (
              <Button
                key={mod.label}
                variant="ghost"
                size="sm"
                disabled
                className="w-full justify-start text-muted-foreground/40"
              >
                <Icon className="size-3.5" />
                {mod.label}
              </Button>
            );
          })}
        </nav>

        <div className="space-y-1 border-t border-border/50 p-3">
          <Link
            href="/"
            className="inline-flex items-center justify-start rounded-md px-3 py-1.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground w-full text-muted-foreground"
          >
            <Home className="size-3.5" />
            {t("workspace.viewSite")}
          </Link>
          <LogoutButton />
        </div>
      </aside>

      {/* Main content */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar */}
        <div className="flex h-14 items-center gap-2 border-b border-border/50 px-4 md:hidden">
          <span className="text-sm font-semibold">{t("workspace.title")}</span>
          <div className="ml-auto flex items-center gap-1">
            <Link
              href="/workspace"
              className="inline-flex items-center justify-center size-7 rounded-md transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <CheckSquare className="size-4" />
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center size-7 rounded-md transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <Home className="size-4" />
            </Link>
            <LogoutButton />
          </div>
        </div>

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
