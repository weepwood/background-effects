/**
 * Mercury Veins — A churning pool of liquid metal, white-hot veins snaking through dark chrome, and the cursor stirs it.
 *
 * Self-contained animated background: needs only React.
 * Extracted from getdesign.md/backgrounds.
 */
// @ts-nocheck — the public props are typed, the internals are vendored as-is.
import * as React from "react";
import { FX_BACKGROUND, ShaderCanvas } from "../engine";

export interface MercuryVeinsProps {
  /** Effect color. Accepts a hex or a var(--token) reference. */
  color?: string;
  /** Canvas fill behind the effect. */
  background?: string;
  /** Animation speed multiplier. */
  speed?: number;
}

const FRAGMENT_SHADER = `
precision mediump float;
uniform vec2 uRes;
uniform float uTime;
uniform float uSpeed;
uniform vec2 uMouse;
uniform vec3 uC0;
uniform vec3 uBg;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

void main() {
  float mn = min(uRes.x, uRes.y);
  vec2 uv = (2.0 * gl_FragCoord.xy - uRes) / mn;
  float s = uTime * uSpeed;

  // The pointer leans the fluid's phase.
  vec2 m = (uMouse - 0.5) * 2.0;
  vec2 p = uv + m * 0.3;

  // Three folding passes; a small rotation between passes keeps the
  // churn from aligning into stripes.
  mat2 R = mat2(0.96, -0.28, 0.28, 0.96);
  float amp = 0.34;
  for (int i = 1; i <= 3; i++) {
    float fi = float(i);
    p.x += amp / fi * cos(fi * 2.1 * p.y + s * 0.6 + 1.7);
    p.y += amp / fi * sin(fi * 1.6 * p.x - s * 0.45 + 4.1);
    p = R * p;
  }

  // A damped ripple spreads from wherever the cursor rests.
  vec2 d = uv - m;
  float dist = length(d);
  p += (d / (dist + 1e-3)) * sin(dist * 18.0 - s * 2.2) * exp(-dist * 7.0) * 0.06;

  // Veins: the folded field burns where the phase plane crosses zero.
  float ph = abs(sin(p.x + p.y - s * 0.35));
  float i1 = 0.085 / (ph + 0.07);
  // A second, fainter crossing at another angle enriches the pool.
  float ph2 = abs(sin(p.x - p.y * 0.7 + s * 0.27 + 2.0));
  float i2 = 0.035 / (ph2 + 0.08);

  float i = i1 + i2 * 0.6;
  vec3 col = uC0 * i * 0.7;
  col = 1.0 - exp(-col * 1.9);

  float gr = hash(gl_FragCoord.xy + floor(uTime * 5.0) * vec2(13.7, 7.3));
  col *= 0.94 + 0.12 * gr;
  col += (gr - 0.5) * 0.02;

  gl_FragColor = vec4(uBg + col, 1.0);
}
`;

export function MercuryVeins({ color: e = "#e6e6ec", background: o = FX_BACKGROUND, speed: t = 1 }: MercuryVeinsProps) {
  const s = React.useMemo(() => ({ uC0: e, uBg: o, uSpeed: t }), [e, o, t]);
  return <ShaderCanvas frag={FRAGMENT_SHADER} uniforms={s} mouse={!0} />;
}
