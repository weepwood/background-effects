/**
 * Helix Haze — A rope of fine fibers twisted across the frame, deliberately dim: a slow-turning texture, not a beacon.
 *
 * Self-contained animated background: needs only React.
 * Extracted from getdesign.md/backgrounds.
 */
// @ts-nocheck — the public props are typed, the internals are vendored as-is.
import * as React from "react";
import { FX_BACKGROUND, FX_COLOR, ShaderCanvas } from "../engine";

export interface HelixHazeProps {
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

  // Rope axis: a slight diagonal across the frame.
  float ang = -0.22;
  mat2 R = mat2(cos(ang), -sin(ang), sin(ang), cos(ang));
  vec2 p = R * uv;
  float a = p.x;        // along the rope
  float b = p.y;        // perpendicular offset

  // Cylinder: recover the surface angle from the offset.
  float radius = 0.34 + 0.05 * sin(a * 2.1 + s * 0.1);
  float nb = clamp(b / radius, -1.0, 1.0);
  float surf = asin(nb);

  // Fibers: fbm over (axis, angle), the angle sheared along the axis —
  // the shear is the twist. Everything drifts slowly.
  float fiber = fbm(vec2(a * 3.2 - s * 0.12, (surf * 2.4 + a * 2.6 + s * 0.2) * 1.6));
  fiber = pow(fiber, 3.2);

  // Edge-on fibers pack together: brighten toward the rim, fade past it.
  float rim = 1.0 - sqrt(max(0.0, 1.0 - nb * nb));
  float body = smoothstep(1.15, 0.85, abs(b / radius));
  float i = fiber * body * (0.55 + 0.45 * rim);

  // A wide faint haze breathing around the rope.
  float haze = fbm(vec2(a * 1.1 + 4.0, b * 1.8 - s * 0.06)) * exp(-abs(b) * 2.2) * 0.06;

  // Deliberately dim: a texture, not a beacon.
  vec3 col = uC0 * (i * 0.38 + haze);
  col = 1.0 - exp(-col * 1.6);

  float gr = hash(gl_FragCoord.xy + floor(uTime * 5.0) * vec2(13.7, 7.3));
  col *= 0.93 + 0.14 * gr;
  col += (gr - 0.5) * 0.02;

  gl_FragColor = vec4(uBg + col, 1.0);
}
`;

export function HelixHaze({ color: e = FX_COLOR, background: o = FX_BACKGROUND, speed: t = 1 }: HelixHazeProps) {
  const s = React.useMemo(() => ({ uC0: e, uBg: o, uSpeed: t }), [e, o, t]);
  return <ShaderCanvas frag={FRAGMENT_SHADER} uniforms={s} />;
}
