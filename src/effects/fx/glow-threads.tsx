/**
 * Glow Threads — Bundles of luminous threads drifting across the frame, each fan bending with distance and breathing as it goes.
 *
 * Self-contained animated background: needs only React.
 * Extracted from getdesign.md/backgrounds.
 */
// @ts-nocheck — the public props are typed, the internals are vendored as-is.
import * as React from "react";
import { FX_BACKGROUND, ShaderCanvas } from "../engine";

export interface GlowThreadsProps {
  /** Three-stop palette. Each entry accepts a hex or a var(--token) reference. */
  colors?: string[];
  /** Canvas fill behind the effect. */
  background?: string;
  /** Animation speed multiplier. */
  speed?: number;
  /** Threads per bundle (3 to 14). */
  count?: number;
}

const FRAGMENT_SHADER = `
precision mediump float;
uniform vec2 uRes;
uniform float uTime;
uniform float uSpeed;
uniform float uCount;
uniform vec3 uC0;
uniform vec3 uC1;
uniform vec3 uC2;
uniform vec3 uBg;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

vec3 palette(float t) {
  vec3 c = mix(uC0, uC1, smoothstep(0.0, 0.55, t));
  return mix(c, uC2, smoothstep(0.5, 1.0, t));
}

// One bundle of threads in its own bending frame.
vec3 bundle(vec2 uv, float rot, float curl, float freq, float seed, float gain, float s) {
  float r = length(uv);
  float a = rot + curl * r;
  mat2 R = mat2(cos(a), -sin(a), sin(a), cos(a));
  vec2 p = R * uv;

  // The fan breathes: amplitude swells and pinches over time.
  float amp = 0.22 + 0.14 * sin(s * 0.23 + seed);
  vec3 acc = vec3(0.0);

  for (int i = 0; i < 14; i++) {
    if (float(i) >= uCount) break;
    float fi = float(i);
    float t = fi / max(uCount - 1.0, 1.0);
    float y = sin(p.x * freq + seed + fi * 0.4 + s * 0.32) * amp * (0.6 + 0.8 * t)
      + (t - 0.5) * 0.14;
    float m = abs(p.y - y);
    // Hot exponential core inside a soft reciprocal halo.
    float line = exp(-m * 90.0) * 0.55 + 0.012 / (m + 0.012);
    acc += palette(t) * line;
  }
  return acc * gain;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes - 0.5;
  uv.x *= uRes.x / uRes.y;
  float s = uTime * uSpeed;

  vec3 col = vec3(0.0);
  col += bundle(uv, -0.42, 0.35, 1.9, 1.7, 0.085, s);
  col += bundle(uv, 0.24, -0.5, 1.5, 4.2, 0.06, s);
  col += bundle(uv + vec2(0.15, 0.28), -0.85, 0.25, 2.3, 8.9, 0.035, s);

  col = 1.0 - exp(-col * 1.6);

  float gr = hash(gl_FragCoord.xy + floor(uTime * 5.0) * vec2(13.7, 7.3));
  col *= 0.93 + 0.14 * gr;
  col += (gr - 0.5) * 0.02;

  gl_FragColor = vec4(uBg + col, 1.0);
}
`;

export function GlowThreads({
  colors: e = ["#e86bd8", "#f5f0fa", "#8b5bd6"],
  background: o = FX_BACKGROUND,
  speed: t = 1,
  count: s = 9,
}: GlowThreadsProps) {
  const R = React.useMemo(
    () => ({
      uC0: e[0],
      uC1: e[1] ?? e[0],
      uC2: e[2] ?? e[1] ?? e[0],
      uBg: o,
      uSpeed: t,
      uCount: Math.min(14, Math.max(3, s)),
    }),
    [e, o, t, s],
  );
  return <ShaderCanvas frag={FRAGMENT_SHADER} uniforms={R} />;
}
