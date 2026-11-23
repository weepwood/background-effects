/**
 * Satin Streaks — Long diagonal light trails, like satin caught in a slow pan: broad soft bands under a fine sparkle of thin lines.
 *
 * Self-contained animated background: needs only React.
 * Extracted from getdesign.md/backgrounds.
 */
// @ts-nocheck — the public props are typed, the internals are vendored as-is.
import * as React from "react";
import { FX_BACKGROUND, ShaderCanvas } from "../engine";

export interface SatinStreaksProps {
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
  vec2 uv = gl_FragCoord.xy / uRes - 0.5;
  uv.x *= uRes.x / uRes.y;
  float s = uTime * uSpeed;

  // Rotate so the streaks run bottom-left to top-right.
  float ang = -0.7;
  mat2 R = mat2(cos(ang), -sin(ang), sin(ang), cos(ang));
  vec2 p = R * uv;
  float a = p.x; // along the streak
  float b = p.y; // across the streaks

  // Broad satin bands: heavily stretched fbm sliding along the axis.
  float broad = fbm(vec2(a * 0.6 - s * 0.28, b * 5.5));
  float bands = pow(smoothstep(0.42, 0.85, broad), 2.0);

  // Fine sparkle: thinner, faster lines on the same axis.
  float fine = fbm(vec2(a * 1.3 - s * 0.45, b * 13.0));
  float wires = pow(smoothstep(0.55, 0.9, fine), 3.0) * 0.8;

  float i = bands * 0.85 + wires;

  // Tint drifts across the streaks: silver, white, warm brass.
  float tsel = fbm(vec2(b * 2.2 + 9.0, a * 0.15 - s * 0.05));
  vec3 tint = mix(uC0, uC1, smoothstep(0.3, 0.6, tsel));
  tint = mix(tint, uC2, smoothstep(0.62, 0.85, tsel));

  vec3 col = tint * i + vec3(1.0) * pow(i, 3.0) * 0.25;
  col = 1.0 - exp(-col * 1.8);

  float gr = hash(gl_FragCoord.xy + floor(uTime * 5.0) * vec2(13.7, 7.3));
  col *= 0.93 + 0.14 * gr;
  col += (gr - 0.5) * 0.025;

  gl_FragColor = vec4(uBg + col, 1.0);
}
`;

export function SatinStreaks({
  colors: e = ["#aeb6c4", "#f4f2ee", "#d9c1a0"],
  background: o = FX_BACKGROUND,
  speed: t = 1,
}: SatinStreaksProps) {
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
