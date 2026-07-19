"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";

export function ReadingProgressBar() {
  const t = useTranslations();
  const [progress, setProgress] = useState(0);

  const updateProgress = useCallback(() => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (docHeight > 0) {
      setProgress(Math.min((scrollTop / docHeight) * 100, 100));
    }
  }, []);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          updateProgress();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    requestAnimationFrame(updateProgress);

    return () => window.removeEventListener("scroll", handleScroll);
  }, [updateProgress]);

  return (
    <div
      className="fixed top-0 left-0 z-[60] h-[2px] bg-primary transition-[width] duration-150 ease-out"
      style={{ width: `${progress}%` }}
      role="progressbar"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={t("components.readingProgress")}
    />
  );
}
