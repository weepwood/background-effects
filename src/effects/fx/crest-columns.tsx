/**
 * Crest Columns — Vertical gradient bars, each with a glowing crest line rolling on a V-shaped wave across the columns.
 *
 * Self-contained animated background: needs only React.
 * Extracted from getdesign.md/backgrounds.
 */
// @ts-nocheck — the public props are typed, the internals are vendored as-is.
import * as React from "react";
import { FX_BACKGROUND, FX_COLOR, resolveColor, CanvasLayer } from "../engine";

export interface CrestColumnsProps {
  /** Effect color. Accepts a hex or a var(--token) reference. */
  color?: string;
  /** Canvas fill behind the effect. */
  background?: string;
  /** Animation speed multiplier. */
  speed?: number;
  /** Number of columns across the width. */
  count?: number;
}

function be(e) {
  const o = Math.sin(e * 127.1) * 43758.5453;
  return o - Math.floor(o);
}

function ye(e) {
  let o = e.replace("#", "").trim();
  o.length === 3 &&
    (o = o
      .split("")
      .map((s) => s + s)
      .join(""));
  const t = parseInt(o, 16);
  return Number.isNaN(t)
    ? [255, 255, 255]
    : [(t >> 16) & 255, (t >> 8) & 255, t & 255];
}

export function CrestColumns({ color: e = FX_COLOR, background: o = FX_BACKGROUND, speed: t = 1, count: s = 16 }: CrestColumnsProps) {
  const R = React.useMemo(() => {
    let F = "",
      b = null;
    return (a, n, i, C) => {
      b || ((F = resolveColor(a.canvas, o)), (b = ye(resolveColor(a.canvas, e))));
      const d = C * t;
      ((a.fillStyle = F), a.fillRect(0, 0, n, i));
      const [T, x, w] = b,
        l = (h) => `rgba(${T},${x},${w},${h.toFixed(3)})`,
        f = n / s;
      for (let h = 0; h < s; h++) {
        const p = s === 1 ? 0.5 : h / (s - 1),
          B =
            0.32 +
            0.42 * (1 - Math.abs(p - 0.5) * 2) +
            0.1 * Math.sin(d * 0.9 + h * 0.55) +
            0.03 * Math.sin(d * 0.37 + h * 1.7),
          c = Math.min(0.94, Math.max(0.06, B)),
          g = 0.35 + 0.65 * be(h * 3.13 + 1.7),
          r = a.createLinearGradient(0, 0, 0, i);
        (r.addColorStop(0, l(0)),
          r.addColorStop(Math.max(0, c - 0.45), l(0.1 * g)),
          r.addColorStop(c, l(g)),
          r.addColorStop(Math.min(1, c + 0.06), l(0.22 * g)),
          r.addColorStop(1, l(0.04 * g)),
          (a.fillStyle = r),
          a.fillRect(h * f, 0, f + 1, i));
      }
    };
  }, [e, o, t, s]);
  return <CanvasLayer draw={R} />;
}
