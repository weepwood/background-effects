/**
 * Marble Flux — Glossy fluid folds kneading themselves in slow motion, like poured gloss under studio light.
 *
 * Self-contained animated background: needs only React.
 * Extracted from getdesign.md/backgrounds.
 */
// @ts-nocheck — the public props are typed, the internals are vendored as-is.
import * as React from "react";
import { FX_BACKGROUND, FX_COLOR, ShaderCanvas } from "../engine";

export interface MarbleFluxProps {
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
uniform vec3 uC0;
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
  vec2 uv = gl_FragCoord.xy / uRes - 0.5;
  uv.x *= uRes.x / uRes.y;
  float s = uTime * uSpeed;
  vec2 p = uv * 1.15;

  // Triple-nested warp: each layer drifts on its own clock, so the
  // folds shear and re-fold instead of scrolling past.
  vec2 q1 = vec2(
    fbm(p + vec2(0.0, s * 0.1)),
    fbm(p + vec2(5.2, 1.3) - vec2(s * 0.08, 0.0))
  );
  vec2 q2 = vec2(
    fbm(p + 2.2 * q1 + vec2(1.7, 9.2) + vec2(s * 0.12, 0.0)),
    fbm(p + 2.2 * q1 + vec2(8.3, 2.8) - vec2(0.0, s * 0.09))
  );
  float v = fbm(p + 2.4 * q2);

  // Glossy ridges: a sine fold cut into bands with deep black creases.
  float m = 0.5 + 0.5 * sin(v * 11.0 + s * 0.4);
  m = smoothstep(0.15, 0.9, m);
  m = pow(m, 1.6);

  // Satin sheen: a tight highlight riding the same field.
  float sheen = pow(0.5 + 0.5 * sin(v * 22.0 + 1.3), 12.0) * 0.5;

  vec3 col = uC0 * m * 0.9 + vec3(1.0) * (pow(m, 4.0) * 0.15 + sheen * m * 0.6);
  col = 1.0 - exp(-col * 1.9);

  float gr = hash(gl_FragCoord.xy + floor(uTime * 5.0) * vec2(13.7, 7.3));
  col *= 0.93 + 0.14 * gr;
  col += (gr - 0.5) * 0.025;

  gl_FragColor = vec4(uBg + col, 1.0);
}
`;

export function MarbleFlux({ color: e = FX_COLOR, background: o = FX_BACKGROUND, speed: t = 1 }: MarbleFluxProps) {
  const s = React.useMemo(() => ({ uC0: e, uBg: o, uSpeed: t }), [e, o, t]);
  return <ShaderCanvas frag={FRAGMENT_SHADER} uniforms={s} />;
}
