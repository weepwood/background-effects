/**
 * Veil Rays — Soft volumetric light falling from above — organic beams, a breathing cone, and film grain.
 *
 * Self-contained animated background: needs only React.
 * Extracted from getdesign.md/backgrounds.
 */
// @ts-nocheck — the public props are typed, the internals are vendored as-is.
import * as React from "react";
import { FX_BACKGROUND, FX_COLOR, ShaderCanvas } from "../engine";

export interface VeilRaysProps {
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
  vec2 uv = gl_FragCoord.xy / uRes;
  uv.y = 1.0 - uv.y;
  float s = uTime * uSpeed;

  // Origin floats just above the top edge; x is aspect-corrected so the
  // cone keeps its shape on wide hero bands.
  vec2 d = uv - vec2(0.5, -0.08);
  d.x *= (uRes.x / uRes.y) * 0.72;
  float dist = length(d);
  float ang = atan(d.x, d.y);

  // Cone envelope: full light near the axis, fading out by ~50 degrees.
  float cone = smoothstep(0.9, 0.15, abs(ang));

  // Organic beams: an fbm field sampled over angle, drifting slowly.
  float beams = pow(0.35 + 0.65 * fbm(vec2(ang * 5.5 + 7.0, s * 0.12)), 2.2);
  float fine = 0.5 + 0.5 * sin(ang * 36.0 + fbm(vec2(ang * 3.0, s * 0.2)) * 5.0);
  beams *= 0.75 + 0.25 * fine;

  float fall = exp(-dist * 1.9);
  float core = exp(-dist * 5.0) * 0.6;

  float i = cone * (beams * fall + core + 0.05 * fall);
  i *= 0.92 + 0.08 * sin(s * 0.6);

  vec3 col = uC0 * i * 1.25 + vec3(1.0) * pow(i, 3.0) * 0.3;
  col = 1.0 - exp(-col * 1.7);

  float gr = hash(gl_FragCoord.xy + floor(uTime * 5.0) * vec2(13.7, 7.3));
  col *= 0.93 + 0.14 * gr;
  col += (gr - 0.5) * 0.025;

  gl_FragColor = vec4(uBg + col, 1.0);
}
`;

export function VeilRays({ color: t = FX_COLOR, background: r = FX_BACKGROUND, speed: f = 1 }: VeilRaysProps) {
  const m = React.useMemo(() => ({ uC0: t, uBg: r, uSpeed: f }), [t, r, f]);
  return <ShaderCanvas frag={FRAGMENT_SHADER} uniforms={m} />;
}
