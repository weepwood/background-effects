/**
 * Storm Bolt — One bolt of lightning crackling down the frame: it re-strikes on a new path every few seconds and strobes as it holds.
 *
 * Self-contained animated background: needs only React.
 * Extracted from getdesign.md/backgrounds.
 */
// @ts-nocheck — the public props are typed, the internals are vendored as-is.
import * as React from "react";
import { FX_BACKGROUND, FX_COLOR, ShaderCanvas } from "../engine";

export interface StormBoltProps {
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
float noise1(float x) {
  return noise(vec2(x, 3.7));
}

// The bolt's horizontal position at height y: low octave snakes, high
// octaves jag.
float wander(float y, float seed) {
  return (fbm(vec2(y * 1.1 + seed * 13.0, seed)) - 0.5) * 0.7
    + (fbm(vec2(y * 3.6 - seed * 7.0, seed * 2.0)) - 0.5) * 0.24
    + (fbm(vec2(y * 9.5 + seed * 3.0, seed * 4.0)) - 0.5) * 0.09;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  vec2 p = vec2((uv.x - 0.5) * (uRes.x / uRes.y), uv.y);
  float s = uTime * uSpeed;

  // Re-strike: the seed steps every ~1.6s, so the bolt jumps to a new
  // path; within a strike it only shivers.
  float seed = floor(s * 0.62) + 0.13 * fract(s * 0.62);

  // Strobe: fast random flicker with occasional hard flashes.
  float strobe = 0.35 + 0.65 * pow(noise1(s * 9.0 + seed), 2.2);

  // Main bolt.
  float d = abs(p.x - wander(uv.y, seed));
  float bolt = 0.012 / (d + 0.008);

  // A fainter secondary branch on its own path.
  float d2 = abs(p.x - wander(uv.y, seed + 41.0) * 1.15 - 0.12);
  float branch = 0.005 / (d2 + 0.01);

  float i = (bolt + branch) * strobe;

  // Ambient flash: the hardest hits light the whole frame faintly.
  float flash = 0.03 * strobe * exp(-abs(p.x) * 1.2);

  vec3 col = uC0 * (i * 0.85 + flash) + vec3(1.0) * pow(min(i, 2.2), 3.0) * 0.08;
  col = 1.0 - exp(-col * 1.6);

  float gr = hash(gl_FragCoord.xy + floor(uTime * 5.0) * vec2(13.7, 7.3));
  col *= 0.93 + 0.14 * gr;
  col += (gr - 0.5) * 0.02;

  gl_FragColor = vec4(uBg + col, 1.0);
}
`;

export function StormBolt({ color: e = FX_COLOR, background: o = FX_BACKGROUND, speed: t = 1 }: StormBoltProps) {
  const s = React.useMemo(() => ({ uC0: e, uBg: o, uSpeed: t }), [e, o, t]);
  return <ShaderCanvas frag={FRAGMENT_SHADER} uniforms={s} />;
}
