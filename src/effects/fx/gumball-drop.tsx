/**
 * Gumball Drop — Glossy balls tumbling into a pit under real 2D physics, and the cursor shoulders through the pile.
 *
 * Self-contained animated background: needs only React.
 * Extracted from getdesign.md/backgrounds.
 */
// @ts-nocheck — the public props are typed, the internals are vendored as-is.
import * as React from "react";
import { FX_BACKGROUND, resolveColor, CanvasLayer } from "../engine";

export interface GumballDropProps {
  /** Three-stop palette. Each entry accepts a hex or a var(--token) reference. */
  colors?: string[];
  /** Canvas fill behind the effect. */
  background?: string;
  /** Animation speed multiplier. */
  speed?: number;
  /** Number of balls in the pit. */
  count?: number;
}

function Y(e) {
  const o = Math.sin(e * 127.1) * 43758.5453;
  return o - Math.floor(o);
}

function qe(e) {
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

export function GumballDrop({
  colors: e = ["#4c3ff2", "#f0f0f4", "#5c5a66"],
  background: o = FX_BACKGROUND,
  speed: t = 1,
  count: s = 26,
}: GumballDropProps) {
  const R = React.useRef(null);
  React.useEffect(() => {
    const a = (n) => {
      R.current = { x: n.clientX, y: n.clientY };
    };
    return (
      window.addEventListener("pointermove", a, { passive: !0 }),
      () => window.removeEventListener("pointermove", a)
    );
  }, []);
  const F = e.join("|"),
    b = React.useMemo(() => {
      let a = "",
        n = [],
        i = [],
        C = 0,
        d = 0,
        T = 0;
      const x = (l) => {
          const f = n[0],
            h = n[1] ?? f,
            p = n[2] ?? h,
            [u, B, c] = l < 0.5 ? [f, h, l * 2] : [h, p, l * 2 - 1];
          return [
            Math.round(u[0] + (B[0] - u[0]) * c),
            Math.round(u[1] + (B[1] - u[1]) * c),
            Math.round(u[2] + (B[2] - u[2]) * c),
          ];
        },
        w = (l, f) => {
          ((C = l), (d = f), (i = []));
          const h = Math.min(l, f);
          for (let p = 0; p < s; p++) {
            const u = h * (0.035 + 0.055 * Math.pow(Y(p * 1.37 + 0.31), 1.4));
            i.push({
              x: u + Y(p * 2.71 + 5.3) * (l - 2 * u),
              y: u + Y(p * 3.93 + 9.7) * (f - 2 * u),
              vx: (Y(p * 5.9 + 1.9) - 0.5) * h * 0.4,
              vy: (Y(p * 7.9 + 8.3) - 0.5) * h * 0.2,
              r: u,
              c: x(Y(p * 9.1 + 4.9)),
            });
          }
        };
      return (l, f, h, p) => {
        (a || ((a = resolveColor(l.canvas, o)), (n = e.map((r) => qe(resolveColor(l.canvas, r))))),
          (f !== C || h !== d) && w(f, h));
        const u = Math.min(Math.max(p - T, 0), 0.05) * t;
        T = p;
        const B = h * 2.2,
          c = 0.78;
        for (const r of i)
          ((r.vy += B * u),
            (r.vx *= 0.999),
            (r.vy *= 0.999),
            (r.x += r.vx * u),
            (r.y += r.vy * u),
            r.x - r.r < 0
              ? ((r.x = r.r), (r.vx = -r.vx * c))
              : r.x + r.r > f && ((r.x = f - r.r), (r.vx = -r.vx * c)),
            r.y + r.r > h &&
              ((r.y = h - r.r), (r.vy = -r.vy * c), (r.vx *= 0.96)));
        for (let r = 0; r < 2; r++)
          for (let M = 0; M < i.length; M++)
            for (let y = M + 1; y < i.length; y++) {
              const m = i[M],
                v = i[y],
                O = v.x - m.x,
                I = v.y - m.y,
                P = Math.hypot(O, I) || 1e-4,
                q = m.r + v.r - P;
              if (q > 0) {
                const G = O / P,
                  $ = I / P,
                  L = q / 2;
                ((m.x -= G * L),
                  (m.y -= $ * L),
                  (v.x += G * L),
                  (v.y += $ * L));
                const H = m.vx * G + m.vy * $,
                  U = v.vx * G + v.vy * $,
                  k = (H - U) * 0.82;
                k > 0 &&
                  ((m.vx -= k * G),
                  (m.vy -= k * $),
                  (v.vx += k * G),
                  (v.vy += k * $));
              }
            }
        const g = R.current;
        if (g) {
          const r = l.canvas.getBoundingClientRect(),
            M = g.x - r.left,
            y = g.y - r.top;
          if (M > -50 && M < f + 50 && y > -50 && y < h + 50) {
            const m = Math.min(f, h) * 0.09;
            for (const v of i) {
              const O = v.x - M,
                I = v.y - y,
                P = Math.hypot(O, I) || 1e-4,
                q = m + v.r - P;
              if (q > 0) {
                const G = O / P,
                  $ = I / P;
                ((v.x += G * q),
                  (v.y += $ * q),
                  (v.vx += G * q * 14),
                  (v.vy += $ * q * 14));
              }
            }
          }
        }
        ((l.fillStyle = a), l.fillRect(0, 0, f, h));
        for (const r of i) {
          const [M, y, m] = r.c,
            v = l.createRadialGradient(
              r.x - r.r * 0.35,
              r.y - r.r * 0.4,
              r.r * 0.1,
              r.x,
              r.y,
              r.r,
            );
          (v.addColorStop(
            0,
            `rgb(${Math.min(255, M + 90)},${Math.min(255, y + 90)},${Math.min(255, m + 90)})`,
          ),
            v.addColorStop(0.55, `rgb(${M},${y},${m})`),
            v.addColorStop(
              1,
              `rgb(${Math.round(M * 0.4)},${Math.round(y * 0.4)},${Math.round(m * 0.4)})`,
            ),
            (l.fillStyle = v),
            l.beginPath(),
            l.arc(r.x, r.y, r.r, 0, 6.283),
            l.fill(),
            (l.fillStyle = "rgba(255,255,255,0.55)"),
            l.beginPath(),
            l.arc(r.x - r.r * 0.42, r.y - r.r * 0.46, r.r * 0.16, 0, 6.283),
            l.fill());
        }
      };
    }, [F, o, t, s]);
  return <CanvasLayer draw={b} />;
}
