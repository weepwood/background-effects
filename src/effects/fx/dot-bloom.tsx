/**
 * Dot Bloom — A halftone dot matrix under drifting weather: cloud patches of light form, morph, and slide across the grid.
 *
 * Self-contained animated background: needs only React.
 * Extracted from getdesign.md/backgrounds.
 */
// @ts-nocheck — the public props are typed, the internals are vendored as-is.
import * as React from "react";
import { FX_BACKGROUND, FX_COLOR, resolveColor, hash2, CanvasLayer } from "../engine";

export interface DotBloomProps {
  /** Effect color. Accepts a hex or a var(--token) reference. */
  color?: string;
  /** Canvas fill behind the effect. */
  background?: string;
  /** Animation speed multiplier. */
  speed?: number;
  /** Grid density: dot columns across the width. */
  density?: number;
}

function ae(e, o) {
  const t = Math.floor(e),
    s = Math.floor(o),
    R = e - t,
    F = o - s,
    b = R * R * (3 - 2 * R),
    a = F * F * (3 - 2 * F),
    n = hash2(t, s),
    i = hash2(t + 1, s),
    C = hash2(t, s + 1),
    d = hash2(t + 1, s + 1);
  return n + (i - n) * b + (C - n) * a + (n - i - C + d) * b * a;
}

export function DotBloom({
  color: e = FX_COLOR,
  background: o = FX_BACKGROUND,
  speed: t = 1,
  density: s = 40,
}: DotBloomProps) {
  const R = React.useMemo(() => {
    let F = "",
      b = "";
    return (a, n, i, C) => {
      F || ((F = resolveColor(a.canvas, e)), (b = resolveColor(a.canvas, o)));
      const d = C * t;
      ((a.fillStyle = b), a.fillRect(0, 0, n, i), (a.fillStyle = F));
      const T = Math.min(40, Math.max(8, n / s)),
        x = 3;
      for (let w = T / 2; w < i + T; w += T)
        for (let l = T / 2; l < n + T; l += T) {
          const f = (l / i) * x,
            h = (w / i) * x;
          let p =
            0.55 * ae(f + d * 0.55, h + d * 0.12) +
            0.3 * ae(f * 2.1 + 40 - d * 0.3, h * 2.1 + d * 0.2) +
            0.15 * ae(f * 4.2 + 90 + d * 0.5, h * 4.2 - d * 0.35);
          ((p = Math.min(1, Math.max(0, (p - 0.45) / 0.35))),
            (p = p * p * (3 - 2 * p)));
          const u = T * 0.34 * Math.pow(p, 1.3);
          u < 0.3 ||
            ((a.globalAlpha = 0.08 * p),
            a.beginPath(),
            a.arc(l, w, u * 2.2, 0, 6.283),
            a.fill(),
            (a.globalAlpha = 0.12 + 0.5 * p),
            a.beginPath(),
            a.arc(l, w, u, 0, 6.283),
            a.fill());
        }
      a.globalAlpha = 1;
    };
  }, [e, o, t, s]);
  return <CanvasLayer draw={R} />;
}
