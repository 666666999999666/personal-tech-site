"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { Menu, X, Lock, LogOut } from "lucide-react";

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
    </svg>
  );
}
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { LanguageToggle } from "@/components/ui/language-toggle";
import { useSession, signOut } from "next-auth/react";

interface NavLink {
  href: string;
  label: string;
}

const navLinkClass = (active: boolean) =>
  `inline-flex items-center justify-center rounded-md px-3 py-1.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground ${
    active ? "text-foreground" : "text-muted-foreground"
  }`;

const navLinkClassMobile = (active: boolean) =>
  `inline-flex items-center justify-start rounded-md px-3 py-1.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground w-full ${
    active ? "text-foreground" : "text-muted-foreground"
  }`;

export function Navbar({ links }: { links: NavLink[] }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const t = useTranslations("nav");
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="text-sm font-semibold tracking-tight hover:text-foreground/80 transition-colors"
        >
          QZ Site
        </Link>

        {/* Desktop nav */}
        <nav className="hidden sm:flex items-center gap-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={navLinkClass(pathname === link.href)}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {/* GitHub */}
          <a
            href="https://github.com/666666999999666"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
            aria-label="GitHub"
          >
            <GitHubIcon className="size-4" />
          </a>

          <LanguageToggle />
          <ThemeToggle />

          {/* Lock icon: logged in → workspace + logout, logged out → login */}
          {session?.user ? (
            <div className="flex items-center gap-1">
              <Link
                href="/workspace"
                className="inline-flex items-center justify-center rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                aria-label={t("workspace")}
                title={t("workspace")}
              >
                <Lock className="size-4 text-primary" />
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="inline-flex items-center justify-center rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                aria-label={t("logout")}
                title={t("logout")}
              >
                <LogOut className="size-3.5" />
              </button>
            </div>
          ) : (
            <Link
              href="/workspace/login"
              className="inline-flex items-center justify-center rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
              aria-label={t("login")}
              title={t("login")}
            >
              <Lock className="size-4" />
            </Link>
          )}

          {/* Mobile hamburger */}
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-accent-foreground sm:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <nav className="sm:hidden border-t border-border/50 bg-background/95 backdrop-blur-md">
          <div className="mx-auto max-w-5xl px-4 py-3 flex flex-col gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={navLinkClassMobile(pathname === link.href)}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <a
              href="https://github.com/666666999999666"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-start gap-2 rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground w-full"
              onClick={() => setMobileOpen(false)}
            >
              <GitHubIcon className="size-4" /> GitHub
            </a>
            {session?.user ? (
              <>
                <Link
                  href="/workspace"
                  className="inline-flex items-center justify-start gap-2 rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground w-full"
                  onClick={() => setMobileOpen(false)}
                >
                  <Lock className="size-4 text-primary" /> {t("workspace")}
                </Link>
                <button
                  onClick={() => { signOut({ callbackUrl: "/" }); setMobileOpen(false); }}
                  className="inline-flex items-center justify-start gap-2 rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground w-full"
                >
                  <LogOut className="size-4" /> {t("logout")}
                </button>
              </>
            ) : (
              <Link
                href="/workspace/login"
                className="inline-flex items-center justify-start gap-2 rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground w-full"
                onClick={() => setMobileOpen(false)}
              >
                <Lock className="size-4" /> {t("login")}
              </Link>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
