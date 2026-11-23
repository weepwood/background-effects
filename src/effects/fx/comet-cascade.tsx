/**
 * Comet Cascade — Comet trails pouring down the center, banking outward near the floor like a fountain hitting glass.
 *
 * Self-contained animated background: needs only React.
 * Extracted from getdesign.md/backgrounds.
 */
// @ts-nocheck — the public props are typed, the internals are vendored as-is.
import * as React from "react";
import { FX_BACKGROUND, resolveColor, CanvasLayer } from "../engine";

export interface CometCascadeProps {
  /** Three-stop palette. Each entry accepts a hex or a var(--token) reference. */
  colors?: string[];
  /** Canvas fill behind the effect. */
  background?: string;
  /** Animation speed multiplier. */
  speed?: number;
  /** Number of comet trails in the cascade. */
  count?: number;
}

function te(e) {
  const o = Math.sin(e * 127.1) * 43758.5453;
  return o - Math.floor(o);
}

function de(e) {
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

export function CometCascade({
  colors: e = ["#5b4bd8", "#9b3fd4", "#e04fae"],
  background: o = FX_BACKGROUND,
  speed: t = 1,
  count: s = 36,
}: CometCascadeProps) {
  const R = e.join("|"),
    F = React.useMemo(() => {
      let b = "",
        a = [];
      const n = (i) => {
        const C = a[0],
          d = a[1] ?? C,
          T = a[2] ?? d,
          [x, w, l] = i < 0.5 ? [C, d, i * 2] : [d, T, i * 2 - 1];
        return [
          x[0] + (w[0] - x[0]) * l,
          x[1] + (w[1] - x[1]) * l,
          x[2] + (w[2] - x[2]) * l,
        ];
      };
      return (i, C, d, T) => {
        b || ((b = resolveColor(i.canvas, o)), (a = e.map((u) => de(resolveColor(i.canvas, u)))));
        const x = T * t;
        ((i.globalCompositeOperation = "source-over"),
          (i.fillStyle = b),
          i.fillRect(0, 0, C, d),
          (i.globalCompositeOperation = "lighter"),
          (i.lineCap = "round"),
          (i.lineJoin = "round"));
        const w = C / 2,
          l = 9,
          f = Math.max(1, Math.round(s / l)),
          h = d * 0.02,
          p = d * 0.68 - h;
        for (let u = 0; u < l * f; u++) {
          const B = u % l,
            c = (u / l) | 0,
            g = B / (l - 1) - 0.5,
            r = Math.abs(g) * 2,
            M = te(u * 2.71 + 5.3),
            y = w + g * C * 0.3 + (M - 0.5) * C * 0.012,
            m = d * (0.68 - 0.25 * Math.pow(r, 1.3)),
            v = Math.max(0, d * 0.88 - m),
            O = g * 2 * C * 0.72,
            I = c / f + (te(u * 7.9 + 8.3) - 0.5) * 0.03,
            P = 0.7 + 0.3 * te(u * 9.1 + 4.9),
            q = 0.62 * ((m - h) / p),
            G = ((I + x * 0.1) % 1) * 1.2,
            $ = Math.max(0, Math.min(1, Math.min(G / 0.06, (1.18 - G) / 0.16)));
          if ($ <= 0) continue;
          const L = (E) => {
              if (E <= q) {
                const oe = E / q;
                return [y, h + (m - h) * Math.pow(oe, 1.35)];
              }
              const z = Math.min((E - q) / (1 - q), 1);
              return [
                y + O * Math.pow(z, 2.1),
                m + v * (1 - Math.pow(1 - z, 2)),
              ];
            },
            H = 0.28 + 0.04 * M,
            U = 20,
            k = [];
          for (let E = 0; E <= U; E++) {
            const z = G - H * (1 - E / U);
            z < 0 || k.push(L(z));
          }
          if (k.length < 2) continue;
          const X = k[0],
            J = k[k.length - 1],
            se = i.createLinearGradient(X[0], X[1], J[0], J[1]);
          for (const E of [0, 0.5, 1]) {
            const z = k[Math.round(E * (k.length - 1))],
              [oe, he, pe] = n(Math.min(1, z[1] / d));
            se.addColorStop(
              E,
              `rgba(${Math.round(oe)},${Math.round(he)},${Math.round(pe)},${(E * E).toFixed(3)})`,
            );
          }
          (i.beginPath(), i.moveTo(X[0], X[1]));
          for (let E = 1; E < k.length; E++) i.lineTo(k[E][0], k[E][1]);
          ((i.strokeStyle = se),
            (i.lineWidth = 7),
            (i.globalAlpha = 0.14 * P * $),
            i.stroke(),
            (i.lineWidth = 1.9),
            (i.globalAlpha = 0.9 * P * $),
            i.stroke());
          const ne = k[k.length - 2],
            [ie, re, le] = n(Math.min(1, J[1] / d));
          (i.beginPath(),
            i.moveTo(ne[0], ne[1]),
            i.lineTo(J[0], J[1]),
            (i.strokeStyle = `rgb(${Math.round(ie + (255 - ie) * 0.6)},${Math.round(re + (255 - re) * 0.6)},${Math.round(le + (255 - le) * 0.6)})`),
            (i.lineWidth = 2.4),
            (i.globalAlpha = 0.9 * P * $),
            i.stroke());
        }
        ((i.globalCompositeOperation = "source-over"), (i.globalAlpha = 1));
      };
    }, [R, o, t, s]);
  return <CanvasLayer draw={F} />;
}
