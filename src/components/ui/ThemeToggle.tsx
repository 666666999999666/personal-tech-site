"use client";

import { useSyncExternalStore, useCallback } from "react";
import { useTheme } from "@teispace/next-themes";
import { Moon, Sun } from "lucide-react";
import { useTranslations } from "next-intl";

// Returns false on server, true on client — without useEffect + setState
function useMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const t = useTranslations();
  const mounted = useMounted();

  const toggle = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [theme, setTheme]);

  if (!mounted) {
    return (
      <button
        className="inline-flex size-8 items-center justify-center rounded-lg hover:bg-muted"
        aria-label={t("components.toggleTheme")}
      />
    );
  }

  return (
    <button
      onClick={toggle}
      className="inline-flex size-8 items-center justify-center rounded-lg hover:bg-muted transition-colors"
      aria-label={t("components.toggleTheme")}
    >
      {theme === "dark" ? (
        <Sun className="size-4" />
      ) : (
        <Moon className="size-4" />
      )}
    </button>
  );
}
