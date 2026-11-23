/**
 * Dither Drift — Smooth wave bands quantized through a Bayer matrix into retro ordered dither.
 *
 * Self-contained animated background: needs only React.
 * Extracted from getdesign.md/backgrounds.
 */
// @ts-nocheck — the public props are typed, the internals are vendored as-is.
import * as React from "react";
import { FX_BACKGROUND, FX_COLOR, resolveColor, CanvasLayer } from "../engine";

export interface DitherDriftProps {
  /** Effect color. Accepts a hex or a var(--token) reference. */
  color?: string;
  /** Canvas fill behind the effect. */
  background?: string;
  /** Animation speed multiplier. */
  speed?: number;
}

const E = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

export function DitherDrift({ color: t = FX_COLOR, background: r = FX_BACKGROUND, speed: f = 1 }: DitherDriftProps) {
  const m = React.useMemo(() => {
    let d = "",
      v = "";
    return (e, n, o, b) => {
      d || ((d = resolveColor(e.canvas, t)), (v = resolveColor(e.canvas, r)));
      const g = b * f;
      ((e.fillStyle = v),
        e.fillRect(0, 0, n, o),
        (e.fillStyle = d),
        (e.globalAlpha = 0.55));
      const l = 7,
        s = Math.ceil(n / l),
        i = Math.ceil(o / l);
      for (let u = 0; u < i; u++) {
        const y = E[u % 4];
        for (let a = 0; a < s; a++) {
          const c = a * l,
            C = u * l,
            h =
              0.5 +
              0.5 *
                Math.sin(
                  C * 0.02 - g * 0.9 + Math.sin(c * 0.008 + g * 0.35) * 2.2,
                ),
            S = 0.5 + 0.5 * Math.sin((c - C) * 0.01 + g * 0.5);
          h * 0.7 + S * 0.3 > (y[a % 4] + 0.5) / 16 &&
            e.fillRect(c, C, l - 1, l - 1);
        }
      }
      e.globalAlpha = 1;
    };
  }, [t, r, f]);
  return <CanvasLayer draw={m} />;
}
