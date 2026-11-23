/**
 * Nimbus Twist — A luminous halo breathing at center frame; bring the cursor near and it squirms into tendrils and spins faster.
 *
 * Self-contained animated background: needs only React.
 * Extracted from getdesign.md/backgrounds.
 */
// @ts-nocheck — the public props are typed, the internals are vendored as-is.
import * as React from "react";
import { FX_BACKGROUND, ShaderCanvas } from "../engine";

export interface NimbusTwistProps {
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
uniform vec2 uMouse;
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
  float mn = min(uRes.x, uRes.y);
  vec2 uv = (gl_FragCoord.xy - 0.5 * uRes) / mn * 2.0;
  float s = uTime * uSpeed;

  // Hover: how close the (damped) cursor is to the halo's heart.
  vec2 mc = (uMouse * uRes - 0.5 * uRes) / mn * 2.0;
  float hov = smoothstep(1.0, 0.55, length(mc));

  // Touched, the field squirms; the idle spin also picks up speed.
  vec2 p = uv;
  p += hov * 0.11 * vec2(sin(p.y * 9.0 + s * 2.1), sin(p.x * 9.0 + s * 1.7));
  float ra = s * (0.05 + 0.4 * hov);
  p = mat2(cos(ra), -sin(ra), sin(ra), cos(ra)) * p;

  float ang = atan(p.y, p.x);
  vec2 dir = vec2(cos(ang), sin(ang));
  float len = length(p);

  // Near-circular orbit: the radius only shivers, it does not lump.
  float n = fbm(dir * 0.9 + vec2(s * 0.12, -s * 0.08));
  float r = 0.62 + (n - 0.5) * 0.07;

  float band = exp(-pow((len - r) * 22.0, 2.0));
  float glowOut = exp(-max(len - r, 0.0) * 4.5) * 0.3;
  float glowIn = exp(-max(r - len, 0.0) * 6.0) * 0.22;

  // A hot spark orbits the ring.
  vec2 sp = vec2(cos(-s * 0.9), sin(-s * 0.9)) * r;
  float dsp = length(p - sp);
  float spark = 0.7 / (1.0 + dsp * dsp * 70.0);

  // Hue walks the first two stops around the circumference.
  vec3 ringCol = mix(uC0, uC1, 0.5 + 0.5 * cos(ang + s * 0.7));

  vec3 col = ringCol * (band + glowOut + spark)
    + uC2 * glowIn
    + vec3(1.0) * pow(band, 3.0) * 0.3;
  col = 1.0 - exp(-col * 1.8);

  float gr = hash(gl_FragCoord.xy + floor(uTime * 5.0) * vec2(13.7, 7.3));
  col *= 0.93 + 0.14 * gr;
  col += (gr - 0.5) * 0.02;

  gl_FragColor = vec4(uBg + col, 1.0);
}
`;

export function NimbusTwist({
  colors: e = ["#9c43fe", "#4cc2e9", "#141980"],
  background: o = FX_BACKGROUND,
  speed: t = 1,
}: NimbusTwistProps) {
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
  return (
    <ShaderCanvas
      frag={FRAGMENT_SHADER}
      uniforms={s}
      mouse={!0}
      mouseInitial={[0.5, -0.4]}
    />
  );
}
