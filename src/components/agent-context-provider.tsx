"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import type { PageContext } from "@/lib/actions/types";
import { inferPageType } from "@/lib/agent/context";

interface AgentContextValue {
  pageContext: PageContext;
  setPageContext: (ctx: Partial<PageContext>) => void;
}

const defaultContext: PageContext = {
  route: "/",
  type: "unknown",
};

const AgentContext = createContext<AgentContextValue>({
  pageContext: defaultContext,
  setPageContext: () => {},
});

// Type for page-specific state (excluding route and type which are derived)
type PageSpecificState = Omit<PageContext, "route" | "type">;

const emptyPageState: PageSpecificState = {};

export function AgentContextProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [pageState, setPageState] = useState<PageSpecificState>(emptyPageState);

  // Reset page-specific state when pathname changes
  // (React-recommended pattern for adjusting state when a prop changes)
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setPageState(emptyPageState);
  }

  // Derive route and type from pathname during render
  const pageContext: PageContext = {
    route: pathname,
    type: inferPageType(pathname),
    ...pageState,
  };

  // Track current visible heading via IntersectionObserver
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const heading = entry.target as HTMLElement;
            const text = heading.textContent || "";
            setPageState((prev) => ({
              ...prev,
              section: text,
            }));
          }
        }
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: 0.1 }
    );

    const observeHeadings = () => {
      const headings = document.querySelectorAll("h2, h3");
      headings.forEach((h) => observer.observe(h));
    };

    // Observe after a short delay to allow content to render
    const timer = setTimeout(observeHeadings, 500);

    // Re-observe on DOM changes
    const mutationObserver = new MutationObserver(() => {
      observer.disconnect();
      observeHeadings();
    });
    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      clearTimeout(timer);
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, [pathname]);

  // Track scroll progress (throttled)
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollTop = window.scrollY;
          const docHeight = document.documentElement.scrollHeight - window.innerHeight;
          const progress = docHeight > 0 ? scrollTop / docHeight : 0;
          setPageState((prev) => ({
            ...prev,
            scrollProgress: Math.min(1, Math.max(0, progress)),
          }));
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Track text selection
  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection();
      const text = selection?.toString().trim() || "";
      setPageState((prev) => ({
        ...prev,
        selection: text || undefined,
      }));
    };

    document.addEventListener("selectionchange", handleSelectionChange);
    return () => document.removeEventListener("selectionchange", handleSelectionChange);
  }, []);

  const setPageContext = useCallback((ctx: Partial<PageContext>) => {
    setPageState((prev) => ({ ...prev, ...ctx }));
  }, []);

  return (
    <AgentContext.Provider value={{ pageContext, setPageContext }}>
      {children}
    </AgentContext.Provider>
  );
}

export function useAgentContext(): PageContext {
  const { pageContext } = useContext(AgentContext);
  return pageContext;
}

export function useSetAgentContext(): (ctx: Partial<PageContext>) => void {
  const { setPageContext } = useContext(AgentContext);
  return setPageContext;
}
