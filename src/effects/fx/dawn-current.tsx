/**
 * Dawn Current — One soft current of light flowing across mid-frame, hues sliding through it, no hard edge in the whole frame.
 *
 * Self-contained animated background: needs only React.
 * Extracted from getdesign.md/backgrounds.
 */
// @ts-nocheck — the public props are typed, the internals are vendored as-is.
import * as React from "react";
import { FX_BACKGROUND, ShaderCanvas } from "../engine";

export interface DawnCurrentProps {
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

vec3 palette(float t) {
  vec3 c = mix(uC0, uC1, smoothstep(0.0, 0.55, t));
  return mix(c, uC2, smoothstep(0.5, 1.0, t));
}

// One glow layer: exponential falloff from an fbm-displaced centerline.
float current(vec2 p, float seed, float s) {
  float wave = (fbm(vec2(p.x * 0.9 + seed, s * 0.1 + seed * 2.0)) - 0.5) * 0.45
    + 0.08 * sin(p.x * 2.2 + seed * 3.0 + s * 0.2);
  float m = abs(p.y - wave);
  float spread = 0.08 + 0.06 * fbm(vec2(p.x * 0.7 + seed * 5.0, s * 0.08));
  // Tighter than a pure exponential: the glow stays soft but the frame
  // above and below the current goes properly dark.
  return exp(-pow(m / spread, 1.6)) * 0.85;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes - 0.5;
  uv.x *= uRes.x / uRes.y;
  float s = uTime * uSpeed;

  vec3 col = vec3(0.0);

  // Two layers on separate clocks, hues sliding along the current.
  float i1 = current(uv, 1.7, s);
  float t1 = 0.5 + 0.5 * sin(uv.x * 1.4 + s * 0.16);
  col += palette(t1) * i1;

  float i2 = current(uv, 6.3, s + 3.0);
  float t2 = 0.5 + 0.5 * sin(uv.x * 1.1 - s * 0.11 + 2.0);
  col += palette(t2) * i2 * 0.6;

  col = 1.0 - exp(-col * 1.6);

  float gr = hash(gl_FragCoord.xy + floor(uTime * 5.0) * vec2(13.7, 7.3));
  col *= 0.93 + 0.14 * gr;
  col += (gr - 0.5) * 0.025;

  gl_FragColor = vec4(uBg + col, 1.0);
}
`;

export function DawnCurrent({
  colors: e = ["#5b8af2", "#a86df2", "#f25b9e"],
  background: o = FX_BACKGROUND,
  speed: t = 1,
}: DawnCurrentProps) {
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
