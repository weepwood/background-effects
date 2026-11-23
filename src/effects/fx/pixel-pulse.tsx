/**
 * Pixel Pulse — An LED wall of rounded square cells pulsing as clean concentric rings radiating from the center.
 *
 * Self-contained animated background: needs only React.
 * Extracted from getdesign.md/backgrounds.
 */
// @ts-nocheck — the public props are typed, the internals are vendored as-is.
import * as React from "react";
import { FX_BACKGROUND, FX_COLOR, resolveColor, CanvasLayer } from "../engine";

export interface PixelPulseProps {
  /** Effect color. Accepts a hex or a var(--token) reference. */
  color?: string;
  /** Canvas fill behind the effect. */
  background?: string;
  /** Animation speed multiplier. */
  speed?: number;
  /** Grid density: LED columns across the width. */
  density?: number;
}

function Ae(e) {
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

export function PixelPulse({
  color: e = FX_COLOR,
  background: o = FX_BACKGROUND,
  speed: t = 1,
  density: s = 42,
}: PixelPulseProps) {
  const R = React.useMemo(() => {
    let F = "",
      b = null;
    return (a, n, i, C) => {
      b || ((F = resolveColor(a.canvas, o)), (b = Ae(resolveColor(a.canvas, e))));
      const d = C * t,
        [T, x, w] = b;
      ((a.globalCompositeOperation = "source-over"),
        (a.fillStyle = F),
        a.fillRect(0, 0, n, i),
        (a.globalCompositeOperation = "lighter"));
      const l = Math.min(44, Math.max(10, n / s)),
        f = n / 2,
        h = i / 2;
      for (let p = l / 2; p < i + l; p += l)
        for (let u = l / 2; u < n + l; u += l) {
          const B = Math.hypot(u - f, p - h);
          let c = 0.5 + 0.5 * Math.sin(B * 0.02 - d * 2);
          if (
            ((c = Math.min(1, Math.max(0, (c - 0.25) / 0.65))),
            (c = c * c * (3 - 2 * c)),
            c < 0.04)
          )
            continue;
          const g = Math.max(0, (c - 0.82) / 0.18) * 0.4,
            r = Math.round(T + (255 - T) * g),
            M = Math.round(x + (255 - x) * g),
            y = Math.round(w + (255 - w) * g),
            m = l * 0.78,
            v = l * 0.94,
            O = l * 0.16;
          ((a.fillStyle = `rgba(${r},${M},${y},${(0.2 * c).toFixed(3)})`),
            a.beginPath(),
            a.roundRect(u - v / 2, p - v / 2, v, v, O * 1.4),
            a.fill(),
            (a.fillStyle = `rgba(${r},${M},${y},${(0.85 * c).toFixed(3)})`),
            a.beginPath(),
            a.roundRect(u - m / 2, p - m / 2, m, m, O),
            a.fill());
        }
      ((a.globalCompositeOperation = "source-over"), (a.globalAlpha = 1));
    };
  }, [e, o, t, s]);
  return <CanvasLayer draw={R} />;
}
