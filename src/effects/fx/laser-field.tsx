/**
 * Laser Field — A glowing laser baseline with thin beams breathing out of it and sparks drifting up through the dark.
 *
 * Self-contained animated background: needs only React.
 * Extracted from getdesign.md/backgrounds.
 */
// @ts-nocheck — the public props are typed, the internals are vendored as-is.
import * as React from "react";
import { FX_BACKGROUND, FX_COLOR, resolveColor, CanvasLayer } from "../engine";

export interface LaserFieldProps {
  /** Effect color. Accepts a hex or a var(--token) reference. */
  color?: string;
  /** Canvas fill behind the effect. */
  background?: string;
  /** Animation speed multiplier. */
  speed?: number;
  /** Number of beams; sparks scale along. */
  count?: number;
}

const ue = Math.PI * 2;

function D(e) {
  const o = Math.sin(e * 127.1) * 43758.5453;
  return o - Math.floor(o);
}

function Se(e) {
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

export function LaserField({ color: e = FX_COLOR, background: o = FX_BACKGROUND, speed: t = 1, count: s = 70 }: LaserFieldProps) {
  const R = React.useMemo(() => {
    let F = "",
      b = null;
    return (a, n, i, C) => {
      b || ((F = resolveColor(a.canvas, o)), (b = Se(resolveColor(a.canvas, e))));
      const d = C * t,
        [T, x, w] = b,
        l = (c) => `rgba(${T},${x},${w},${c.toFixed(3)})`;
      ((a.globalCompositeOperation = "source-over"),
        (a.fillStyle = F),
        a.fillRect(0, 0, n, i),
        (a.globalCompositeOperation = "lighter"),
        (a.globalAlpha = 1));
      const f = 44;
      (a.save(), a.translate(n / 2, i), a.scale(1, f / (n * 0.5)));
      const h = a.createRadialGradient(0, 0, 0, 0, 0, n * 0.5);
      (h.addColorStop(0, l(0.55)),
        h.addColorStop(0.55, l(0.2)),
        h.addColorStop(1, l(0)),
        (a.fillStyle = h),
        a.fillRect(-n / 2, -n * 0.5, n, n * 0.5),
        a.restore());
      const p = `rgba(${Math.round(T + (255 - T) * 0.55)},${Math.round(x + (255 - x) * 0.55)},${Math.round(w + (255 - w) * 0.55)},0.85)`,
        u = a.createLinearGradient(0, 0, n, 0);
      (u.addColorStop(0, l(0)),
        u.addColorStop(0.16, l(0.18)),
        u.addColorStop(0.5, p),
        u.addColorStop(0.84, l(0.18)),
        u.addColorStop(1, l(0)),
        (a.fillStyle = u),
        a.fillRect(0, i - 2.5, n, 2.5));
      for (let c = 0; c < s; c++) {
        const g = D(c * 1.37 + 0.31) * n,
          r = 0.06 + 0.16 * D(c * 2.71 + 5.3),
          M = (D(c * 3.93 + 9.7) + d * r) % 1,
          y = Math.sin(Math.PI * M),
          m = Math.pow(D(c * 5.9 + 1.9), 2.5),
          v = i * (0.08 + 0.58 * m) * y;
        if (v < 3) continue;
        const O = 1 - Math.min(1, Math.abs(g - n / 2) / (n * 0.55)),
          I =
            (0.4 + 0.6 * D(c * 9.1 + 4.9)) *
            y *
            (0.45 + 0.55 * Math.pow(O, 1.2)),
          P = a.createLinearGradient(0, i, 0, i - v);
        (P.addColorStop(0, l(0.85 * I)),
          P.addColorStop(1, l(0)),
          (a.strokeStyle = P),
          a.beginPath(),
          a.moveTo(g, i),
          a.lineTo(g, i - v),
          (a.lineWidth = 3.5),
          (a.globalAlpha = 0.16),
          a.stroke(),
          (a.lineWidth = 1.1),
          (a.globalAlpha = 1),
          a.stroke());
      }
      const B = Math.round(s * 0.55);
      for (let c = 0; c < B; c++) {
        const g = 0.03 + 0.06 * D(c * 6.7 + 3.7),
          r = (D(c * 7.9 + 8.3) + d * g) % 1,
          M = D(c * 11.3 + 2.9) * n + Math.sin(d * 0.6 + c * 1.7) * 6,
          y = i * (0.98 - r * 0.85),
          m = Math.sin(Math.PI * r) * (0.35 + 0.65 * D(c * 12.7 + 6.1)),
          v = 1 + 2.2 * D(c * 13.9 + 0.7);
        ((a.fillStyle = l(0.12 * m)),
          a.beginPath(),
          a.arc(M, y, v * 3, 0, ue),
          a.fill(),
          (a.fillStyle = l(0.9 * m)),
          a.beginPath(),
          a.arc(M, y, v, 0, ue),
          a.fill());
      }
      ((a.globalCompositeOperation = "source-over"), (a.globalAlpha = 1));
    };
  }, [e, o, t, s]);
  return <CanvasLayer draw={R} />;
}
