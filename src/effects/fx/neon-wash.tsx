/**
 * Neon Wash — A neon tube igniting like a real one: sputtering flashes, the wash filling the wall top to bottom, then locking on.
 *
 * Self-contained animated background: needs only React.
 * Extracted from getdesign.md/backgrounds.
 */
// @ts-nocheck — the public props are typed, the internals are vendored as-is.
import * as React from "react";
import { FX_BACKGROUND, FX_COLOR, ShaderCanvas } from "../engine";

export interface NeonWashProps {
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
float noise1(float x) {
  float i = floor(x);
  float f = fract(x);
  float u = f * f * (3.0 - 2.0 * f);
  return mix(hash(vec2(i, 3.7)), hash(vec2(i + 1.0, 3.7)), u);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  float s = uTime * uSpeed;
  float dy = 1.0 - uv.y; // distance below the top edge
  float xc = (uv.x - 0.5) * (uRes.x / uRes.y);

  // One-shot ignition: strike → sputter → lock on → stay lit for good.
  float T = 4.0;
  float ph = min(s / T, 1.0);
  float ig = smoothstep(0.0, 0.55, ph);       // ignition progress
  float lockOn = smoothstep(0.55, 0.72, ph);  // tube locks on here

  // Sputter: erratic flashes that win through more often as the gas
  // warms — the classic fluorescent stutter.
  float n1 = noise1(s * 16.0);
  float n2 = noise1(s * 47.0 + 9.0);
  float gate = smoothstep(0.92 - ig * 0.92, 1.0 - ig * 0.92, n1 * 0.7 + n2 * 0.3);
  float lit = mix(gate * (0.25 + 0.75 * ig), 1.0, lockOn);
  // Shallow gas flicker once lit — the tube never dims again.
  lit *= 0.97 + 0.03 * noise1(s * 8.0 + uv.x * 2.0);

  // The reach of the wash grows downward while the tube sputters.
  float reach = 0.3 + 0.7 * smoothstep(0.05, 0.6, ph);
  float mask = smoothstep(reach + 0.1, reach - 0.35, dy);

  // Glow skirt with a hard shoulder: strong pink to mid-frame, then it
  // surrenders to true black and stays there.
  float fall = (exp(-dy * 2.2) + 0.25 * exp(-dy * 1.0)) * smoothstep(0.72, 0.38, dy);
  float side = max(1.0 - 0.5 * pow(abs(xc) * 1.15, 2.0), 0.0);
  float i = lit * fall * side * mask;

  // White-hot core line where the tube meets the frame.
  float core = exp(-dy * 90.0) * lit;

  vec3 col = uC0 * i * 0.85 + vec3(1.0) * (pow(i, 3.0) * 0.22 + core * 0.5);
  col = 1.0 - exp(-col * 1.8);

  // Crackle: grain bites harder during the strike, settles when lit.
  float gr = hash(gl_FragCoord.xy + floor(uTime * 5.0) * vec2(13.7, 7.3));
  col *= 0.93 + (0.14 + 0.14 * (1.0 - lockOn)) * gr;
  col += (gr - 0.5) * 0.025;

  gl_FragColor = vec4(uBg + col, 1.0);
}
`;

export function NeonWash({ color: e = FX_COLOR, background: o = FX_BACKGROUND, speed: t = 1 }: NeonWashProps) {
  const s = React.useMemo(() => ({ uC0: e, uBg: o, uSpeed: t }), [e, o, t]);
  return <ShaderCanvas frag={FRAGMENT_SHADER} uniforms={s} />;
}
