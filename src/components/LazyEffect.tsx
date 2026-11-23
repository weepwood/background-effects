import { useEffect, useRef, useState } from "react";
import type { BackgroundEffect, EffectValues } from "@/effects/registry";

/**
 * Browsers only allow ~16 live WebGL contexts per page, so a grid of 36 effects
 * mounts each (unmodified) effect component only while it is near the viewport
 * and explicitly releases its GL context when it scrolls away.
 */
function releaseGl(root: HTMLElement | null) {
  if (!root) return;
  root.querySelectorAll("canvas").forEach((canvas) => {
    try {
      const gl = canvas.getContext("webgl") as WebGLRenderingContext | null;
      gl?.getExtension("WEBGL_lose_context")?.loseContext();
    } catch {
      /* canvas is 2d or already released */
    }
  });
}

interface LazyEffectProps {
  effect: BackgroundEffect;
  values?: EffectValues;
  rootMargin?: string;
}

export function LazyEffect({ effect, values, rootMargin = "160px" }: LazyEffectProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [live, setLive] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setLive(true);
        } else {
          releaseGl(el);
          setLive(false);
        }
      },
      { rootMargin },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      releaseGl(el);
    };
  }, [rootMargin]);

  return (
    <div ref={ref} className="absolute inset-0" style={{ background: "var(--color-fx-canvas)" }}>
      {live && (
        <div className="absolute inset-0 fx-fade-in">{effect.render(values ?? effect.defaults)}</div>
      )}
    </div>
  );
}
