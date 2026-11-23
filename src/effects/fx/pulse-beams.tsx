/**
 * Pulse Beams — A wall of vertical light columns, each flickering on its own tempo under soft bloom.
 *
 * Self-contained animated background: needs only React.
 * Extracted from getdesign.md/backgrounds.
 */
// @ts-nocheck — the public props are typed, the internals are vendored as-is.
import * as React from "react";
import { FX_BACKGROUND, FX_COLOR, ShaderCanvas } from "../engine";

export interface PulseBeamsProps {
  /** Effect color. Accepts a hex or a var(--token) reference. */
  color?: string;
  /** Canvas fill behind the effect. */
  background?: string;
  /** Animation speed multiplier. */
  speed?: number;
  /** Number of beams across the width. */
  count?: number;
}

const FRAGMENT_SHADER = `
precision mediump float;
uniform vec2 uRes;
uniform float uTime;
uniform float uSpeed;
uniform float uCount;
uniform vec3 uC0;
uniform vec3 uBg;

float hash1(float n) {
  return fract(sin(n * 127.1) * 43758.5453);
}
float hash2(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}
float vnoise(float x) {
  float i = floor(x);
  float f = fract(x);
  float u = f * f * (3.0 - 2.0 * f);
  return mix(hash1(i), hash1(i + 1.0), u);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  float yt = 1.0 - uv.y; // 0 at the top edge, 1 at the floor
  float s = uTime * uSpeed;

  float x = uv.x * uCount;
  float acc = 0.0;

  // Scan the column under this pixel plus two neighbors each side so the
  // wide halos overlap instead of clipping at column boundaries.
  for (int k = -2; k <= 2; k++) {
    float id = floor(x) + float(k);
    float inRange = step(-0.5, id) * step(id, uCount - 0.5);
    float rnd = hash1(id * 7.31 + 1.7);

    // Per-beam flicker: slow breathing modulated by a faster shimmer.
    float rate = 0.7 + rnd * 1.6;
    float fl = 0.3 + 0.7 * pow(vnoise(s * rate + rnd * 43.0), 1.7);
    fl *= 0.82 + 0.18 * vnoise(s * rate * 2.6 + rnd * 91.0);

    // Width breathes; the beam sways slightly off its column center.
    float wPulse = 0.7 + 0.3 * sin(s * (0.4 + rnd * 0.5) + rnd * 6.283);
    float center = id + 0.5 + 0.2 * sin(s * 0.26 + rnd * 6.283);
    float d = abs(x - center);

    // Narrow hot core inside a wide soft halo.
    float core = exp(-pow(d / (0.11 * wPulse + 0.02), 2.0));
    float halo = 0.38 * exp(-pow(d / (0.5 + 0.3 * rnd), 2.0));

    // Energy drifting down the beam so each column shimmers along its length.
    float travel = 0.68 + 0.32 * vnoise(yt * 2.6 + s * (0.5 + rnd * 0.7) + rnd * 29.0);

    acc += inRange * (core + halo) * fl * travel * (0.55 + 0.45 * rnd);
  }

  // Beams hang from the top and dissolve toward the floor; the very top
  // edge eases in so columns don't hit the frame with a hard line.
  float fall = exp(-yt * 1.5);
  float lift = smoothstep(0.0, 0.06, yt);
  float i = acc * fall * lift + 0.05 * exp(-yt * 2.2);

  vec3 col = uC0 * i * 1.15 + vec3(1.0) * pow(i, 3.0) * 0.35;
  col = 1.0 - exp(-col * 1.6);

  float gr = hash2(gl_FragCoord.xy + floor(uTime * 5.0) * vec2(13.7, 7.3));
  col *= 0.93 + 0.14 * gr;
  col += (gr - 0.5) * 0.025;

  gl_FragColor = vec4(uBg + col, 1.0);
}
`;

export function PulseBeams({ color: e = FX_COLOR, background: o = FX_BACKGROUND, speed: t = 1, count: s = 16 }: PulseBeamsProps) {
  const R = React.useMemo(
    () => ({ uC0: e, uBg: o, uSpeed: t, uCount: s }),
    [e, o, t, s],
  );
  return <ShaderCanvas frag={FRAGMENT_SHADER} uniforms={R} />;
}
