/**
 * Dusk Filaments — Stacked neon filaments riding one shared S-curve, a warm sweep gliding along them with a chromatic fringe.
 *
 * Self-contained animated background: needs only React.
 * Extracted from getdesign.md/backgrounds.
 */
// @ts-nocheck — the public props are typed, the internals are vendored as-is.
import * as React from "react";
import { FX_BACKGROUND, ShaderCanvas } from "../engine";

export interface DuskFilamentsProps {
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

// Distance from the field value to its nearest filament, 0..0.5.
float lineDist(float u) {
  return abs(fract(u) - 0.5);
}
// Filament profile: hot core inside a wide soft halo.
float profile(float d) {
  return exp(-pow(d * 26.0, 1.7)) + 0.3 * exp(-pow(d * 7.0, 2.0));
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  float x = (uv.x - 0.5) * (uRes.x / uRes.y);
  float s = uTime * uSpeed;

  // One shared S-curve bends the whole stack in parallel.
  float wob = 0.75 * sin(x * 1.7 + s * 0.25) + 0.18 * sin(x * 3.1 - s * 0.15);
  float u = uv.y * 4.5 + wob;

  // Chromatic fringe: red and blue ride the field slightly apart.
  float ig = profile(lineDist(u));
  float ir = profile(lineDist(u + 0.012));
  float ib = profile(lineDist(u - 0.012));

  // A warm sweep glides along the filaments.
  float warm = 0.5 + 0.5 * sin(x * 1.2 - s * 0.8 + u * 0.7);
  warm = smoothstep(0.15, 0.85, warm);

  vec3 tint = mix(uC0, uC1, warm);
  vec3 col = vec3(
    tint.r * ir,
    tint.g * ig,
    tint.b * ib
  );
  // The core burns toward the highlight stop.
  col += uC2 * pow(ig, 3.0) * 0.45;
  col = 1.0 - exp(-col * 1.8);

  float gr = hash(gl_FragCoord.xy + floor(uTime * 5.0) * vec2(13.7, 7.3));
  col *= 0.93 + 0.14 * gr;
  col += (gr - 0.5) * 0.025;

  gl_FragColor = vec4(uBg + col, 1.0);
}
`;

export function DuskFilaments({
  colors: e = ["#4638d8", "#f04fd0", "#f2ecff"],
  background: o = FX_BACKGROUND,
  speed: t = 1,
}: DuskFilamentsProps) {
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
