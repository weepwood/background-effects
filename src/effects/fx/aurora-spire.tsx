/**
 * Aurora Spire — A slow column of light climbing through the frame, silky veils rising and wrapping inside it.
 *
 * Self-contained animated background: needs only React.
 * Extracted from getdesign.md/backgrounds.
 */
// @ts-nocheck — the public props are typed, the internals are vendored as-is.
import * as React from "react";
import { FX_BACKGROUND, ShaderCanvas } from "../engine";

export interface AuroraSpireProps {
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
  vec2 p = vec2((uv.x - 0.5) * (uRes.x / uRes.y), uv.y);
  float s = uTime * uSpeed;

  // Tilted axis that snakes slowly with height.
  float axis = (uv.y - 0.5) * 0.22 + 0.12 * (fbm(vec2(uv.y * 1.6, s * 0.07)) - 0.5);
  float dx = p.x - axis;

  // Column envelope: a soft Gaussian whose width breathes with height.
  float wdt = 0.2 + 0.08 * fbm(vec2(uv.y * 2.2 + 7.0, s * 0.06));
  float column = exp(-pow(dx / wdt, 2.0));

  // Rising veils: warped fbm in column-local coordinates. The phase
  // shear across the width fakes the wrap-around rotation.
  vec2 q = vec2(dx * 3.0 + uv.y * 1.4 + s * 0.18, uv.y * 1.3 - s * 0.28);
  float warp = fbm(q * 1.6 + vec2(0.0, s * 0.05));
  float veil = fbm(q * 2.1 + vec2(warp * 1.7, -warp * 0.5));
  veil = pow(smoothstep(0.3, 0.85, veil), 1.7);

  // A finer, faster layer of wisps on top.
  float wisp = fbm(vec2(dx * 6.5 - uv.y * 2.0 - s * 0.1, uv.y * 3.2 - s * 0.5));
  wisp = pow(smoothstep(0.5, 0.9, wisp), 2.0) * 0.6;

  float i = column * (veil + wisp) + column * column * 0.12;

  // Bottom stop to top stop along the height; hottest wisps burn to the
  // third stop.
  vec3 tint = mix(uC1, uC0, smoothstep(0.05, 0.95, uv.y));
  vec3 col = tint * i * 1.6 + uC2 * pow(i, 3.0) * 0.45;
  col = 1.0 - exp(-col * 1.7);

  float gr = hash(gl_FragCoord.xy + floor(uTime * 5.0) * vec2(13.7, 7.3));
  col *= 0.93 + 0.14 * gr;
  col += (gr - 0.5) * 0.025;

  gl_FragColor = vec4(uBg + col, 1.0);
}
`;

export function AuroraSpire({
  colors: e = ["#6d4df2", "#f27dd7", "#f4ecff"],
  background: o = FX_BACKGROUND,
  speed: t = 1,
}: AuroraSpireProps) {
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
