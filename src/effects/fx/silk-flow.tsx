/**
 * Silk Flow — Full-bleed silk folds drifting sideways — a WebGL field made to sit behind hero content.
 *
 * Self-contained animated background: needs only React.
 * Extracted from getdesign.md/backgrounds.
 */
// @ts-nocheck — the public props are typed, the internals are vendored as-is.
import * as React from "react";
import { FX_BACKGROUND, ShaderCanvas } from "../engine";

export interface SilkFlowProps {
  /** Three-stop palette. Each entry accepts a hex or a var(--token) reference. */
  colors?: string[];
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
uniform vec3 uC0;
uniform vec3 uC1;
uniform vec3 uC2;
uniform vec3 uBg;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}
float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) {
    v += a * noise(p);
    p *= 2.03;
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  uv.y = 1.0 - uv.y;
  float s = uTime * uSpeed;

  // Streak noise stretched along x, drifting rightward.
  float n1 = fbm(vec2(uv.x * 1.8 - s * 0.10, uv.y * 5.0));
  float n2 = fbm(vec2(uv.x * 3.1 - s * 0.16 + 17.0, uv.y * 7.0 + 3.0));

  // Fold coordinate: ~2.6 soft sheets stacked over the full height, waved
  // along x by two travelling waves. All motion is horizontal translation.
  float v = uv.y * 2.6
          + 0.35 * sin(uv.x * 3.6 - s * 0.40 + n1 * 2.6)
          + 0.22 * sin(uv.x * 6.8 - s * 0.25 + n2 * 3.0)
          + (n1 - 0.5) * 0.9;

  float fold = 0.5 + 0.5 * sin(v * 6.2831);
  float body = pow(fold, 1.8);
  float sheen = pow(fold, 7.0);

  // Palette blends left to right, warped so the seams wander.
  float m = clamp(uv.x + (n2 - 0.5) * 0.4, 0.0, 1.0);
  vec3 base = mix(uC0, uC1, smoothstep(0.15, 0.60, m));
  base = mix(base, uC2, smoothstep(0.60, 1.0, m) * 0.85);

  vec3 col = base * body * (0.45 + 0.55 * n1);
  col += (base * 0.4 + vec3(0.6)) * sheen * 0.5;

  // Vertical vignette: the field fades into the canvas at top and bottom.
  col *= smoothstep(0.0, 0.18, uv.y) * smoothstep(1.0, 0.82, uv.y);
  col = 1.0 - exp(-col * 1.8);

  float gr = hash(gl_FragCoord.xy + floor(uTime * 5.0) * vec2(13.7, 7.3));
  col *= 0.92 + 0.16 * gr;
  col += (gr - 0.5) * 0.03;

  gl_FragColor = vec4(uBg + col, 1.0);
}
`;

export function SilkFlow({
  colors: t = ["#767676", "#f2f4f8", "#a6abb4"],
  background: r = FX_BACKGROUND,
  speed: f = 1,
}: SilkFlowProps) {
  const m = React.useMemo(
    () => ({
      uC0: t[0],
      uC1: t[1] ?? t[0],
      uC2: t[2] ?? t[1] ?? t[0],
      uBg: r,
      uSpeed: f,
    }),
    [t.join("|"), r, f],
  );
  return <ShaderCanvas frag={FRAGMENT_SHADER} uniforms={m} />;
}
