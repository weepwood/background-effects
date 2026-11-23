/**
 * Signal Grid — A fine grid of squares that quietly twinkle, dense at one edge and fading to empty.
 *
 * Self-contained animated background: needs only React.
 * Extracted from getdesign.md/backgrounds.
 */
// @ts-nocheck — the public props are typed, the internals are vendored as-is.
import * as React from "react";
import { FX_BACKGROUND, FX_COLOR, resolveColor, hash2, CanvasLayer } from "../engine";

export interface SignalGridProps {
  /** Effect color. Accepts a hex or a var(--token) reference. */
  color?: string;
  /** Canvas fill behind the effect. */
  background?: string;
  /** Animation speed multiplier. */
  speed?: number;
  /** Edge the dense squares anchor to; the grid fades toward the other side. */
  anchor?: "left" | "right";
}

export function SignalGrid({
  color: t = FX_COLOR,
  background: r = FX_BACKGROUND,
  speed: f = 1,
  anchor: m = "left",
}: SignalGridProps) {
  const d = React.useMemo(() => {
    let v = "",
      e = "";
    return (n, o, b, g) => {
      v || ((v = resolveColor(n.canvas, t)), (e = resolveColor(n.canvas, r)));
      const l = g * f;
      ((n.fillStyle = e), n.fillRect(0, 0, o, b), (n.fillStyle = v));
      const s = 18,
        i = 9,
        u = Math.ceil(o / s),
        y = Math.ceil(b / s);
      for (let a = 0; a < y; a++)
        for (let c = 0; c < u; c++) {
          const C = hash2(c, a),
            h = c * s + s / 2,
            S = m === "left" ? 1 - h / o : h / o;
          if (C > S * 0.92) continue;
          const M = 1.6 + hash2(a, c) * 3,
            p = 0.5 + 0.5 * Math.sin((l * 6.283) / M + C * 6.283),
            B = Math.pow(p, 3);
          ((n.globalAlpha = 0.08 + 0.92 * B * (0.35 + 0.65 * S)),
            n.fillRect(h - i / 2, a * s + (s - i) / 2, i, i));
        }
      n.globalAlpha = 1;
    };
  }, [t, r, f, m]);
  return <CanvasLayer draw={d} />;
}
