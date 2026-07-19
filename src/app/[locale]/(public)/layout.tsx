import { Navbar } from "@/components/navbar";
import { getTranslations, setRequestLocale } from "next-intl/server";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function PublicLayout({ children, params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("nav");
  const tc = await getTranslations("common");

  const navLinks = [
    { href: "/", label: t("home") },
    { href: "/blog", label: t("blog") },
    { href: "/projects", label: t("projects") },
    { href: "/about", label: t("about") },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar links={navLinks} />
      <main className="flex-1">{children}</main>
      <footer className="border-t border-border/50 py-8">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <p className="text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} {tc("brand")}. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
