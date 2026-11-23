/**
 * Horizon Grid — An endless floor grid scrolling toward the viewer, glowing at the horizon.
 *
 * Self-contained animated background: needs only React.
 * Extracted from getdesign.md/backgrounds.
 */
// @ts-nocheck — the public props are typed, the internals are vendored as-is.
import * as React from "react";
import { FX_BACKGROUND, FX_COLOR, resolveColor, CanvasLayer } from "../engine";

export interface HorizonGridProps {
  /** Effect color. Accepts a hex or a var(--token) reference. */
  color?: string;
  /** Canvas fill behind the effect. */
  background?: string;
  /** Animation speed multiplier. */
  speed?: number;
}

export function HorizonGrid({ color: t = FX_COLOR, background: r = FX_BACKGROUND, speed: f = 1 }: HorizonGridProps) {
  const m = React.useMemo(() => {
    let d = "",
      v = "";
    return (e, n, o, b) => {
      d || ((d = resolveColor(e.canvas, t)), (v = resolveColor(e.canvas, r)));
      const g = b * f;
      ((e.fillStyle = v), e.fillRect(0, 0, n, o));
      const l = o * 0.42,
        s = n / 2;
      ((e.strokeStyle = d), (e.lineWidth = 1));
      const i = e.createLinearGradient(0, l - 42, 0, l);
      (i.addColorStop(0, "transparent"),
        i.addColorStop(1, d),
        e.save(),
        (e.globalAlpha = 0.22),
        (e.fillStyle = i),
        e.fillRect(0, l - 42, n, 42),
        e.restore(),
        (e.globalAlpha = 0.85),
        e.beginPath(),
        e.moveTo(0, l),
        e.lineTo(n, l),
        e.stroke());
      for (let a = -11; a <= 11; a++)
        ((e.globalAlpha = 0.12 + 0.3 * (1 - Math.abs(a) / 12)),
          e.beginPath(),
          e.moveTo(s, l),
          e.lineTo(s + a * n * 0.11, o + 10),
          e.stroke());
      const u = 13,
        y = (g * 0.55) % 1;
      for (let a = 1; a <= u; a++) {
        const c = (a - 1 + y) / u,
          C = l + (o - l) * Math.pow(c, 2.4);
        ((e.globalAlpha = 0.1 + 0.75 * c),
          e.beginPath(),
          e.moveTo(0, C),
          e.lineTo(n, C),
          e.stroke());
      }
      e.globalAlpha = 1;
    };
  }, [t, r, f]);
  return <CanvasLayer draw={m} />;
}
