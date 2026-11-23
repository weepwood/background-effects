/**
 * Molten Panes — Vertical glass panes filled with slow-rising liquid chrome, creased into glossy folds by the palette.
 *
 * Self-contained animated background: needs only React.
 * Extracted from getdesign.md/backgrounds.
 */
// @ts-nocheck — the public props are typed, the internals are vendored as-is.
import * as React from "react";
import { FX_BACKGROUND, ShaderCanvas } from "../engine";

export interface MoltenPanesProps {
  /** Three-stop palette. Each entry accepts a hex or a var(--token) reference. */
  colors?: string[];
  /** Canvas fill behind the effect. */
  background?: string;
  /** Animation speed multiplier. */
  speed?: number;
  /** Number of panes across the width. */
  panes?: number;
}

const FRAGMENT_SHADER = `
precision mediump float;
uniform vec2 uRes;
uniform float uTime;
uniform float uSpeed;
uniform float uPanes;
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
  float s = uTime * uSpeed;

  float id = floor(uv.x * uPanes);
  float lx = fract(uv.x * uPanes);
  float ph = hash(vec2(id, 7.0)) * 6.283;

  // Pane-local field, rising slowly; the id offset decorrelates panes.
  // Frequencies stay low — the liquid reads as a few large blobs per
  // pane, not turbulence.
  vec2 p = vec2(lx * 0.5 + id * 3.7, uv.y * 0.6);
  vec2 q = vec2(
    fbm(p * 0.8 + vec2(ph, -s * 0.22)),
    fbm(p * 0.8 + vec2(5.2 + ph * 1.3, -s * 0.18))
  );
  float v = fbm(p * 0.9 + 1.8 * q + vec2(0.0, -s * 0.25));

  // Sine-folding: soft noise creased into liquid-metal folds. The hard
  // exponent keeps most of the pane near-black so the creases read.
  float m = 0.5 + 0.5 * sin(v * 7.0 + s * 0.6 + ph);
  m = pow(m, 3.2);
  // A tight specular band riding the same field.
  float gloss = pow(0.5 + 0.5 * sin(v * 18.0 - s * 0.8), 8.0) * 0.35;

  float tone = clamp(m + gloss, 0.0, 1.0);
  vec3 col = mix(uC0, uC1, smoothstep(0.35, 0.75, tone));
  col = mix(col, uC2, smoothstep(0.7, 0.97, tone));
  col *= 0.05 + 0.95 * tone;

  // Thin dark seams between panes.
  float seam = smoothstep(0.0, 0.045, lx) * smoothstep(1.0, 0.955, lx);
  col *= 0.2 + 0.8 * seam;

  col = 1.0 - exp(-col * 1.7);

  float gr = hash(gl_FragCoord.xy + floor(uTime * 5.0) * vec2(13.7, 7.3));
  col *= 0.93 + 0.14 * gr;
  col += (gr - 0.5) * 0.025;

  gl_FragColor = vec4(uBg + col, 1.0);
}
`;

export function MoltenPanes({
  colors: e = ["#4c1d95", "#a855f7", "#e879f9"],
  background: o = FX_BACKGROUND,
  speed: t = 1,
  panes: s = 6,
}: MoltenPanesProps) {
  const R = React.useMemo(
    () => ({
      uC0: e[0],
      uC1: e[1] ?? e[0],
      uC2: e[2] ?? e[1] ?? e[0],
      uBg: o,
      uSpeed: t,
      uPanes: s,
    }),
    [e, o, t, s],
  );
  return <ShaderCanvas frag={FRAGMENT_SHADER} uniforms={R} />;
}
