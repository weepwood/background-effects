/**
 * Photon Rush — A hyperspace jump: bold light streaks racing radially out of a dark core, tinted from the palette.
 *
 * Self-contained animated background: needs only React.
 * Extracted from getdesign.md/backgrounds.
 */
// @ts-nocheck — the public props are typed, the internals are vendored as-is.
import * as React from "react";
import { FX_BACKGROUND, resolveColor, CanvasLayer } from "../engine";

export interface PhotonRushProps {
  /** Three-stop palette. Each entry accepts a hex or a var(--token) reference. */
  colors?: string[];
  /** Canvas fill behind the effect. */
  background?: string;
  /** Animation speed multiplier. */
  speed?: number;
  /** Number of streaks in the jump. */
  count?: number;
}

const Ce = Math.PI * 2;

function Z(e) {
  const o = Math.sin(e * 127.1) * 43758.5453;
  return o - Math.floor(o);
}

function xe(e) {
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

export function PhotonRush({
  colors: e = ["#8f7bff", "#f2f4f8", "#b48cf2"],
  background: o = FX_BACKGROUND,
  speed: t = 1,
  count: s = 90,
}: PhotonRushProps) {
  const R = e.join("|"),
    F = React.useMemo(() => {
      let b = "",
        a = [];
      return (n, i, C, d) => {
        b || ((b = resolveColor(n.canvas, o)), (a = e.map((f) => xe(resolveColor(n.canvas, f)))));
        const T = d * t;
        ((n.globalCompositeOperation = "source-over"),
          (n.fillStyle = b),
          n.fillRect(0, 0, i, C),
          (n.globalCompositeOperation = "lighter"),
          (n.lineCap = "round"));
        const x = i / 2,
          w = C / 2,
          l = Math.hypot(i, C) * 0.58;
        for (let f = 0; f < s; f++) {
          const h = Z(f * 1.37 + 0.11) * Ce,
            p = 0.16 + 0.22 * Z(f * 2.71 + 5.3),
            u = Z(f * 3.93 + 9.7),
            B = a[Math.floor(Z(f * 5.21 + 3.3) * a.length) % a.length],
            c = (u + T * p) % 1,
            g = Math.pow(c, 1.7),
            r = g * l,
            M = Math.min(1, Math.max(0, (g - 0.05) / 0.1));
          if (M <= 0) continue;
          const y = Math.cos(h),
            m = Math.sin(h),
            v = 6 + g * g * l * 0.5,
            O = x + y * r,
            I = w + m * r,
            P = x + y * Math.max(0, r - v),
            q = w + m * Math.max(0, r - v),
            G = (0.65 + 0.35 * Z(f * 9.1 + 4.9)) * M,
            [$, L, H] = B,
            U = n.createLinearGradient(P, q, O, I);
          (U.addColorStop(0, `rgba(${$},${L},${H},0)`),
            U.addColorStop(0.7, `rgba(${$},${L},${H},0.55)`),
            U.addColorStop(1, `rgba(${$},${L},${H},1)`),
            n.beginPath(),
            n.moveTo(P, q),
            n.lineTo(O, I),
            (n.strokeStyle = U),
            (n.lineWidth = (0.8 + 2.2 * g) * 3),
            (n.globalAlpha = 0.12 * G),
            n.stroke(),
            (n.lineWidth = 0.8 + 2.2 * g),
            (n.globalAlpha = 0.85 * G),
            n.stroke());
          const k = O - y * Math.min(v, 10 + 26 * g),
            X = I - m * Math.min(v, 10 + 26 * g);
          (n.beginPath(),
            n.moveTo(k, X),
            n.lineTo(O, I),
            (n.strokeStyle = `rgb(${Math.round($ + (255 - $) * 0.7)},${Math.round(L + (255 - L) * 0.7)},${Math.round(H + (255 - H) * 0.7)})`),
            (n.lineWidth = 1 + 1.6 * g),
            (n.globalAlpha = 0.9 * G),
            n.stroke());
        }
        ((n.globalCompositeOperation = "source-over"), (n.globalAlpha = 1));
      };
    }, [R, o, t, s]);
  return <CanvasLayer draw={F} />;
}
