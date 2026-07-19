"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";

interface LightboxProps {
  src: string;
  alt?: string;
  images?: { src: string; alt?: string }[];
  initialIndex?: number;
  onClose: () => void;
}

export function Lightbox({
  src,
  alt,
  images,
  initialIndex = 0,
  onClose,
}: LightboxProps) {
  const t = useTranslations();
  const [currentIndex, setCurrentIndex] = useState(() => {
    if (images) {
      const found = images.findIndex((img) => img.src === src);
      return found >= 0 ? found : initialIndex;
    }
    return 0;
  });

  const hasMultiple = images && images.length > 1;
  const overlayRef = useRef<HTMLDivElement>(null);

  const goNext = useCallback(() => {
    if (!images) return;
    setCurrentIndex((i) => (i + 1) % images.length);
  }, [images]);

  const goPrev = useCallback(() => {
    if (!images) return;
    setCurrentIndex((i) => (i - 1 + images.length) % images.length);
  }, [images]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose, goNext, goPrev]);

  const current = images?.[currentIndex] ?? { src, alt };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label={t("components.imageLightbox")}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-colors"
        aria-label={t("components.closeLightbox")}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>

      {/* Navigation arrows */}
      {hasMultiple && (
        <>
          <button
            onClick={goPrev}
            className="absolute left-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-colors"
            aria-label={t("components.prevImage")}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <button
            onClick={goNext}
            className="absolute right-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-colors"
            aria-label={t("components.nextImage")}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </>
      )}

      {/* Image */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={current.src}
        alt={current.alt || ""}
        className="max-h-[85vh] max-w-[90vw] rounded-lg object-contain shadow-2xl"
      />

      {/* Counter */}
      {hasMultiple && (
        <div className="absolute bottom-4 text-sm text-white/60">
          {currentIndex + 1} / {images!.length}
        </div>
      )}
    </div>
  );
}
