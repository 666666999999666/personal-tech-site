"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

export function LogoutButton() {
  const t = useTranslations();
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => signOut({ callbackUrl: "/" })}
      className="text-muted-foreground"
    >
      <LogOut className="size-3.5" />
      {t("logout.label")}
    </Button>
  );
}
