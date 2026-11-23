/**
 * Orbit Trails — Thin arcs of light circling a shared center, like star trails in a long exposure: inner orbits whip, outer ones glide.
 *
 * Self-contained animated background: needs only React.
 * Extracted from getdesign.md/backgrounds.
 */
// @ts-nocheck — the public props are typed, the internals are vendored as-is.
import * as React from "react";
import { FX_BACKGROUND, resolveColor, CanvasLayer } from "../engine";

export interface OrbitTrailsProps {
  /** Three-stop palette. Each entry accepts a hex or a var(--token) reference. */
  colors?: string[];
  /** Canvas fill behind the effect. */
  background?: string;
  /** Animation speed multiplier. */
  speed?: number;
  /** Number of orbit trails. */
  count?: number;
}

const ce = Math.PI * 2;

function K(e) {
  const o = Math.sin(e * 127.1) * 43758.5453;
  return o - Math.floor(o);
}

function Te(e) {
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

export function OrbitTrails({
  colors: e = ["#8f7bff", "#5b6cff", "#c96af2"],
  background: o = FX_BACKGROUND,
  speed: t = 1,
  count: s = 80,
}: OrbitTrailsProps) {
  const R = e.join("|"),
    F = React.useMemo(() => {
      let b = "",
        a = [];
      return (n, i, C, d) => {
        b || ((b = resolveColor(n.canvas, o)), (a = e.map((f) => Te(resolveColor(n.canvas, f)))));
        const T = d * t;
        ((n.fillStyle = b), n.fillRect(0, 0, i, C), (n.lineCap = "round"));
        const x = i / 2,
          w = C / 2,
          l = Math.hypot(i, C) * 0.55;
        for (let f = 0; f < s; f++) {
          const h = (0.05 + 0.95 * Math.pow(K(f * 1.37 + 0.31), 0.85)) * l,
            p = 0.4 + 1.7 * K(f * 2.71 + 5.3),
            u = (0.02 + 26 / (60 + h)) * (0.6 + 0.8 * K(f * 3.9 + 7.7)),
            B = K(f * 5.9 + 1.9) * ce + T * u,
            [c, g, r] = a[Math.floor(K(f * 7.3 + 3.3) * a.length) % a.length],
            M = 0.45 + 0.55 * K(f * 9.1 + 4.9),
            y = p / ce,
            m = n.createConicGradient(B, x, w);
          (m.addColorStop(0, `rgba(${c},${g},${r},0)`),
            m.addColorStop(y, `rgba(${c},${g},${r},${M.toFixed(3)})`),
            m.addColorStop(Math.min(y + 0.002, 1), "rgba(0,0,0,0)"),
            m.addColorStop(1, "rgba(0,0,0,0)"),
            (n.strokeStyle = m),
            (n.lineWidth = 1.1 + 1.1 * K(f * 11.3 + 8.9)),
            n.beginPath(),
            n.arc(x, w, h, B, B + p),
            n.stroke());
        }
      };
    }, [R, o, t, s]);
  return <CanvasLayer draw={F} />;
}
