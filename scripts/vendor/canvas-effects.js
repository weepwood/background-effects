import * as R from "react";
import * as w from "react/jsx-runtime";
import { C as T, A as j, S as P, c as A, h as _, F } from "./runtime.js";
const O = `
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
  uv.y = 1.0 - uv.y;
  float s = uTime * uSpeed;

  // Origin floats just above the top edge; x is aspect-corrected so the
  // cone keeps its shape on wide hero bands.
  vec2 d = uv - vec2(0.5, -0.08);
  d.x *= (uRes.x / uRes.y) * 0.72;
  float dist = length(d);
  float ang = atan(d.x, d.y);

  // Cone envelope: full light near the axis, fading out by ~50 degrees.
  float cone = smoothstep(0.9, 0.15, abs(ang));

  // Organic beams: an fbm field sampled over angle, drifting slowly.
  float beams = pow(0.35 + 0.65 * fbm(vec2(ang * 5.5 + 7.0, s * 0.12)), 2.2);
  float fine = 0.5 + 0.5 * sin(ang * 36.0 + fbm(vec2(ang * 3.0, s * 0.2)) * 5.0);
  beams *= 0.75 + 0.25 * fine;

  float fall = exp(-dist * 1.9);
  float core = exp(-dist * 5.0) * 0.6;

  float i = cone * (beams * fall + core + 0.05 * fall);
  i *= 0.92 + 0.08 * sin(s * 0.6);

  vec3 col = uC0 * i * 1.25 + vec3(1.0) * pow(i, 3.0) * 0.3;
  col = 1.0 - exp(-col * 1.7);

  float gr = hash(gl_FragCoord.xy + floor(uTime * 5.0) * vec2(13.7, 7.3));
  col *= 0.93 + 0.14 * gr;
  col += (gr - 0.5) * 0.025;

  gl_FragColor = vec4(uBg + col, 1.0);
}
`;
function D({ color: t = j, background: r = T, speed: f = 1 }) {
  const m = R.useMemo(() => ({ uC0: t, uBg: r, uSpeed: f }), [t, r, f]);
  return w.jsx(P, { frag: O, uniforms: m });
}
function W({
  colors: t = ["#767676", "#f2f4f8", "#a6abb4"],
  background: r = T,
  speed: f = 1,
}) {
  const m = t.join("|"),
    d = R.useMemo(() => {
      let v = "",
        e = [],
        n = null;
      return (o, b, g, l) => {
        if (!v) {
          ((v = A(o.canvas, r)), (e = t.map((M) => A(o.canvas, M))));
          const h = document.createElement("canvas");
          ((h.width = 128), (h.height = 128));
          const S = h.getContext("2d");
          if (S) {
            const M = S.createImageData(128, 128);
            for (let p = 0; p < M.data.length; p += 4)
              ((M.data[p] = 255),
                (M.data[p + 1] = 255),
                (M.data[p + 2] = 255),
                (M.data[p + 3] =
                  _(p % 512, p / 512) < 0.6 ? 0 : _(p / 4, p % 128) * 90));
            (S.putImageData(M, 0, 0), (n = o.createPattern(h, "repeat")));
          }
        }
        const s = l * f;
        ((o.globalCompositeOperation = "source-over"),
          (o.fillStyle = v),
          o.fillRect(0, 0, b, g));
        const i = e[0],
          u = e[1] ?? e[0],
          y = e[2] ?? e[1] ?? e[0],
          a = o.createLinearGradient(0, 0, b, 0);
        (a.addColorStop(0, i),
          a.addColorStop(0.3, u),
          a.addColorStop(0.5, y),
          a.addColorStop(0.7, u),
          a.addColorStop(1, i),
          (o.globalCompositeOperation = "lighter"),
          (o.strokeStyle = a));
        const c = 72,
          C = g / 2;
        for (let h = 0; h < c; h++) {
          const S = h / (c - 1) - 0.5,
            M = _(h, 7) * 6.283;
          o.beginPath();
          for (let p = 0; p <= b; p += 5) {
            const B = p / b,
              L = Math.sin(B * 6.8 - s * 0.55 + 1.2),
              G = C + S * L * g * 0.42 + Math.sin(p * 0.02 - s * 1.1 + M) * 3;
            p === 0 ? o.moveTo(p, G) : o.lineTo(p, G);
          }
          ((o.lineWidth = 8),
            (o.globalAlpha = 0.02),
            o.stroke(),
            (o.lineWidth = 1.4),
            (o.globalAlpha = 0.075),
            o.stroke());
        }
        if (n) {
          const h = Math.floor(l * 5);
          ((o.globalCompositeOperation = "overlay"),
            (o.globalAlpha = 0.55),
            o.save(),
            o.translate(((h * 53) % 128) - 64, ((h * 97) % 128) - 64),
            (o.fillStyle = n),
            o.fillRect(-128, -128, b + 256, g + 256),
            o.restore());
        }
        ((o.globalCompositeOperation = "source-over"), (o.globalAlpha = 1));
      };
    }, [m, r, f]);
  return w.jsx(F, { draw: d });
}
const k = `
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

void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  uv.y = 1.0 - uv.y;
  float s = uTime * uSpeed;

  // Streak noise stretched along x, drifting rightward.
  float n1 = fbm(vec2(uv.x * 1.8 - s * 0.10, uv.y * 5.0));
  float n2 = fbm(vec2(uv.x * 3.1 - s * 0.16 + 17.0, uv.y * 7.0 + 3.0));

  // Fold coordinate: ~2.6 soft sheets stacked over the full height, waved
  // along x by two travelling waves. All motion is horizontal translation.
  float v = uv.y * 2.6
          + 0.35 * sin(uv.x * 3.6 - s * 0.40 + n1 * 2.6)
          + 0.22 * sin(uv.x * 6.8 - s * 0.25 + n2 * 3.0)
          + (n1 - 0.5) * 0.9;

  float fold = 0.5 + 0.5 * sin(v * 6.2831);
  float body = pow(fold, 1.8);
  float sheen = pow(fold, 7.0);

  // Palette blends left to right, warped so the seams wander.
  float m = clamp(uv.x + (n2 - 0.5) * 0.4, 0.0, 1.0);
  vec3 base = mix(uC0, uC1, smoothstep(0.15, 0.60, m));
  base = mix(base, uC2, smoothstep(0.60, 1.0, m) * 0.85);

  vec3 col = base * body * (0.45 + 0.55 * n1);
  col += (base * 0.4 + vec3(0.6)) * sheen * 0.5;

  // Vertical vignette: the field fades into the canvas at top and bottom.
  col *= smoothstep(0.0, 0.18, uv.y) * smoothstep(1.0, 0.82, uv.y);
  col = 1.0 - exp(-col * 1.8);

  float gr = hash(gl_FragCoord.xy + floor(uTime * 5.0) * vec2(13.7, 7.3));
  col *= 0.92 + 0.16 * gr;
  col += (gr - 0.5) * 0.03;

  gl_FragColor = vec4(uBg + col, 1.0);
}
`;
function z({
  colors: t = ["#767676", "#f2f4f8", "#a6abb4"],
  background: r = T,
  speed: f = 1,
}) {
  const m = R.useMemo(
    () => ({
      uC0: t[0],
      uC1: t[1] ?? t[0],
      uC2: t[2] ?? t[1] ?? t[0],
      uBg: r,
      uSpeed: f,
    }),
    [t.join("|"), r, f],
  );
  return w.jsx(P, { frag: k, uniforms: m });
}
function H({
  color: t = j,
  background: r = T,
  speed: f = 1,
  characters: m = " .:-+*=%@#",
}) {
  const d = R.useMemo(() => {
    let v = "",
      e = "",
      n = "";
    return (o, b, g, l) => {
      v ||
        ((v = A(o.canvas, t)),
        (e = A(o.canvas, r)),
        (n = `12px ${getComputedStyle(o.canvas).getPropertyValue("--font-mono").trim() || "monospace"}`));
      const s = l * f;
      ((o.fillStyle = e),
        o.fillRect(0, 0, b, g),
        (o.fillStyle = v),
        (o.font = n),
        (o.textAlign = "center"),
        (o.textBaseline = "middle"));
      const i = 14;
      for (let u = i / 2; u < g; u += i)
        for (let y = i / 2; y < b; y += i) {
          const a =
              0.5 +
              0.5 *
                Math.sin(
                  y * 0.03 + s * 1.1 + Math.sin(u * 0.045 + s * 0.6) * 2,
                ),
            c = 0.5 + 0.5 * Math.sin((y + u) * 0.012 - s * 0.8),
            C = a * 0.65 + c * 0.35,
            h = Math.min(m.length - 1, Math.floor(C * m.length)),
            S = m[h];
          S !== " " && ((o.globalAlpha = 0.2 + 0.8 * C), o.fillText(S, y, u));
        }
      o.globalAlpha = 1;
    };
  }, [t, r, f, m]);
  return w.jsx(F, { draw: d });
}
function K({
  color: t = j,
  background: r = T,
  speed: f = 1,
  anchor: m = "left",
}) {
  const d = R.useMemo(() => {
    let v = "",
      e = "";
    return (n, o, b, g) => {
      v || ((v = A(n.canvas, t)), (e = A(n.canvas, r)));
      const l = g * f;
      ((n.fillStyle = e), n.fillRect(0, 0, o, b), (n.fillStyle = v));
      const s = 18,
        i = 9,
        u = Math.ceil(o / s),
        y = Math.ceil(b / s);
      for (let a = 0; a < y; a++)
        for (let c = 0; c < u; c++) {
          const C = _(c, a),
            h = c * s + s / 2,
            S = m === "left" ? 1 - h / o : h / o;
          if (C > S * 0.92) continue;
          const M = 1.6 + _(a, c) * 3,
            p = 0.5 + 0.5 * Math.sin((l * 6.283) / M + C * 6.283),
            B = Math.pow(p, 3);
          ((n.globalAlpha = 0.08 + 0.92 * B * (0.35 + 0.65 * S)),
            n.fillRect(h - i / 2, a * s + (s - i) / 2, i, i));
        }
      n.globalAlpha = 1;
    };
  }, [t, r, f, m]);
  return w.jsx(F, { draw: d });
}
function N({ color: t = j, background: r = T, speed: f = 1 }) {
  const m = R.useMemo(() => {
    let d = "",
      v = "";
    return (e, n, o, b) => {
      d || ((d = A(e.canvas, t)), (v = A(e.canvas, r)));
      const g = b * f;
      ((e.fillStyle = v), e.fillRect(0, 0, n, o), (e.fillStyle = d));
      const l = 13;
      for (let s = l / 2; s < o + l; s += l)
        for (let i = l / 2; i < n + l; i += l) {
          const u = 0.5 + 0.5 * Math.sin((i + s * 1.4) * 0.018 - g * 1.1),
            y =
              0.5 +
              0.5 *
                Math.sin(
                  i * 0.03 - g * 0.55 + Math.sin(s * 0.02 + g * 0.4) * 1.5,
                ),
            a = u * 0.55 + y * 0.45,
            c = 5.4 * Math.pow(a, 1.35);
          c < 0.4 ||
            ((e.globalAlpha = 0.3 + 0.7 * a),
            e.beginPath(),
            e.arc(i, s, c, 0, 6.283),
            e.fill());
        }
      e.globalAlpha = 1;
    };
  }, [t, r, f]);
  return w.jsx(F, { draw: m });
}
const E = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];
function Y({ color: t = j, background: r = T, speed: f = 1 }) {
  const m = R.useMemo(() => {
    let d = "",
      v = "";
    return (e, n, o, b) => {
      d || ((d = A(e.canvas, t)), (v = A(e.canvas, r)));
      const g = b * f;
      ((e.fillStyle = v),
        e.fillRect(0, 0, n, o),
        (e.fillStyle = d),
        (e.globalAlpha = 0.55));
      const l = 7,
        s = Math.ceil(n / l),
        i = Math.ceil(o / l);
      for (let u = 0; u < i; u++) {
        const y = E[u % 4];
        for (let a = 0; a < s; a++) {
          const c = a * l,
            C = u * l,
            h =
              0.5 +
              0.5 *
                Math.sin(
                  C * 0.02 - g * 0.9 + Math.sin(c * 0.008 + g * 0.35) * 2.2,
                ),
            S = 0.5 + 0.5 * Math.sin((c - C) * 0.01 + g * 0.5);
          h * 0.7 + S * 0.3 > (y[a % 4] + 0.5) / 16 &&
            e.fillRect(c, C, l - 1, l - 1);
        }
      }
      e.globalAlpha = 1;
    };
  }, [t, r, f]);
  return w.jsx(F, { draw: m });
}
function $({ color: t = j, background: r = T, speed: f = 1 }) {
  const m = R.useMemo(() => {
    let d = "",
      v = "";
    return (e, n, o, b) => {
      d || ((d = A(e.canvas, t)), (v = A(e.canvas, r)));
      const g = b * f;
      ((e.fillStyle = v), e.fillRect(0, 0, n, o));
      const l = o * 0.42,
        s = n / 2;
      ((e.strokeStyle = d), (e.lineWidth = 1));
      const i = e.createLinearGradient(0, l - 42, 0, l);
      (i.addColorStop(0, "transparent"),
        i.addColorStop(1, d),
        e.save(),
        (e.globalAlpha = 0.22),
        (e.fillStyle = i),
        e.fillRect(0, l - 42, n, 42),
        e.restore(),
        (e.globalAlpha = 0.85),
        e.beginPath(),
        e.moveTo(0, l),
        e.lineTo(n, l),
        e.stroke());
      for (let a = -11; a <= 11; a++)
        ((e.globalAlpha = 0.12 + 0.3 * (1 - Math.abs(a) / 12)),
          e.beginPath(),
          e.moveTo(s, l),
          e.lineTo(s + a * n * 0.11, o + 10),
          e.stroke());
      const u = 13,
        y = (g * 0.55) % 1;
      for (let a = 1; a <= u; a++) {
        const c = (a - 1 + y) / u,
          C = l + (o - l) * Math.pow(c, 2.4);
        ((e.globalAlpha = 0.1 + 0.75 * c),
          e.beginPath(),
          e.moveTo(0, C),
          e.lineTo(n, C),
          e.stroke());
      }
      e.globalAlpha = 1;
    };
  }, [t, r, f]);
  return w.jsx(F, { draw: m });
}
export { Y as D, H as G, $ as H, N as I, W as L, z as S, D as V, K as a };
