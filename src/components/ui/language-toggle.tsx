"use client";

import { useLocale } from "next-intl";
import { useTransition } from "react";
import { useRouter, usePathname } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Languages } from "lucide-react";

export function LanguageToggle() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const toggleLocale = () => {
    const newLocale = locale === "zh" ? "en" : "zh";
    // Set cookie for server-side locale detection
    document.cookie = `NEXT_LOCALE=${newLocale};path=/;max-age=${60 * 60 * 24 * 365};SameSite=Lax`;
    // Navigate using next-intl router which handles locale routing
    startTransition(() => {
      router.replace(pathname, { locale: newLocale });
    });
  };

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={toggleLocale}
      disabled={isPending}
      aria-label={locale === "zh" ? "Switch to English" : "切换到中文"}
      className="text-xs font-medium"
    >
      <Languages className="size-3.5" />
      <span className="ml-1">{locale === "zh" ? "EN" : "中"}</span>
    </Button>
  );
}
