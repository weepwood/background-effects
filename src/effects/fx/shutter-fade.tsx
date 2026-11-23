/**
 * Shutter Fade — A three-stop gradient sliced into tilted blinds, dark until a cursor-following spotlight lifts the slats it crosses.
 *
 * Self-contained animated background: needs only React.
 * Extracted from getdesign.md/backgrounds.
 */
// @ts-nocheck — the public props are typed, the internals are vendored as-is.
import * as React from "react";
import { FX_BACKGROUND, ShaderCanvas } from "../engine";

export interface ShutterFadeProps {
  /** Three-stop palette. Each entry accepts a hex or a var(--token) reference. */
  colors?: string[];
  /** Canvas fill behind the effect. */
  background?: string;
  /** Animation speed multiplier. */
  speed?: number;
  /** Number of blinds across the frame. */
  count?: number;
}

const FRAGMENT_SHADER = `
precision mediump float;
uniform vec2 uRes;
uniform float uTime;
uniform float uSpeed;
uniform float uCount;
uniform vec2 uMouse;
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

void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  vec2 p = uv - 0.5;
  p.x *= uRes.x / uRes.y;
  float s = uTime * uSpeed;

  // Tilted axis for the blinds.
  float a = 0.35;
  vec2 r = mat2(cos(a), -sin(a), sin(a), cos(a)) * p;

  // Base gradient runs along the rotated axis.
  vec3 base = palette(clamp(r.x * 0.55 + 0.5, 0.0, 1.0));

  // Slats: a sawtooth across the axis, eased into a lit edge that
  // falls away into shadow.
  float saw = fract(r.x * uCount * 0.55 + 0.25);
  float slat = pow(1.0 - saw, 1.6);

  // The spotlight follows the cursor (damped upstream); the frame stays
  // dark until the light passes over it. A whisper of drift keeps the
  // idle state alive.
  vec2 lp = vec2((uMouse.x - 0.5) * (uRes.x / uRes.y), uMouse.y - 0.5);
  lp += vec2(0.03 * cos(s * 0.3), 0.02 * sin(s * 0.24));
  float d = length(p - lp);
  float light = exp(-d * d * 5.5);

  // Away from the light the frame sinks to near-black; the slats only
  // whisper until the spotlight reaches them.
  float i = slat * (0.07 + 0.93 * light) + 0.05 * light;
  vec3 col = base * i * 1.5;
  col = 1.0 - exp(-col * 1.8);

  // Heavier grain than the rest of the kit — the dust is the texture.
  float gr = hash(gl_FragCoord.xy + floor(uTime * 5.0) * vec2(13.7, 7.3));
  col *= 0.88 + 0.24 * gr;
  col += (gr - 0.5) * 0.03;

  gl_FragColor = vec4(uBg + col, 1.0);
}
`;

export function ShutterFade({
  colors: e = ["#f28ae0", "#8a5cf2", "#4632d8"],
  background: o = FX_BACKGROUND,
  speed: t = 1,
  count: s = 14,
}: ShutterFadeProps) {
  const R = React.useMemo(
    () => ({
      uC0: e[0],
      uC1: e[1] ?? e[0],
      uC2: e[2] ?? e[1] ?? e[0],
      uBg: o,
      uSpeed: t,
      uCount: s,
    }),
    [e, o, t, s],
  );
  return <ShaderCanvas frag={FRAGMENT_SHADER} uniforms={R} mouse={!0} />;
}
