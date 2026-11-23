/**
 * Glyph Tide — A terminal glyph ramp breathing as a wave field. Pure text, pure canvas.
 *
 * Self-contained animated background: needs only React.
 * Extracted from getdesign.md/backgrounds.
 */
// @ts-nocheck — the public props are typed, the internals are vendored as-is.
import * as React from "react";
import { FX_BACKGROUND, FX_COLOR, resolveColor, CanvasLayer } from "../engine";

export interface GlyphTideProps {
  /** Effect color. Accepts a hex or a var(--token) reference. */
  color?: string;
  /** Canvas fill behind the effect. */
  background?: string;
  /** Animation speed multiplier. */
  speed?: number;
  /** Glyph density ramp, sparse to dense. */
  characters?: string;
}

export function GlyphTide({
  color: t = FX_COLOR,
  background: r = FX_BACKGROUND,
  speed: f = 1,
  characters: m = " .:-+*=%@#",
}: GlyphTideProps) {
  const d = React.useMemo(() => {
    let v = "",
      e = "",
      n = "";
    return (o, b, g, l) => {
      v ||
        ((v = resolveColor(o.canvas, t)),
        (e = resolveColor(o.canvas, r)),
        (n = `12px ${getComputedStyle(o.canvas).getPropertyValue("--font-mono").trim() || "monospace"}`));
      const s = l * f;
      ((o.fillStyle = e),
        o.fillRect(0, 0, b, g),
        (o.fillStyle = v),
        (o.font = n),
        (o.textAlign = "center"),
        (o.textBaseline = "middle"));
      const i = 14;
      for (let u = i / 2; u < g; u += i)
        for (let y = i / 2; y < b; y += i) {
          const a =
              0.5 +
              0.5 *
                Math.sin(
                  y * 0.03 + s * 1.1 + Math.sin(u * 0.045 + s * 0.6) * 2,
                ),
            c = 0.5 + 0.5 * Math.sin((y + u) * 0.012 - s * 0.8),
            C = a * 0.65 + c * 0.35,
            h = Math.min(m.length - 1, Math.floor(C * m.length)),
            S = m[h];
          S !== " " && ((o.globalAlpha = 0.2 + 0.8 * C), o.fillText(S, y, u));
        }
      o.globalAlpha = 1;
    };
  }, [t, r, f, m]);
  return <CanvasLayer draw={d} />;
}
