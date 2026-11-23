/**
 * Ink Halftone — Print-style halftone dots, their radius modulated by a travelling wave.
 *
 * Self-contained animated background: needs only React.
 * Extracted from getdesign.md/backgrounds.
 */
// @ts-nocheck — the public props are typed, the internals are vendored as-is.
import * as React from "react";
import { FX_BACKGROUND, FX_COLOR, resolveColor, CanvasLayer } from "../engine";

export interface InkHalftoneProps {
  /** Effect color. Accepts a hex or a var(--token) reference. */
  color?: string;
  /** Canvas fill behind the effect. */
  background?: string;
  /** Animation speed multiplier. */
  speed?: number;
}

export function InkHalftone({ color: t = FX_COLOR, background: r = FX_BACKGROUND, speed: f = 1 }: InkHalftoneProps) {
  const m = React.useMemo(() => {
    let d = "",
      v = "";
    return (e, n, o, b) => {
      d || ((d = resolveColor(e.canvas, t)), (v = resolveColor(e.canvas, r)));
      const g = b * f;
      ((e.fillStyle = v), e.fillRect(0, 0, n, o), (e.fillStyle = d));
      const l = 13;
      for (let s = l / 2; s < o + l; s += l)
        for (let i = l / 2; i < n + l; i += l) {
          const u = 0.5 + 0.5 * Math.sin((i + s * 1.4) * 0.018 - g * 1.1),
            y =
              0.5 +
              0.5 *
                Math.sin(
                  i * 0.03 - g * 0.55 + Math.sin(s * 0.02 + g * 0.4) * 1.5,
                ),
            a = u * 0.55 + y * 0.45,
            c = 5.4 * Math.pow(a, 1.35);
          c < 0.4 ||
            ((e.globalAlpha = 0.3 + 0.7 * a),
            e.beginPath(),
            e.arc(i, s, c, 0, 6.283),
            e.fill());
        }
      e.globalAlpha = 1;
    };
  }, [t, r, f]);
  return <CanvasLayer draw={m} />;
}
