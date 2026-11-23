/**
 * Opal Film — A bright sheet of thin-film iridescence, rainbow fringes tracing a kneading field: the one daylight surface in the set.
 *
 * Self-contained animated background: needs only React.
 * Extracted from getdesign.md/backgrounds.
 */
// @ts-nocheck — the public props are typed, the internals are vendored as-is.
import * as React from "react";
import { FX_BACKGROUND, ShaderCanvas } from "../engine";

export interface OpalFilmProps {
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
uniform vec2 uMouse;
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

  // The pointer leans the sheet a little.
  vec2 p = uv + (uMouse - 0.5) * 0.18;

  // The film's "thickness": slowly kneading warped fbm.
  vec2 q = vec2(
    fbm(p * 1.1 + vec2(0.0, s * 0.05)),
    fbm(p * 1.1 + vec2(5.2, -s * 0.04))
  );
  float v = fbm(p * 1.3 + 1.6 * q + vec2(s * 0.06, -s * 0.03));

  // Fringes cycle a closed wheel of cool anchors only — sky, teal,
  // violet, pink — so the foil can never drift into yellows.
  float t = fract(v * 1.6 + p.x * 0.05);
  vec3 A = vec3(0.45, 0.62, 0.95);
  vec3 B = vec3(0.45, 0.85, 0.85);
  vec3 C = vec3(0.62, 0.5, 0.95);
  vec3 D = vec3(0.95, 0.62, 0.85);
  float tt = t * 4.0;
  vec3 fringe = tt < 1.0 ? mix(A, B, tt)
    : tt < 2.0 ? mix(B, C, tt - 1.0)
    : tt < 3.0 ? mix(C, D, tt - 2.0)
    : mix(D, A, tt - 3.0);

  // Pastel foil: fringes lifted toward white, then tinted.
  vec3 col = mix(fringe, vec3(1.0), 0.3) * uC0 * 2.0;
  col = 1.0 - exp(-col * 1.6);

  float gr = hash(gl_FragCoord.xy + floor(uTime * 5.0) * vec2(13.7, 7.3));
  col *= 0.95 + 0.1 * gr;
  col += (gr - 0.5) * 0.015;

  gl_FragColor = vec4(uBg + col, 1.0);
}
`;

export function OpalFilm({ color: e = "#8099cc", background: o = FX_BACKGROUND, speed: t = 1 }: OpalFilmProps) {
  const s = React.useMemo(() => ({ uC0: e, uBg: o, uSpeed: t }), [e, o, t]);
  return <ShaderCanvas frag={FRAGMENT_SHADER} uniforms={s} mouse={!0} />;
}
