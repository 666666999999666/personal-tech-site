import { Link } from "@/i18n/navigation";
import { FileText, Home, Settings } from "lucide-react";
import { LogoutButton } from "@/components/logout-button";
import { Button } from "@/components/ui/button";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="hidden w-60 shrink-0 border-r border-border/50 bg-sidebar md:flex md:flex-col">
        <div className="flex h-14 items-center border-b border-border/50 px-4">
          <span className="text-sm font-semibold tracking-tight">Admin</span>
        </div>

        <nav className="flex-1 space-y-1 p-3">
          <Link
            href="/admin/blog"
            className="inline-flex items-center justify-start rounded-md px-3 py-1.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground w-full text-muted-foreground"
          >
            <FileText className="size-3.5" />
            Blog
          </Link>
          <Button
            variant="ghost"
            size="sm"
            disabled
            className="w-full justify-start text-muted-foreground/40"
          >
            <Settings className="size-3.5" />
            More modules soon
          </Button>
        </nav>

        <div className="space-y-1 border-t border-border/50 p-3">
          <Link
            href="/"
            className="inline-flex items-center justify-start rounded-md px-3 py-1.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground w-full text-muted-foreground"
          >
            <Home className="size-3.5" />
            View site
          </Link>
          <LogoutButton />
        </div>
      </aside>

      {/* Main content */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar */}
        <div className="flex h-14 items-center gap-2 border-b border-border/50 px-4 md:hidden">
          <span className="text-sm font-semibold">Admin</span>
          <div className="ml-auto flex items-center gap-1">
            <Link
              href="/admin/blog"
              className="inline-flex items-center justify-center size-7 rounded-md transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <FileText className="size-4" />
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
