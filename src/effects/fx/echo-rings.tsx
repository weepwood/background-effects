/**
 * Echo Rings — Soft color loops arcing up from below the frame, hue drifting from core to rim as the bands ripple outward.
 *
 * Self-contained animated background: needs only React.
 * Extracted from getdesign.md/backgrounds.
 */
// @ts-nocheck — the public props are typed, the internals are vendored as-is.
import * as React from "react";
import { FX_BACKGROUND, ShaderCanvas } from "../engine";

export interface EchoRingsProps {
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

void main() {
  vec2 uv = gl_FragCoord.xy / uRes - 0.5;
  uv.x *= uRes.x / uRes.y;
  float s = uTime * uSpeed;

  // Ring center floats below the bottom edge and drifts slowly.
  vec2 c = vec2(0.06 * sin(s * 0.18), -0.9 + 0.05 * sin(s * 0.11));
  float r = length(uv - c);

  // Wide soft rings drifting outward. Each channel is phased a hair
  // apart, so crest edges shift hue instead of cutting hard.
  float ph = r * 24.0 - s * 0.9;
  vec3 ripple = vec3(
    0.5 + 0.5 * sin(ph + 0.28),
    0.5 + 0.5 * sin(ph),
    0.5 + 0.5 * sin(ph - 0.28)
  );
  // Shape the wave so valleys sink to the canvas while crests stay wide
  // and soft.
  ripple = smoothstep(vec3(0.32), vec3(0.97), ripple);

  // Hue travels with radius: core color low, rim color far out.
  float rn = clamp((r - 0.35) / 1.15, 0.0, 1.0);
  vec3 hue = mix(uC0, uC1, smoothstep(0.0, 0.55, rn));
  hue = mix(hue, uC2, smoothstep(0.45, 1.0, rn));

  vec3 col = hue * ripple * 0.65;
  col += uC0 * exp(-r * 2.0) * 0.4; // luminous core low in the frame
  col = 1.0 - exp(-col * 1.7);

  // A whisper of grain so large soft gradients don't band.
  float gr = hash(gl_FragCoord.xy + floor(uTime * 5.0) * vec2(13.7, 7.3));
  col *= 0.96 + 0.08 * gr;
  col += (gr - 0.5) * 0.015;

  gl_FragColor = vec4(uBg + col, 1.0);
}
`;

export function EchoRings({
  colors: e = ["#4130d6", "#8d2fd0", "#d62a55"],
  background: o = FX_BACKGROUND,
  speed: t = 1,
}: EchoRingsProps) {
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
