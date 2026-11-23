/**
 * Light Strands — Dozens of additive light strands weaving a silky gradient ribbon under film grain.
 *
 * Self-contained animated background: needs only React.
 * Extracted from getdesign.md/backgrounds.
 */
// @ts-nocheck — the public props are typed, the internals are vendored as-is.
import * as React from "react";
import { FX_BACKGROUND, resolveColor, hash2, CanvasLayer } from "../engine";

export interface LightStrandsProps {
  /** Three-stop palette. Each entry accepts a hex or a var(--token) reference. */
  colors?: string[];
  /** Canvas fill behind the effect. */
  background?: string;
  /** Animation speed multiplier. */
  speed?: number;
}

export function LightStrands({
  colors: t = ["#767676", "#f2f4f8", "#a6abb4"],
  background: r = FX_BACKGROUND,
  speed: f = 1,
}: LightStrandsProps) {
  const m = t.join("|"),
    d = React.useMemo(() => {
      let v = "",
        e = [],
        n = null;
      return (o, b, g, l) => {
        if (!v) {
          ((v = resolveColor(o.canvas, r)), (e = t.map((M) => resolveColor(o.canvas, M))));
          const h = document.createElement("canvas");
          ((h.width = 128), (h.height = 128));
          const S = h.getContext("2d");
          if (S) {
            const M = S.createImageData(128, 128);
            for (let p = 0; p < M.data.length; p += 4)
              ((M.data[p] = 255),
                (M.data[p + 1] = 255),
                (M.data[p + 2] = 255),
                (M.data[p + 3] =
                  hash2(p % 512, p / 512) < 0.6 ? 0 : hash2(p / 4, p % 128) * 90));
            (S.putImageData(M, 0, 0), (n = o.createPattern(h, "repeat")));
          }
        }
        const s = l * f;
        ((o.globalCompositeOperation = "source-over"),
          (o.fillStyle = v),
          o.fillRect(0, 0, b, g));
        const i = e[0],
          u = e[1] ?? e[0],
          y = e[2] ?? e[1] ?? e[0],
          a = o.createLinearGradient(0, 0, b, 0);
        (a.addColorStop(0, i),
          a.addColorStop(0.3, u),
          a.addColorStop(0.5, y),
          a.addColorStop(0.7, u),
          a.addColorStop(1, i),
          (o.globalCompositeOperation = "lighter"),
          (o.strokeStyle = a));
        const c = 72,
          C = g / 2;
        for (let h = 0; h < c; h++) {
          const S = h / (c - 1) - 0.5,
            M = hash2(h, 7) * 6.283;
          o.beginPath();
          for (let p = 0; p <= b; p += 5) {
            const B = p / b,
              L = Math.sin(B * 6.8 - s * 0.55 + 1.2),
              G = C + S * L * g * 0.42 + Math.sin(p * 0.02 - s * 1.1 + M) * 3;
            p === 0 ? o.moveTo(p, G) : o.lineTo(p, G);
          }
          ((o.lineWidth = 8),
            (o.globalAlpha = 0.02),
            o.stroke(),
            (o.lineWidth = 1.4),
            (o.globalAlpha = 0.075),
            o.stroke());
        }
        if (n) {
          const h = Math.floor(l * 5);
          ((o.globalCompositeOperation = "overlay"),
            (o.globalAlpha = 0.55),
            o.save(),
            o.translate(((h * 53) % 128) - 64, ((h * 97) % 128) - 64),
            (o.fillStyle = n),
            o.fillRect(-128, -128, b + 256, g + 256),
            o.restore());
        }
        ((o.globalCompositeOperation = "source-over"), (o.globalAlpha = 1));
      };
    }, [m, r, f]);
  return <CanvasLayer draw={d} />;
}
