import { useCallback, useEffect, useState } from "react";

export type ThemeMode = "auto" | "light" | "dark";
export type ResolvedTheme = "light" | "dark";

const STORAGE_KEY = "fx-theme-mode";

function readStored(): ThemeMode {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v === "light" || v === "dark" ? v : "auto";
  } catch {
    return "auto";
  }
}

function systemTheme(): ResolvedTheme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyDom(theme: ResolvedTheme) {
  const root = document.documentElement;
  root.dataset.theme = theme;
  root.style.colorScheme = theme;
}

/** Paint the new theme, optionally revealing it with a circle wipe from a pointer position. */
type ViewTransition = {
  ready: Promise<void>;
  finished: Promise<void>;
  skipTransition?: () => void;
};
let activeTransition: ViewTransition | null = null;
// The latest requested theme; a pending (possibly skipped) transition callback
// always paints this instead of the theme it was created with, so rapid clicks
// can never be overwritten by a stale callback.
let pendingTheme: ResolvedTheme | null = null;

function paint(theme: ResolvedTheme, from?: { x: number; y: number }) {
  const root = document.documentElement as HTMLElement & {
    startViewTransition?: (cb: () => void) => ViewTransition;
  };
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  pendingTheme = theme;
  // While a transition is still capturing/painting, skip it and apply immediately
  // so rapid clicks always settle on the last requested theme.
  if (activeTransition || !root.startViewTransition || reduced || !from) {
    activeTransition?.skipTransition?.();
    applyDom(theme);
    return;
  }
  const transition = root.startViewTransition(() => {
    if (pendingTheme) applyDom(pendingTheme);
  });
  activeTransition = transition;
  transition.finished.finally(() => {
    if (activeTransition === transition) activeTransition = null;
  });
  transition.ready
    .then(() => {
      const end = Math.hypot(
        Math.max(from.x, window.innerWidth - from.x),
        Math.max(from.y, window.innerHeight - from.y),
      );
      root.animate(
        {
          clipPath: [
            `circle(0px at ${from.x}px ${from.y}px)`,
            `circle(${end}px at ${from.x}px ${from.y}px)`,
          ],
        },
        { duration: 520, easing: "ease-in-out", pseudoElement: "::view-transition-new(root)" },
      );
    })
    .catch(() => {
      /* transition cancelled — the theme was still applied */
    });
}

export function useTheme() {
  const [mode, setModeState] = useState<ThemeMode>(readStored);
  const [resolved, setResolved] = useState<ResolvedTheme>(() =>
    mode === "auto" ? systemTheme() : mode,
  );

  const setMode = useCallback((next: ThemeMode, from?: { x: number; y: number }) => {
    setModeState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* private mode */
    }
    const theme = next === "auto" ? systemTheme() : next;
    setResolved(theme);
    paint(theme, from);
  }, []);

  // Keep the DOM in sync on mount.
  useEffect(() => {
    applyDom(resolved);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // In "auto" mode, follow live changes of the system preference.
  useEffect(() => {
    if (mode !== "auto") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      const theme: ResolvedTheme = mq.matches ? "dark" : "light";
      setResolved(theme);
      applyDom(theme);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [mode]);

  return { mode, resolved, setMode };
}
