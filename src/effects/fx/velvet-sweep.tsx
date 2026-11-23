/**
 * Velvet Sweep — One curved ribbon of glowing cloth sweeping the frame, silk striations sliding along it, the rest left dark.
 *
 * Self-contained animated background: needs only React.
 * Extracted from getdesign.md/backgrounds.
 */
// @ts-nocheck — the public props are typed, the internals are vendored as-is.
import * as React from "react";
import { FX_BACKGROUND, FX_COLOR, ShaderCanvas } from "../engine";

export interface VelvetSweepProps {
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
  vec2 p = vec2((uv.x - 0.5) * (uRes.x / uRes.y), uv.y - 0.5);
  float s = uTime * uSpeed;

  // The ribbon follows an arc around an off-frame pivot at upper right.
  vec2 pivot = vec2(0.85, 0.55);
  vec2 d = p - pivot;
  float r = length(d);
  float ang = atan(d.y, d.x);

  // Organic band: the arc radius wanders with angle and time.
  float wander = (fbm(vec2(ang * 2.0 + 3.0, s * 0.06)) - 0.5) * 0.3;
  float dist = r - (1.05 + wander);

  // Gaussian envelope forms the band; width varies along it.
  float wdt = 0.2 + 0.12 * fbm(vec2(ang * 1.6 + 9.0, s * 0.05));
  float band = exp(-pow(dist / wdt, 2.0));

  // Fade the ribbon out toward its ends. From this pivot the visible
  // frame spans roughly ang in [-pi, -2.0].
  float ends = smoothstep(-3.35, -2.9, ang) * smoothstep(-1.8, -2.35, ang);

  // Silk grain: striations parallel to the band, sliding slowly.
  float grain = fbm(vec2(ang * 3.0, dist * 6.0) + s * 0.08);
  float folds = 0.5 + 0.5 * sin(dist * 13.0 + grain * 3.5 - s * 0.45);
  folds = pow(smoothstep(0.1, 0.95, folds), 1.3);

  float i = band * ends * (0.25 + 0.75 * folds);

  vec3 col = uC0 * i * 1.15 + vec3(1.0) * pow(i, 4.0) * 0.12;
  col = 1.0 - exp(-col * 1.8);

  float gr = hash(gl_FragCoord.xy + floor(uTime * 5.0) * vec2(13.7, 7.3));
  col *= 0.93 + 0.14 * gr;
  col += (gr - 0.5) * 0.025;

  gl_FragColor = vec4(uBg + col, 1.0);
}
`;

export function VelvetSweep({ color: e = FX_COLOR, background: o = FX_BACKGROUND, speed: t = 1 }: VelvetSweepProps) {
  const s = React.useMemo(() => ({ uC0: e, uBg: o, uSpeed: t }), [e, o, t]);
  return <ShaderCanvas frag={FRAGMENT_SHADER} uniforms={s} />;
}
