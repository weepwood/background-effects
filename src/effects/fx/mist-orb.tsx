/**
 * Mist Orb — A sphere of slow-turning fog: wisps wrap the globe in soft layers and spill faintly past the limb.
 *
 * Self-contained animated background: needs only React.
 * Extracted from getdesign.md/backgrounds.
 */
// @ts-nocheck — the public props are typed, the internals are vendored as-is.
import * as React from "react";
import { FX_BACKGROUND, FX_COLOR, ShaderCanvas } from "../engine";

export interface MistOrbProps {
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
  vec2 p = uv - vec2(0.5);
  p.x *= uRes.x / uRes.y;
  float s = uTime * uSpeed;

  float R = 0.3;
  vec2 q = p / R;
  float rr = length(q);
  float py = clamp(q.y, -1.0, 1.0);

  // Longitude: x normalized by this slice's half-width, then asin. This
  // is what wraps the fog around the globe instead of scrolling it.
  float halfw = sqrt(max(0.0025, 1.0 - py * py));
  float lon = clamp(q.x / halfw, -1.0, 1.0);
  float ang = asin(lon) + s * 0.55;

  // Wispy density: domain-warped fbm over (longitude, height). The y
  // frequency runs hotter than x so the wisps stretch into horizontal
  // filaments instead of blotches.
  vec2 base = vec2(ang * 0.7, q.y * 2.2 - s * 0.1);
  float warp = fbm(base * 1.7 + vec2(0.0, s * 0.06));
  float dens = fbm(base * 2.2 + vec2(warp * 1.9, -warp * 0.7));

  // Horizontal strata sharpened into distinct stacked discs.
  float strat = 0.5 + 0.5 * sin(q.y * 6.5 + warp * 3.4 - s * 0.35);
  strat = pow(strat, 1.6);
  dens *= 0.3 + 0.7 * strat;
  dens = smoothstep(0.3, 0.68, dens);

  // Sphere body with a feathered edge, plus a faint equatorial spill.
  float body = smoothstep(1.18, 0.72, rr);
  float spill = exp(-abs(q.y) * 2.0) * exp(-max(0.0, rr - 1.0) * 2.6) * 0.16;

  float i = dens * body;
  vec3 col = uC0 * (i * 1.25 + spill) + vec3(1.0) * pow(i, 3.0) * 0.32;
  col = 1.0 - exp(-col * 1.9);

  float gr = hash(gl_FragCoord.xy + floor(uTime * 5.0) * vec2(13.7, 7.3));
  col *= 0.93 + 0.14 * gr;
  col += (gr - 0.5) * 0.025;

  gl_FragColor = vec4(uBg + col, 1.0);
}
`;

export function MistOrb({ color: e = FX_COLOR, background: o = FX_BACKGROUND, speed: t = 1 }: MistOrbProps) {
  const s = React.useMemo(() => ({ uC0: e, uBg: o, uSpeed: t }), [e, o, t]);
  return <ShaderCanvas frag={FRAGMENT_SHADER} uniforms={s} />;
}
