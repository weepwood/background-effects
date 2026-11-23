/**
 * Star Surge — A starfield rushing out from center: twinkling points in the core, motion-blur streaks at the rim.
 *
 * Self-contained animated background: needs only React.
 * Extracted from getdesign.md/backgrounds.
 */
// @ts-nocheck — the public props are typed, the internals are vendored as-is.
import * as React from "react";
import { FX_BACKGROUND, FX_COLOR, resolveColor, CanvasLayer } from "../engine";

export interface StarSurgeProps {
  /** Effect color. Accepts a hex or a var(--token) reference. */
  color?: string;
  /** Canvas fill behind the effect. */
  background?: string;
  /** Animation speed multiplier. */
  speed?: number;
  /** Number of stars in the field. */
  count?: number;
}

const fe = Math.PI * 2;

function ee(e) {
  const o = Math.sin(e * 127.1) * 43758.5453;
  return o - Math.floor(o);
}

export function StarSurge({ color: e = FX_COLOR, background: o = FX_BACKGROUND, speed: t = 1, count: s = 260 }: StarSurgeProps) {
  const R = React.useMemo(() => {
    let F = "",
      b = "";
    return (a, n, i, C) => {
      (F || ((F = resolveColor(a.canvas, e)), (b = resolveColor(a.canvas, o))),
        (a.fillStyle = b),
        a.fillRect(0, 0, n, i),
        (a.strokeStyle = F),
        (a.lineCap = "round"));
      const d = n / 2,
        T = i / 2,
        x = Math.hypot(n, i) * 0.56,
        w = C * t;
      for (let l = 0; l < s; l++) {
        const f = ee(l * 1.37 + 0.11) * fe,
          h = 0.045 + 0.11 * ee(l * 2.71 + 5.3),
          p = ee(l * 3.93 + 9.7),
          u = (p + w * h) % 1,
          B = u * u,
          c = B * x,
          g = Math.cos(f),
          r = Math.sin(f),
          M = 1 + B * B * x * 0.12,
          y = d + g * c,
          m = T + r * c,
          v = 0.55 + 0.45 * Math.sin(w * (2 + 4 * ee(l * 4.7 + 2.9)) + p * fe);
        ((a.globalAlpha = (0.1 + 0.9 * B) * v),
          (a.lineWidth = 0.6 + 1.1 * B),
          a.beginPath(),
          a.moveTo(y - g * M, m - r * M),
          a.lineTo(y, m),
          a.stroke());
      }
      a.globalAlpha = 1;
    };
  }, [e, o, t, s]);
  return <CanvasLayer draw={R} />;
}
