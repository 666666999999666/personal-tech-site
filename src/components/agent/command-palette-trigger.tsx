"use client";

import { useState, useEffect, useCallback } from "react";
import { CommandPalette } from "@/components/agent/command-palette";

export function CommandPaletteTrigger() {
  const [open, setOpen] = useState(false);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault();
      setOpen((prev) => !prev);
    }
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  return <CommandPalette open={open} onClose={handleClose} />;
}
