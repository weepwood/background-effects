/**
 * Vapor Ribbons — A few wide, misty bands of color snaking across the frame, one palette stop per ribbon, no hard edges anywhere.
 *
 * Self-contained animated background: needs only React.
 * Extracted from getdesign.md/backgrounds.
 */
// @ts-nocheck — the public props are typed, the internals are vendored as-is.
import * as React from "react";
import { FX_BACKGROUND, ShaderCanvas } from "../engine";

export interface VaporRibbonsProps {
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

// One ribbon: a Gaussian body around a wandering path, inside a wide
// vapor halo.
float ribbon(vec2 p, float base, float seed, float s) {
  float path = base
    + 0.14 * sin(p.x * 1.3 + seed + s * 0.14)
    + 0.06 * sin(p.x * 2.9 - seed * 2.0 - s * 0.09)
    + 0.16 * (fbm(vec2(p.x * 0.55 + seed * 3.0, s * 0.05)) - 0.5);
  float m = abs(p.y - path);
  float wdt = 0.04 + 0.03 * fbm(vec2(p.x * 1.1 + seed * 7.0, s * 0.07));
  float body = exp(-pow(m / wdt, 2.0));
  float halo = exp(-pow(m / (wdt * 4.0), 2.0)) * 0.18;
  return body + halo;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes - 0.5;
  uv.x *= uRes.x / uRes.y;
  float s = uTime * uSpeed;

  // A slight tilt so the ribbons cross the frame instead of lying flat.
  float a = -0.14;
  vec2 p = mat2(cos(a), -sin(a), sin(a), cos(a)) * uv;

  vec3 col = vec3(0.0);
  col += uC0 * ribbon(p, 0.26, 1.7, s) * 0.65;
  col += uC1 * ribbon(p, -0.04, 4.9, s) * 0.75;
  col += uC2 * ribbon(p, -0.34, 8.3, s) * 0.5;

  col = 1.0 - exp(-col * 1.7);

  float gr = hash(gl_FragCoord.xy + floor(uTime * 5.0) * vec2(13.7, 7.3));
  col *= 0.93 + 0.14 * gr;
  col += (gr - 0.5) * 0.025;

  gl_FragColor = vec4(uBg + col, 1.0);
}
`;

export function VaporRibbons({
  colors: e = ["#a86df2", "#d66de0", "#6d5df2"],
  background: o = FX_BACKGROUND,
  speed: t = 1,
}: VaporRibbonsProps) {
  const s = React.useMemo(
    () => ({
      uC0: e[0],
      uC1: e[1] ?? e[0],
      uC2: e[2] ?? e[1] ?? e[0],
      uBg: o,
      uSpeed: t,
    }),
    [e, o, t],
  );
  return <ShaderCanvas frag={FRAGMENT_SHADER} uniforms={s} />;
}
