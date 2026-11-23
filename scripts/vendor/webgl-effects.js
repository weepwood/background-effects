import * as S from "react";
import * as _ from "react/jsx-runtime";
import { C as A, A as W, S as j, c as N, F as V, h as Q } from "./runtime.js";
const me = `
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
function He({ color: e = W, background: o = A, speed: t = 1, count: s = 16 }) {
  const R = S.useMemo(
    () => ({ uC0: e, uBg: o, uSpeed: t, uCount: s }),
    [e, o, t, s],
  );
  return _.jsx(j, { frag: me, uniforms: R });
}
const ve = `
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
function Ue({
  colors: e = ["#4130d6", "#8d2fd0", "#d62a55"],
  background: o = A,
  speed: t = 1,
}) {
  const s = S.useMemo(
    () => ({
      uC0: e[0],
      uC1: e[1] ?? e[0],
      uC2: e[2] ?? e[1] ?? e[0],
      uBg: o,
      uSpeed: t,
    }),
    [e, o, t],
  );
  return _.jsx(j, { frag: ve, uniforms: s });
}
const fe = Math.PI * 2;
function ee(e) {
  const o = Math.sin(e * 127.1) * 43758.5453;
  return o - Math.floor(o);
}
function Ve({ color: e = W, background: o = A, speed: t = 1, count: s = 260 }) {
  const R = S.useMemo(() => {
    let F = "",
      b = "";
    return (a, n, i, C) => {
      (F || ((F = N(a.canvas, e)), (b = N(a.canvas, o))),
        (a.fillStyle = b),
        a.fillRect(0, 0, n, i),
        (a.strokeStyle = F),
        (a.lineCap = "round"));
      const d = n / 2,
        T = i / 2,
        x = Math.hypot(n, i) * 0.56,
        w = C * t;
      for (let l = 0; l < s; l++) {
        const f = ee(l * 1.37 + 0.11) * fe,
          h = 0.045 + 0.11 * ee(l * 2.71 + 5.3),
          p = ee(l * 3.93 + 9.7),
          u = (p + w * h) % 1,
          B = u * u,
          c = B * x,
          g = Math.cos(f),
          r = Math.sin(f),
          M = 1 + B * B * x * 0.12,
          y = d + g * c,
          m = T + r * c,
          v = 0.55 + 0.45 * Math.sin(w * (2 + 4 * ee(l * 4.7 + 2.9)) + p * fe);
        ((a.globalAlpha = (0.1 + 0.9 * B) * v),
          (a.lineWidth = 0.6 + 1.1 * B),
          a.beginPath(),
          a.moveTo(y - g * M, m - r * M),
          a.lineTo(y, m),
          a.stroke());
      }
      a.globalAlpha = 1;
    };
  }, [e, o, t, s]);
  return _.jsx(V, { draw: R });
}
function te(e) {
  const o = Math.sin(e * 127.1) * 43758.5453;
  return o - Math.floor(o);
}
function de(e) {
  let o = e.replace("#", "").trim();
  o.length === 3 &&
    (o = o
      .split("")
      .map((s) => s + s)
      .join(""));
  const t = parseInt(o, 16);
  return Number.isNaN(t)
    ? [255, 255, 255]
    : [(t >> 16) & 255, (t >> 8) & 255, t & 255];
}
function ze({
  colors: e = ["#5b4bd8", "#9b3fd4", "#e04fae"],
  background: o = A,
  speed: t = 1,
  count: s = 36,
}) {
  const R = e.join("|"),
    F = S.useMemo(() => {
      let b = "",
        a = [];
      const n = (i) => {
        const C = a[0],
          d = a[1] ?? C,
          T = a[2] ?? d,
          [x, w, l] = i < 0.5 ? [C, d, i * 2] : [d, T, i * 2 - 1];
        return [
          x[0] + (w[0] - x[0]) * l,
          x[1] + (w[1] - x[1]) * l,
          x[2] + (w[2] - x[2]) * l,
        ];
      };
      return (i, C, d, T) => {
        b || ((b = N(i.canvas, o)), (a = e.map((u) => de(N(i.canvas, u)))));
        const x = T * t;
        ((i.globalCompositeOperation = "source-over"),
          (i.fillStyle = b),
          i.fillRect(0, 0, C, d),
          (i.globalCompositeOperation = "lighter"),
          (i.lineCap = "round"),
          (i.lineJoin = "round"));
        const w = C / 2,
          l = 9,
          f = Math.max(1, Math.round(s / l)),
          h = d * 0.02,
          p = d * 0.68 - h;
        for (let u = 0; u < l * f; u++) {
          const B = u % l,
            c = (u / l) | 0,
            g = B / (l - 1) - 0.5,
            r = Math.abs(g) * 2,
            M = te(u * 2.71 + 5.3),
            y = w + g * C * 0.3 + (M - 0.5) * C * 0.012,
            m = d * (0.68 - 0.25 * Math.pow(r, 1.3)),
            v = Math.max(0, d * 0.88 - m),
            O = g * 2 * C * 0.72,
            I = c / f + (te(u * 7.9 + 8.3) - 0.5) * 0.03,
            P = 0.7 + 0.3 * te(u * 9.1 + 4.9),
            q = 0.62 * ((m - h) / p),
            G = ((I + x * 0.1) % 1) * 1.2,
            $ = Math.max(0, Math.min(1, Math.min(G / 0.06, (1.18 - G) / 0.16)));
          if ($ <= 0) continue;
          const L = (E) => {
              if (E <= q) {
                const oe = E / q;
                return [y, h + (m - h) * Math.pow(oe, 1.35)];
              }
              const z = Math.min((E - q) / (1 - q), 1);
              return [
                y + O * Math.pow(z, 2.1),
                m + v * (1 - Math.pow(1 - z, 2)),
              ];
            },
            H = 0.28 + 0.04 * M,
            U = 20,
            k = [];
          for (let E = 0; E <= U; E++) {
            const z = G - H * (1 - E / U);
            z < 0 || k.push(L(z));
          }
          if (k.length < 2) continue;
          const X = k[0],
            J = k[k.length - 1],
            se = i.createLinearGradient(X[0], X[1], J[0], J[1]);
          for (const E of [0, 0.5, 1]) {
            const z = k[Math.round(E * (k.length - 1))],
              [oe, he, pe] = n(Math.min(1, z[1] / d));
            se.addColorStop(
              E,
              `rgba(${Math.round(oe)},${Math.round(he)},${Math.round(pe)},${(E * E).toFixed(3)})`,
            );
          }
          (i.beginPath(), i.moveTo(X[0], X[1]));
          for (let E = 1; E < k.length; E++) i.lineTo(k[E][0], k[E][1]);
          ((i.strokeStyle = se),
            (i.lineWidth = 7),
            (i.globalAlpha = 0.14 * P * $),
            i.stroke(),
            (i.lineWidth = 1.9),
            (i.globalAlpha = 0.9 * P * $),
            i.stroke());
          const ne = k[k.length - 2],
            [ie, re, le] = n(Math.min(1, J[1] / d));
          (i.beginPath(),
            i.moveTo(ne[0], ne[1]),
            i.lineTo(J[0], J[1]),
            (i.strokeStyle = `rgb(${Math.round(ie + (255 - ie) * 0.6)},${Math.round(re + (255 - re) * 0.6)},${Math.round(le + (255 - le) * 0.6)})`),
            (i.lineWidth = 2.4),
            (i.globalAlpha = 0.9 * P * $),
            i.stroke());
        }
        ((i.globalCompositeOperation = "source-over"), (i.globalAlpha = 1));
      };
    }, [R, o, t, s]);
  return _.jsx(V, { draw: F });
}
const ge = `
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
function Ke({ color: e = W, background: o = A, speed: t = 1 }) {
  const s = S.useMemo(() => ({ uC0: e, uBg: o, uSpeed: t }), [e, o, t]);
  return _.jsx(j, { frag: ge, uniforms: s });
}
function be(e) {
  const o = Math.sin(e * 127.1) * 43758.5453;
  return o - Math.floor(o);
}
function ye(e) {
  let o = e.replace("#", "").trim();
  o.length === 3 &&
    (o = o
      .split("")
      .map((s) => s + s)
      .join(""));
  const t = parseInt(o, 16);
  return Number.isNaN(t)
    ? [255, 255, 255]
    : [(t >> 16) & 255, (t >> 8) & 255, t & 255];
}
function Xe({ color: e = W, background: o = A, speed: t = 1, count: s = 16 }) {
  const R = S.useMemo(() => {
    let F = "",
      b = null;
    return (a, n, i, C) => {
      b || ((F = N(a.canvas, o)), (b = ye(N(a.canvas, e))));
      const d = C * t;
      ((a.fillStyle = F), a.fillRect(0, 0, n, i));
      const [T, x, w] = b,
        l = (h) => `rgba(${T},${x},${w},${h.toFixed(3)})`,
        f = n / s;
      for (let h = 0; h < s; h++) {
        const p = s === 1 ? 0.5 : h / (s - 1),
          B =
            0.32 +
            0.42 * (1 - Math.abs(p - 0.5) * 2) +
            0.1 * Math.sin(d * 0.9 + h * 0.55) +
            0.03 * Math.sin(d * 0.37 + h * 1.7),
          c = Math.min(0.94, Math.max(0.06, B)),
          g = 0.35 + 0.65 * be(h * 3.13 + 1.7),
          r = a.createLinearGradient(0, 0, 0, i);
        (r.addColorStop(0, l(0)),
          r.addColorStop(Math.max(0, c - 0.45), l(0.1 * g)),
          r.addColorStop(c, l(g)),
          r.addColorStop(Math.min(1, c + 0.06), l(0.22 * g)),
          r.addColorStop(1, l(0.04 * g)),
          (a.fillStyle = r),
          a.fillRect(h * f, 0, f + 1, i));
      }
    };
  }, [e, o, t, s]);
  return _.jsx(V, { draw: R });
}
function ae(e, o) {
  const t = Math.floor(e),
    s = Math.floor(o),
    R = e - t,
    F = o - s,
    b = R * R * (3 - 2 * R),
    a = F * F * (3 - 2 * F),
    n = Q(t, s),
    i = Q(t + 1, s),
    C = Q(t, s + 1),
    d = Q(t + 1, s + 1);
  return n + (i - n) * b + (C - n) * a + (n - i - C + d) * b * a;
}
function Ye({
  color: e = W,
  background: o = A,
  speed: t = 1,
  density: s = 40,
}) {
  const R = S.useMemo(() => {
    let F = "",
      b = "";
    return (a, n, i, C) => {
      F || ((F = N(a.canvas, e)), (b = N(a.canvas, o)));
      const d = C * t;
      ((a.fillStyle = b), a.fillRect(0, 0, n, i), (a.fillStyle = F));
      const T = Math.min(40, Math.max(8, n / s)),
        x = 3;
      for (let w = T / 2; w < i + T; w += T)
        for (let l = T / 2; l < n + T; l += T) {
          const f = (l / i) * x,
            h = (w / i) * x;
          let p =
            0.55 * ae(f + d * 0.55, h + d * 0.12) +
            0.3 * ae(f * 2.1 + 40 - d * 0.3, h * 2.1 + d * 0.2) +
            0.15 * ae(f * 4.2 + 90 + d * 0.5, h * 4.2 - d * 0.35);
          ((p = Math.min(1, Math.max(0, (p - 0.45) / 0.35))),
            (p = p * p * (3 - 2 * p)));
          const u = T * 0.34 * Math.pow(p, 1.3);
          u < 0.3 ||
            ((a.globalAlpha = 0.08 * p),
            a.beginPath(),
            a.arc(l, w, u * 2.2, 0, 6.283),
            a.fill(),
            (a.globalAlpha = 0.12 + 0.5 * p),
            a.beginPath(),
            a.arc(l, w, u, 0, 6.283),
            a.fill());
        }
      a.globalAlpha = 1;
    };
  }, [e, o, t, s]);
  return _.jsx(V, { draw: R });
}
const Ce = Math.PI * 2;
function Z(e) {
  const o = Math.sin(e * 127.1) * 43758.5453;
  return o - Math.floor(o);
}
function xe(e) {
  let o = e.replace("#", "").trim();
  o.length === 3 &&
    (o = o
      .split("")
      .map((s) => s + s)
      .join(""));
  const t = parseInt(o, 16);
  return Number.isNaN(t)
    ? [255, 255, 255]
    : [(t >> 16) & 255, (t >> 8) & 255, t & 255];
}
function Je({
  colors: e = ["#8f7bff", "#f2f4f8", "#b48cf2"],
  background: o = A,
  speed: t = 1,
  count: s = 90,
}) {
  const R = e.join("|"),
    F = S.useMemo(() => {
      let b = "",
        a = [];
      return (n, i, C, d) => {
        b || ((b = N(n.canvas, o)), (a = e.map((f) => xe(N(n.canvas, f)))));
        const T = d * t;
        ((n.globalCompositeOperation = "source-over"),
          (n.fillStyle = b),
          n.fillRect(0, 0, i, C),
          (n.globalCompositeOperation = "lighter"),
          (n.lineCap = "round"));
        const x = i / 2,
          w = C / 2,
          l = Math.hypot(i, C) * 0.58;
        for (let f = 0; f < s; f++) {
          const h = Z(f * 1.37 + 0.11) * Ce,
            p = 0.16 + 0.22 * Z(f * 2.71 + 5.3),
            u = Z(f * 3.93 + 9.7),
            B = a[Math.floor(Z(f * 5.21 + 3.3) * a.length) % a.length],
            c = (u + T * p) % 1,
            g = Math.pow(c, 1.7),
            r = g * l,
            M = Math.min(1, Math.max(0, (g - 0.05) / 0.1));
          if (M <= 0) continue;
          const y = Math.cos(h),
            m = Math.sin(h),
            v = 6 + g * g * l * 0.5,
            O = x + y * r,
            I = w + m * r,
            P = x + y * Math.max(0, r - v),
            q = w + m * Math.max(0, r - v),
            G = (0.65 + 0.35 * Z(f * 9.1 + 4.9)) * M,
            [$, L, H] = B,
            U = n.createLinearGradient(P, q, O, I);
          (U.addColorStop(0, `rgba(${$},${L},${H},0)`),
            U.addColorStop(0.7, `rgba(${$},${L},${H},0.55)`),
            U.addColorStop(1, `rgba(${$},${L},${H},1)`),
            n.beginPath(),
            n.moveTo(P, q),
            n.lineTo(O, I),
            (n.strokeStyle = U),
            (n.lineWidth = (0.8 + 2.2 * g) * 3),
            (n.globalAlpha = 0.12 * G),
            n.stroke(),
            (n.lineWidth = 0.8 + 2.2 * g),
            (n.globalAlpha = 0.85 * G),
            n.stroke());
          const k = O - y * Math.min(v, 10 + 26 * g),
            X = I - m * Math.min(v, 10 + 26 * g);
          (n.beginPath(),
            n.moveTo(k, X),
            n.lineTo(O, I),
            (n.strokeStyle = `rgb(${Math.round($ + (255 - $) * 0.7)},${Math.round(L + (255 - L) * 0.7)},${Math.round(H + (255 - H) * 0.7)})`),
            (n.lineWidth = 1 + 1.6 * g),
            (n.globalAlpha = 0.9 * G),
            n.stroke());
        }
        ((n.globalCompositeOperation = "source-over"), (n.globalAlpha = 1));
      };
    }, [R, o, t, s]);
  return _.jsx(V, { draw: F });
}
const we = `
precision mediump float;
uniform vec2 uRes;
uniform float uTime;
uniform float uSpeed;
uniform float uPanes;
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
  float s = uTime * uSpeed;

  float id = floor(uv.x * uPanes);
  float lx = fract(uv.x * uPanes);
  float ph = hash(vec2(id, 7.0)) * 6.283;

  // Pane-local field, rising slowly; the id offset decorrelates panes.
  // Frequencies stay low — the liquid reads as a few large blobs per
  // pane, not turbulence.
  vec2 p = vec2(lx * 0.5 + id * 3.7, uv.y * 0.6);
  vec2 q = vec2(
    fbm(p * 0.8 + vec2(ph, -s * 0.22)),
    fbm(p * 0.8 + vec2(5.2 + ph * 1.3, -s * 0.18))
  );
  float v = fbm(p * 0.9 + 1.8 * q + vec2(0.0, -s * 0.25));

  // Sine-folding: soft noise creased into liquid-metal folds. The hard
  // exponent keeps most of the pane near-black so the creases read.
  float m = 0.5 + 0.5 * sin(v * 7.0 + s * 0.6 + ph);
  m = pow(m, 3.2);
  // A tight specular band riding the same field.
  float gloss = pow(0.5 + 0.5 * sin(v * 18.0 - s * 0.8), 8.0) * 0.35;

  float tone = clamp(m + gloss, 0.0, 1.0);
  vec3 col = mix(uC0, uC1, smoothstep(0.35, 0.75, tone));
  col = mix(col, uC2, smoothstep(0.7, 0.97, tone));
  col *= 0.05 + 0.95 * tone;

  // Thin dark seams between panes.
  float seam = smoothstep(0.0, 0.045, lx) * smoothstep(1.0, 0.955, lx);
  col *= 0.2 + 0.8 * seam;

  col = 1.0 - exp(-col * 1.7);

  float gr = hash(gl_FragCoord.xy + floor(uTime * 5.0) * vec2(13.7, 7.3));
  col *= 0.93 + 0.14 * gr;
  col += (gr - 0.5) * 0.025;

  gl_FragColor = vec4(uBg + col, 1.0);
}
`;
function Ze({
  colors: e = ["#4c1d95", "#a855f7", "#e879f9"],
  background: o = A,
  speed: t = 1,
  panes: s = 6,
}) {
  const R = S.useMemo(
    () => ({
      uC0: e[0],
      uC1: e[1] ?? e[0],
      uC2: e[2] ?? e[1] ?? e[0],
      uBg: o,
      uSpeed: t,
      uPanes: s,
    }),
    [e, o, t, s],
  );
  return _.jsx(j, { frag: we, uniforms: R });
}
const Me = `
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
  vec2 uv = gl_FragCoord.xy / uRes - 0.5;
  uv.x *= uRes.x / uRes.y;
  float s = uTime * uSpeed;

  // Rotate so the streaks run bottom-left to top-right.
  float ang = -0.7;
  mat2 R = mat2(cos(ang), -sin(ang), sin(ang), cos(ang));
  vec2 p = R * uv;
  float a = p.x; // along the streak
  float b = p.y; // across the streaks

  // Broad satin bands: heavily stretched fbm sliding along the axis.
  float broad = fbm(vec2(a * 0.6 - s * 0.28, b * 5.5));
  float bands = pow(smoothstep(0.42, 0.85, broad), 2.0);

  // Fine sparkle: thinner, faster lines on the same axis.
  float fine = fbm(vec2(a * 1.3 - s * 0.45, b * 13.0));
  float wires = pow(smoothstep(0.55, 0.9, fine), 3.0) * 0.8;

  float i = bands * 0.85 + wires;

  // Tint drifts across the streaks: silver, white, warm brass.
  float tsel = fbm(vec2(b * 2.2 + 9.0, a * 0.15 - s * 0.05));
  vec3 tint = mix(uC0, uC1, smoothstep(0.3, 0.6, tsel));
  tint = mix(tint, uC2, smoothstep(0.62, 0.85, tsel));

  vec3 col = tint * i + vec3(1.0) * pow(i, 3.0) * 0.25;
  col = 1.0 - exp(-col * 1.8);

  float gr = hash(gl_FragCoord.xy + floor(uTime * 5.0) * vec2(13.7, 7.3));
  col *= 0.93 + 0.14 * gr;
  col += (gr - 0.5) * 0.025;

  gl_FragColor = vec4(uBg + col, 1.0);
}
`;
function Qe({
  colors: e = ["#aeb6c4", "#f4f2ee", "#d9c1a0"],
  background: o = A,
  speed: t = 1,
}) {
  const s = S.useMemo(
    () => ({
      uC0: e[0],
      uC1: e[1] ?? e[0],
      uC2: e[2] ?? e[1] ?? e[0],
      uBg: o,
      uSpeed: t,
    }),
    [e, o, t],
  );
  return _.jsx(j, { frag: Me, uniforms: s });
}
const Re = `
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
function eo({ color: e = W, background: o = A, speed: t = 1 }) {
  const s = S.useMemo(() => ({ uC0: e, uBg: o, uSpeed: t }), [e, o, t]);
  return _.jsx(j, { frag: Re, uniforms: s });
}
const ue = Math.PI * 2;
function D(e) {
  const o = Math.sin(e * 127.1) * 43758.5453;
  return o - Math.floor(o);
}
function Se(e) {
  let o = e.replace("#", "").trim();
  o.length === 3 &&
    (o = o
      .split("")
      .map((s) => s + s)
      .join(""));
  const t = parseInt(o, 16);
  return Number.isNaN(t)
    ? [255, 255, 255]
    : [(t >> 16) & 255, (t >> 8) & 255, t & 255];
}
function oo({ color: e = W, background: o = A, speed: t = 1, count: s = 70 }) {
  const R = S.useMemo(() => {
    let F = "",
      b = null;
    return (a, n, i, C) => {
      b || ((F = N(a.canvas, o)), (b = Se(N(a.canvas, e))));
      const d = C * t,
        [T, x, w] = b,
        l = (c) => `rgba(${T},${x},${w},${c.toFixed(3)})`;
      ((a.globalCompositeOperation = "source-over"),
        (a.fillStyle = F),
        a.fillRect(0, 0, n, i),
        (a.globalCompositeOperation = "lighter"),
        (a.globalAlpha = 1));
      const f = 44;
      (a.save(), a.translate(n / 2, i), a.scale(1, f / (n * 0.5)));
      const h = a.createRadialGradient(0, 0, 0, 0, 0, n * 0.5);
      (h.addColorStop(0, l(0.55)),
        h.addColorStop(0.55, l(0.2)),
        h.addColorStop(1, l(0)),
        (a.fillStyle = h),
        a.fillRect(-n / 2, -n * 0.5, n, n * 0.5),
        a.restore());
      const p = `rgba(${Math.round(T + (255 - T) * 0.55)},${Math.round(x + (255 - x) * 0.55)},${Math.round(w + (255 - w) * 0.55)},0.85)`,
        u = a.createLinearGradient(0, 0, n, 0);
      (u.addColorStop(0, l(0)),
        u.addColorStop(0.16, l(0.18)),
        u.addColorStop(0.5, p),
        u.addColorStop(0.84, l(0.18)),
        u.addColorStop(1, l(0)),
        (a.fillStyle = u),
        a.fillRect(0, i - 2.5, n, 2.5));
      for (let c = 0; c < s; c++) {
        const g = D(c * 1.37 + 0.31) * n,
          r = 0.06 + 0.16 * D(c * 2.71 + 5.3),
          M = (D(c * 3.93 + 9.7) + d * r) % 1,
          y = Math.sin(Math.PI * M),
          m = Math.pow(D(c * 5.9 + 1.9), 2.5),
          v = i * (0.08 + 0.58 * m) * y;
        if (v < 3) continue;
        const O = 1 - Math.min(1, Math.abs(g - n / 2) / (n * 0.55)),
          I =
            (0.4 + 0.6 * D(c * 9.1 + 4.9)) *
            y *
            (0.45 + 0.55 * Math.pow(O, 1.2)),
          P = a.createLinearGradient(0, i, 0, i - v);
        (P.addColorStop(0, l(0.85 * I)),
          P.addColorStop(1, l(0)),
          (a.strokeStyle = P),
          a.beginPath(),
          a.moveTo(g, i),
          a.lineTo(g, i - v),
          (a.lineWidth = 3.5),
          (a.globalAlpha = 0.16),
          a.stroke(),
          (a.lineWidth = 1.1),
          (a.globalAlpha = 1),
          a.stroke());
      }
      const B = Math.round(s * 0.55);
      for (let c = 0; c < B; c++) {
        const g = 0.03 + 0.06 * D(c * 6.7 + 3.7),
          r = (D(c * 7.9 + 8.3) + d * g) % 1,
          M = D(c * 11.3 + 2.9) * n + Math.sin(d * 0.6 + c * 1.7) * 6,
          y = i * (0.98 - r * 0.85),
          m = Math.sin(Math.PI * r) * (0.35 + 0.65 * D(c * 12.7 + 6.1)),
          v = 1 + 2.2 * D(c * 13.9 + 0.7);
        ((a.fillStyle = l(0.12 * m)),
          a.beginPath(),
          a.arc(M, y, v * 3, 0, ue),
          a.fill(),
          (a.fillStyle = l(0.9 * m)),
          a.beginPath(),
          a.arc(M, y, v, 0, ue),
          a.fill());
      }
      ((a.globalCompositeOperation = "source-over"), (a.globalAlpha = 1));
    };
  }, [e, o, t, s]);
  return _.jsx(V, { draw: R });
}
const ce = Math.PI * 2;
function K(e) {
  const o = Math.sin(e * 127.1) * 43758.5453;
  return o - Math.floor(o);
}
function Te(e) {
  let o = e.replace("#", "").trim();
  o.length === 3 &&
    (o = o
      .split("")
      .map((s) => s + s)
      .join(""));
  const t = parseInt(o, 16);
  return Number.isNaN(t)
    ? [255, 255, 255]
    : [(t >> 16) & 255, (t >> 8) & 255, t & 255];
}
function to({
  colors: e = ["#8f7bff", "#5b6cff", "#c96af2"],
  background: o = A,
  speed: t = 1,
  count: s = 80,
}) {
  const R = e.join("|"),
    F = S.useMemo(() => {
      let b = "",
        a = [];
      return (n, i, C, d) => {
        b || ((b = N(n.canvas, o)), (a = e.map((f) => Te(N(n.canvas, f)))));
        const T = d * t;
        ((n.fillStyle = b), n.fillRect(0, 0, i, C), (n.lineCap = "round"));
        const x = i / 2,
          w = C / 2,
          l = Math.hypot(i, C) * 0.55;
        for (let f = 0; f < s; f++) {
          const h = (0.05 + 0.95 * Math.pow(K(f * 1.37 + 0.31), 0.85)) * l,
            p = 0.4 + 1.7 * K(f * 2.71 + 5.3),
            u = (0.02 + 26 / (60 + h)) * (0.6 + 0.8 * K(f * 3.9 + 7.7)),
            B = K(f * 5.9 + 1.9) * ce + T * u,
            [c, g, r] = a[Math.floor(K(f * 7.3 + 3.3) * a.length) % a.length],
            M = 0.45 + 0.55 * K(f * 9.1 + 4.9),
            y = p / ce,
            m = n.createConicGradient(B, x, w);
          (m.addColorStop(0, `rgba(${c},${g},${r},0)`),
            m.addColorStop(y, `rgba(${c},${g},${r},${M.toFixed(3)})`),
            m.addColorStop(Math.min(y + 0.002, 1), "rgba(0,0,0,0)"),
            m.addColorStop(1, "rgba(0,0,0,0)"),
            (n.strokeStyle = m),
            (n.lineWidth = 1.1 + 1.1 * K(f * 11.3 + 8.9)),
            n.beginPath(),
            n.arc(x, w, h, B, B + p),
            n.stroke());
        }
      };
    }, [R, o, t, s]);
  return _.jsx(V, { draw: F });
}
const Fe = `
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
  vec2 p = uv * 1.15;

  // Triple-nested warp: each layer drifts on its own clock, so the
  // folds shear and re-fold instead of scrolling past.
  vec2 q1 = vec2(
    fbm(p + vec2(0.0, s * 0.1)),
    fbm(p + vec2(5.2, 1.3) - vec2(s * 0.08, 0.0))
  );
  vec2 q2 = vec2(
    fbm(p + 2.2 * q1 + vec2(1.7, 9.2) + vec2(s * 0.12, 0.0)),
    fbm(p + 2.2 * q1 + vec2(8.3, 2.8) - vec2(0.0, s * 0.09))
  );
  float v = fbm(p + 2.4 * q2);

  // Glossy ridges: a sine fold cut into bands with deep black creases.
  float m = 0.5 + 0.5 * sin(v * 11.0 + s * 0.4);
  m = smoothstep(0.15, 0.9, m);
  m = pow(m, 1.6);

  // Satin sheen: a tight highlight riding the same field.
  float sheen = pow(0.5 + 0.5 * sin(v * 22.0 + 1.3), 12.0) * 0.5;

  vec3 col = uC0 * m * 0.9 + vec3(1.0) * (pow(m, 4.0) * 0.15 + sheen * m * 0.6);
  col = 1.0 - exp(-col * 1.9);

  float gr = hash(gl_FragCoord.xy + floor(uTime * 5.0) * vec2(13.7, 7.3));
  col *= 0.93 + 0.14 * gr;
  col += (gr - 0.5) * 0.025;

  gl_FragColor = vec4(uBg + col, 1.0);
}
`;
function ao({ color: e = W, background: o = A, speed: t = 1 }) {
  const s = S.useMemo(() => ({ uC0: e, uBg: o, uSpeed: t }), [e, o, t]);
  return _.jsx(j, { frag: Fe, uniforms: s });
}
const _e = `
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
function so({ color: e = W, background: o = A, speed: t = 1 }) {
  const s = S.useMemo(() => ({ uC0: e, uBg: o, uSpeed: t }), [e, o, t]);
  return _.jsx(j, { frag: _e, uniforms: s });
}
function Ae(e) {
  let o = e.replace("#", "").trim();
  o.length === 3 &&
    (o = o
      .split("")
      .map((s) => s + s)
      .join(""));
  const t = parseInt(o, 16);
  return Number.isNaN(t)
    ? [255, 255, 255]
    : [(t >> 16) & 255, (t >> 8) & 255, t & 255];
}
function no({
  color: e = W,
  background: o = A,
  speed: t = 1,
  density: s = 42,
}) {
  const R = S.useMemo(() => {
    let F = "",
      b = null;
    return (a, n, i, C) => {
      b || ((F = N(a.canvas, o)), (b = Ae(N(a.canvas, e))));
      const d = C * t,
        [T, x, w] = b;
      ((a.globalCompositeOperation = "source-over"),
        (a.fillStyle = F),
        a.fillRect(0, 0, n, i),
        (a.globalCompositeOperation = "lighter"));
      const l = Math.min(44, Math.max(10, n / s)),
        f = n / 2,
        h = i / 2;
      for (let p = l / 2; p < i + l; p += l)
        for (let u = l / 2; u < n + l; u += l) {
          const B = Math.hypot(u - f, p - h);
          let c = 0.5 + 0.5 * Math.sin(B * 0.02 - d * 2);
          if (
            ((c = Math.min(1, Math.max(0, (c - 0.25) / 0.65))),
            (c = c * c * (3 - 2 * c)),
            c < 0.04)
          )
            continue;
          const g = Math.max(0, (c - 0.82) / 0.18) * 0.4,
            r = Math.round(T + (255 - T) * g),
            M = Math.round(x + (255 - x) * g),
            y = Math.round(w + (255 - w) * g),
            m = l * 0.78,
            v = l * 0.94,
            O = l * 0.16;
          ((a.fillStyle = `rgba(${r},${M},${y},${(0.2 * c).toFixed(3)})`),
            a.beginPath(),
            a.roundRect(u - v / 2, p - v / 2, v, v, O * 1.4),
            a.fill(),
            (a.fillStyle = `rgba(${r},${M},${y},${(0.85 * c).toFixed(3)})`),
            a.beginPath(),
            a.roundRect(u - m / 2, p - m / 2, m, m, O),
            a.fill());
        }
      ((a.globalCompositeOperation = "source-over"), (a.globalAlpha = 1));
    };
  }, [e, o, t, s]);
  return _.jsx(V, { draw: R });
}
const Be = `
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

// Distance from the field value to its nearest filament, 0..0.5.
float lineDist(float u) {
  return abs(fract(u) - 0.5);
}
// Filament profile: hot core inside a wide soft halo.
float profile(float d) {
  return exp(-pow(d * 26.0, 1.7)) + 0.3 * exp(-pow(d * 7.0, 2.0));
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  float x = (uv.x - 0.5) * (uRes.x / uRes.y);
  float s = uTime * uSpeed;

  // One shared S-curve bends the whole stack in parallel.
  float wob = 0.75 * sin(x * 1.7 + s * 0.25) + 0.18 * sin(x * 3.1 - s * 0.15);
  float u = uv.y * 4.5 + wob;

  // Chromatic fringe: red and blue ride the field slightly apart.
  float ig = profile(lineDist(u));
  float ir = profile(lineDist(u + 0.012));
  float ib = profile(lineDist(u - 0.012));

  // A warm sweep glides along the filaments.
  float warm = 0.5 + 0.5 * sin(x * 1.2 - s * 0.8 + u * 0.7);
  warm = smoothstep(0.15, 0.85, warm);

  vec3 tint = mix(uC0, uC1, warm);
  vec3 col = vec3(
    tint.r * ir,
    tint.g * ig,
    tint.b * ib
  );
  // The core burns toward the highlight stop.
  col += uC2 * pow(ig, 3.0) * 0.45;
  col = 1.0 - exp(-col * 1.8);

  float gr = hash(gl_FragCoord.xy + floor(uTime * 5.0) * vec2(13.7, 7.3));
  col *= 0.93 + 0.14 * gr;
  col += (gr - 0.5) * 0.025;

  gl_FragColor = vec4(uBg + col, 1.0);
}
`;
function io({
  colors: e = ["#4638d8", "#f04fd0", "#f2ecff"],
  background: o = A,
  speed: t = 1,
}) {
  const s = S.useMemo(
    () => ({
      uC0: e[0],
      uC1: e[1] ?? e[0],
      uC2: e[2] ?? e[1] ?? e[0],
      uBg: o,
      uSpeed: t,
    }),
    [e, o, t],
  );
  return _.jsx(j, { frag: Be, uniforms: s });
}
const $e = `
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
function ro({ color: e = W, background: o = A, speed: t = 1 }) {
  const s = S.useMemo(() => ({ uC0: e, uBg: o, uSpeed: t }), [e, o, t]);
  return _.jsx(j, { frag: $e, uniforms: s });
}
const ke = `
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
  vec2 p = vec2((uv.x - 0.5) * (uRes.x / uRes.y), uv.y);
  float s = uTime * uSpeed;

  // Tilted axis that snakes slowly with height.
  float axis = (uv.y - 0.5) * 0.22 + 0.12 * (fbm(vec2(uv.y * 1.6, s * 0.07)) - 0.5);
  float dx = p.x - axis;

  // Column envelope: a soft Gaussian whose width breathes with height.
  float wdt = 0.2 + 0.08 * fbm(vec2(uv.y * 2.2 + 7.0, s * 0.06));
  float column = exp(-pow(dx / wdt, 2.0));

  // Rising veils: warped fbm in column-local coordinates. The phase
  // shear across the width fakes the wrap-around rotation.
  vec2 q = vec2(dx * 3.0 + uv.y * 1.4 + s * 0.18, uv.y * 1.3 - s * 0.28);
  float warp = fbm(q * 1.6 + vec2(0.0, s * 0.05));
  float veil = fbm(q * 2.1 + vec2(warp * 1.7, -warp * 0.5));
  veil = pow(smoothstep(0.3, 0.85, veil), 1.7);

  // A finer, faster layer of wisps on top.
  float wisp = fbm(vec2(dx * 6.5 - uv.y * 2.0 - s * 0.1, uv.y * 3.2 - s * 0.5));
  wisp = pow(smoothstep(0.5, 0.9, wisp), 2.0) * 0.6;

  float i = column * (veil + wisp) + column * column * 0.12;

  // Bottom stop to top stop along the height; hottest wisps burn to the
  // third stop.
  vec3 tint = mix(uC1, uC0, smoothstep(0.05, 0.95, uv.y));
  vec3 col = tint * i * 1.6 + uC2 * pow(i, 3.0) * 0.45;
  col = 1.0 - exp(-col * 1.7);

  float gr = hash(gl_FragCoord.xy + floor(uTime * 5.0) * vec2(13.7, 7.3));
  col *= 0.93 + 0.14 * gr;
  col += (gr - 0.5) * 0.025;

  gl_FragColor = vec4(uBg + col, 1.0);
}
`;
function lo({
  colors: e = ["#6d4df2", "#f27dd7", "#f4ecff"],
  background: o = A,
  speed: t = 1,
}) {
  const s = S.useMemo(
    () => ({
      uC0: e[0],
      uC1: e[1] ?? e[0],
      uC2: e[2] ?? e[1] ?? e[0],
      uBg: o,
      uSpeed: t,
    }),
    [e, o, t],
  );
  return _.jsx(j, { frag: ke, uniforms: s });
}
const je = `
precision mediump float;
uniform vec2 uRes;
uniform float uTime;
uniform float uSpeed;
uniform float uCount;
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

// One bundle of threads in its own bending frame.
vec3 bundle(vec2 uv, float rot, float curl, float freq, float seed, float gain, float s) {
  float r = length(uv);
  float a = rot + curl * r;
  mat2 R = mat2(cos(a), -sin(a), sin(a), cos(a));
  vec2 p = R * uv;

  // The fan breathes: amplitude swells and pinches over time.
  float amp = 0.22 + 0.14 * sin(s * 0.23 + seed);
  vec3 acc = vec3(0.0);

  for (int i = 0; i < 14; i++) {
    if (float(i) >= uCount) break;
    float fi = float(i);
    float t = fi / max(uCount - 1.0, 1.0);
    float y = sin(p.x * freq + seed + fi * 0.4 + s * 0.32) * amp * (0.6 + 0.8 * t)
      + (t - 0.5) * 0.14;
    float m = abs(p.y - y);
    // Hot exponential core inside a soft reciprocal halo.
    float line = exp(-m * 90.0) * 0.55 + 0.012 / (m + 0.012);
    acc += palette(t) * line;
  }
  return acc * gain;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes - 0.5;
  uv.x *= uRes.x / uRes.y;
  float s = uTime * uSpeed;

  vec3 col = vec3(0.0);
  col += bundle(uv, -0.42, 0.35, 1.9, 1.7, 0.085, s);
  col += bundle(uv, 0.24, -0.5, 1.5, 4.2, 0.06, s);
  col += bundle(uv + vec2(0.15, 0.28), -0.85, 0.25, 2.3, 8.9, 0.035, s);

  col = 1.0 - exp(-col * 1.6);

  float gr = hash(gl_FragCoord.xy + floor(uTime * 5.0) * vec2(13.7, 7.3));
  col *= 0.93 + 0.14 * gr;
  col += (gr - 0.5) * 0.02;

  gl_FragColor = vec4(uBg + col, 1.0);
}
`;
function fo({
  colors: e = ["#e86bd8", "#f5f0fa", "#8b5bd6"],
  background: o = A,
  speed: t = 1,
  count: s = 9,
}) {
  const R = S.useMemo(
    () => ({
      uC0: e[0],
      uC1: e[1] ?? e[0],
      uC2: e[2] ?? e[1] ?? e[0],
      uBg: o,
      uSpeed: t,
      uCount: Math.min(14, Math.max(3, s)),
    }),
    [e, o, t, s],
  );
  return _.jsx(j, { frag: je, uniforms: R });
}
const Pe = `
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

// One ribbon: a Gaussian body around a wandering path, inside a wide
// vapor halo.
float ribbon(vec2 p, float base, float seed, float s) {
  float path = base
    + 0.14 * sin(p.x * 1.3 + seed + s * 0.14)
    + 0.06 * sin(p.x * 2.9 - seed * 2.0 - s * 0.09)
    + 0.16 * (fbm(vec2(p.x * 0.55 + seed * 3.0, s * 0.05)) - 0.5);
  float m = abs(p.y - path);
  float wdt = 0.04 + 0.03 * fbm(vec2(p.x * 1.1 + seed * 7.0, s * 0.07));
  float body = exp(-pow(m / wdt, 2.0));
  float halo = exp(-pow(m / (wdt * 4.0), 2.0)) * 0.18;
  return body + halo;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes - 0.5;
  uv.x *= uRes.x / uRes.y;
  float s = uTime * uSpeed;

  // A slight tilt so the ribbons cross the frame instead of lying flat.
  float a = -0.14;
  vec2 p = mat2(cos(a), -sin(a), sin(a), cos(a)) * uv;

  vec3 col = vec3(0.0);
  col += uC0 * ribbon(p, 0.26, 1.7, s) * 0.65;
  col += uC1 * ribbon(p, -0.04, 4.9, s) * 0.75;
  col += uC2 * ribbon(p, -0.34, 8.3, s) * 0.5;

  col = 1.0 - exp(-col * 1.7);

  float gr = hash(gl_FragCoord.xy + floor(uTime * 5.0) * vec2(13.7, 7.3));
  col *= 0.93 + 0.14 * gr;
  col += (gr - 0.5) * 0.025;

  gl_FragColor = vec4(uBg + col, 1.0);
}
`;
function uo({
  colors: e = ["#a86df2", "#d66de0", "#6d5df2"],
  background: o = A,
  speed: t = 1,
}) {
  const s = S.useMemo(
    () => ({
      uC0: e[0],
      uC1: e[1] ?? e[0],
      uC2: e[2] ?? e[1] ?? e[0],
      uBg: o,
      uSpeed: t,
    }),
    [e, o, t],
  );
  return _.jsx(j, { frag: Pe, uniforms: s });
}
const Ne = `
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

vec3 palette(float t) {
  vec3 c = mix(uC0, uC1, smoothstep(0.0, 0.55, t));
  return mix(c, uC2, smoothstep(0.5, 1.0, t));
}

// One glow layer: exponential falloff from an fbm-displaced centerline.
float current(vec2 p, float seed, float s) {
  float wave = (fbm(vec2(p.x * 0.9 + seed, s * 0.1 + seed * 2.0)) - 0.5) * 0.45
    + 0.08 * sin(p.x * 2.2 + seed * 3.0 + s * 0.2);
  float m = abs(p.y - wave);
  float spread = 0.08 + 0.06 * fbm(vec2(p.x * 0.7 + seed * 5.0, s * 0.08));
  // Tighter than a pure exponential: the glow stays soft but the frame
  // above and below the current goes properly dark.
  return exp(-pow(m / spread, 1.6)) * 0.85;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes - 0.5;
  uv.x *= uRes.x / uRes.y;
  float s = uTime * uSpeed;

  vec3 col = vec3(0.0);

  // Two layers on separate clocks, hues sliding along the current.
  float i1 = current(uv, 1.7, s);
  float t1 = 0.5 + 0.5 * sin(uv.x * 1.4 + s * 0.16);
  col += palette(t1) * i1;

  float i2 = current(uv, 6.3, s + 3.0);
  float t2 = 0.5 + 0.5 * sin(uv.x * 1.1 - s * 0.11 + 2.0);
  col += palette(t2) * i2 * 0.6;

  col = 1.0 - exp(-col * 1.6);

  float gr = hash(gl_FragCoord.xy + floor(uTime * 5.0) * vec2(13.7, 7.3));
  col *= 0.93 + 0.14 * gr;
  col += (gr - 0.5) * 0.025;

  gl_FragColor = vec4(uBg + col, 1.0);
}
`;
function co({
  colors: e = ["#5b8af2", "#a86df2", "#f25b9e"],
  background: o = A,
  speed: t = 1,
}) {
  const s = S.useMemo(
    () => ({
      uC0: e[0],
      uC1: e[1] ?? e[0],
      uC2: e[2] ?? e[1] ?? e[0],
      uBg: o,
      uSpeed: t,
    }),
    [e, o, t],
  );
  return _.jsx(j, { frag: Ne, uniforms: s });
}
const Oe = `
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
function ho({
  colors: e = ["#f28ae0", "#8a5cf2", "#4632d8"],
  background: o = A,
  speed: t = 1,
  count: s = 14,
}) {
  const R = S.useMemo(
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
  return _.jsx(j, { frag: Oe, uniforms: R, mouse: !0 });
}
const Ge = `
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
float noise1(float x) {
  return noise(vec2(x, 3.7));
}

// The bolt's horizontal position at height y: low octave snakes, high
// octaves jag.
float wander(float y, float seed) {
  return (fbm(vec2(y * 1.1 + seed * 13.0, seed)) - 0.5) * 0.7
    + (fbm(vec2(y * 3.6 - seed * 7.0, seed * 2.0)) - 0.5) * 0.24
    + (fbm(vec2(y * 9.5 + seed * 3.0, seed * 4.0)) - 0.5) * 0.09;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  vec2 p = vec2((uv.x - 0.5) * (uRes.x / uRes.y), uv.y);
  float s = uTime * uSpeed;

  // Re-strike: the seed steps every ~1.6s, so the bolt jumps to a new
  // path; within a strike it only shivers.
  float seed = floor(s * 0.62) + 0.13 * fract(s * 0.62);

  // Strobe: fast random flicker with occasional hard flashes.
  float strobe = 0.35 + 0.65 * pow(noise1(s * 9.0 + seed), 2.2);

  // Main bolt.
  float d = abs(p.x - wander(uv.y, seed));
  float bolt = 0.012 / (d + 0.008);

  // A fainter secondary branch on its own path.
  float d2 = abs(p.x - wander(uv.y, seed + 41.0) * 1.15 - 0.12);
  float branch = 0.005 / (d2 + 0.01);

  float i = (bolt + branch) * strobe;

  // Ambient flash: the hardest hits light the whole frame faintly.
  float flash = 0.03 * strobe * exp(-abs(p.x) * 1.2);

  vec3 col = uC0 * (i * 0.85 + flash) + vec3(1.0) * pow(min(i, 2.2), 3.0) * 0.08;
  col = 1.0 - exp(-col * 1.6);

  float gr = hash(gl_FragCoord.xy + floor(uTime * 5.0) * vec2(13.7, 7.3));
  col *= 0.93 + 0.14 * gr;
  col += (gr - 0.5) * 0.02;

  gl_FragColor = vec4(uBg + col, 1.0);
}
`;
function po({ color: e = W, background: o = A, speed: t = 1 }) {
  const s = S.useMemo(() => ({ uC0: e, uBg: o, uSpeed: t }), [e, o, t]);
  return _.jsx(j, { frag: Ge, uniforms: s });
}
const Ee = `
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
function mo({ color: e = "#8099cc", background: o = A, speed: t = 1 }) {
  const s = S.useMemo(() => ({ uC0: e, uBg: o, uSpeed: t }), [e, o, t]);
  return _.jsx(j, { frag: Ee, uniforms: s, mouse: !0 });
}
function Y(e) {
  const o = Math.sin(e * 127.1) * 43758.5453;
  return o - Math.floor(o);
}
function qe(e) {
  let o = e.replace("#", "").trim();
  o.length === 3 &&
    (o = o
      .split("")
      .map((s) => s + s)
      .join(""));
  const t = parseInt(o, 16);
  return Number.isNaN(t)
    ? [255, 255, 255]
    : [(t >> 16) & 255, (t >> 8) & 255, t & 255];
}
function vo({
  colors: e = ["#4c3ff2", "#f0f0f4", "#5c5a66"],
  background: o = A,
  speed: t = 1,
  count: s = 26,
}) {
  const R = S.useRef(null);
  S.useEffect(() => {
    const a = (n) => {
      R.current = { x: n.clientX, y: n.clientY };
    };
    return (
      window.addEventListener("pointermove", a, { passive: !0 }),
      () => window.removeEventListener("pointermove", a)
    );
  }, []);
  const F = e.join("|"),
    b = S.useMemo(() => {
      let a = "",
        n = [],
        i = [],
        C = 0,
        d = 0,
        T = 0;
      const x = (l) => {
          const f = n[0],
            h = n[1] ?? f,
            p = n[2] ?? h,
            [u, B, c] = l < 0.5 ? [f, h, l * 2] : [h, p, l * 2 - 1];
          return [
            Math.round(u[0] + (B[0] - u[0]) * c),
            Math.round(u[1] + (B[1] - u[1]) * c),
            Math.round(u[2] + (B[2] - u[2]) * c),
          ];
        },
        w = (l, f) => {
          ((C = l), (d = f), (i = []));
          const h = Math.min(l, f);
          for (let p = 0; p < s; p++) {
            const u = h * (0.035 + 0.055 * Math.pow(Y(p * 1.37 + 0.31), 1.4));
            i.push({
              x: u + Y(p * 2.71 + 5.3) * (l - 2 * u),
              y: u + Y(p * 3.93 + 9.7) * (f - 2 * u),
              vx: (Y(p * 5.9 + 1.9) - 0.5) * h * 0.4,
              vy: (Y(p * 7.9 + 8.3) - 0.5) * h * 0.2,
              r: u,
              c: x(Y(p * 9.1 + 4.9)),
            });
          }
        };
      return (l, f, h, p) => {
        (a || ((a = N(l.canvas, o)), (n = e.map((r) => qe(N(l.canvas, r))))),
          (f !== C || h !== d) && w(f, h));
        const u = Math.min(Math.max(p - T, 0), 0.05) * t;
        T = p;
        const B = h * 2.2,
          c = 0.78;
        for (const r of i)
          ((r.vy += B * u),
            (r.vx *= 0.999),
            (r.vy *= 0.999),
            (r.x += r.vx * u),
            (r.y += r.vy * u),
            r.x - r.r < 0
              ? ((r.x = r.r), (r.vx = -r.vx * c))
              : r.x + r.r > f && ((r.x = f - r.r), (r.vx = -r.vx * c)),
            r.y + r.r > h &&
              ((r.y = h - r.r), (r.vy = -r.vy * c), (r.vx *= 0.96)));
        for (let r = 0; r < 2; r++)
          for (let M = 0; M < i.length; M++)
            for (let y = M + 1; y < i.length; y++) {
              const m = i[M],
                v = i[y],
                O = v.x - m.x,
                I = v.y - m.y,
                P = Math.hypot(O, I) || 1e-4,
                q = m.r + v.r - P;
              if (q > 0) {
                const G = O / P,
                  $ = I / P,
                  L = q / 2;
                ((m.x -= G * L),
                  (m.y -= $ * L),
                  (v.x += G * L),
                  (v.y += $ * L));
                const H = m.vx * G + m.vy * $,
                  U = v.vx * G + v.vy * $,
                  k = (H - U) * 0.82;
                k > 0 &&
                  ((m.vx -= k * G),
                  (m.vy -= k * $),
                  (v.vx += k * G),
                  (v.vy += k * $));
              }
            }
        const g = R.current;
        if (g) {
          const r = l.canvas.getBoundingClientRect(),
            M = g.x - r.left,
            y = g.y - r.top;
          if (M > -50 && M < f + 50 && y > -50 && y < h + 50) {
            const m = Math.min(f, h) * 0.09;
            for (const v of i) {
              const O = v.x - M,
                I = v.y - y,
                P = Math.hypot(O, I) || 1e-4,
                q = m + v.r - P;
              if (q > 0) {
                const G = O / P,
                  $ = I / P;
                ((v.x += G * q),
                  (v.y += $ * q),
                  (v.vx += G * q * 14),
                  (v.vy += $ * q * 14));
              }
            }
          }
        }
        ((l.fillStyle = a), l.fillRect(0, 0, f, h));
        for (const r of i) {
          const [M, y, m] = r.c,
            v = l.createRadialGradient(
              r.x - r.r * 0.35,
              r.y - r.r * 0.4,
              r.r * 0.1,
              r.x,
              r.y,
              r.r,
            );
          (v.addColorStop(
            0,
            `rgb(${Math.min(255, M + 90)},${Math.min(255, y + 90)},${Math.min(255, m + 90)})`,
          ),
            v.addColorStop(0.55, `rgb(${M},${y},${m})`),
            v.addColorStop(
              1,
              `rgb(${Math.round(M * 0.4)},${Math.round(y * 0.4)},${Math.round(m * 0.4)})`,
            ),
            (l.fillStyle = v),
            l.beginPath(),
            l.arc(r.x, r.y, r.r, 0, 6.283),
            l.fill(),
            (l.fillStyle = "rgba(255,255,255,0.55)"),
            l.beginPath(),
            l.arc(r.x - r.r * 0.42, r.y - r.r * 0.46, r.r * 0.16, 0, 6.283),
            l.fill());
        }
      };
    }, [F, o, t, s]);
  return _.jsx(V, { draw: b });
}
const Ie = `
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
function go({
  colors: e = ["#9c43fe", "#4cc2e9", "#141980"],
  background: o = A,
  speed: t = 1,
}) {
  const s = S.useMemo(
    () => ({
      uC0: e[0],
      uC1: e[1] ?? e[0],
      uC2: e[2] ?? e[1] ?? e[0],
      uBg: o,
      uSpeed: t,
    }),
    [e, o, t],
  );
  return _.jsx(j, {
    frag: Ie,
    uniforms: s,
    mouse: !0,
    mouseInitial: [0.5, -0.4],
  });
}
const Le = `
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

void main() {
  float mn = min(uRes.x, uRes.y);
  vec2 uv = (2.0 * gl_FragCoord.xy - uRes) / mn;
  float s = uTime * uSpeed;

  // The pointer leans the fluid's phase.
  vec2 m = (uMouse - 0.5) * 2.0;
  vec2 p = uv + m * 0.3;

  // Three folding passes; a small rotation between passes keeps the
  // churn from aligning into stripes.
  mat2 R = mat2(0.96, -0.28, 0.28, 0.96);
  float amp = 0.34;
  for (int i = 1; i <= 3; i++) {
    float fi = float(i);
    p.x += amp / fi * cos(fi * 2.1 * p.y + s * 0.6 + 1.7);
    p.y += amp / fi * sin(fi * 1.6 * p.x - s * 0.45 + 4.1);
    p = R * p;
  }

  // A damped ripple spreads from wherever the cursor rests.
  vec2 d = uv - m;
  float dist = length(d);
  p += (d / (dist + 1e-3)) * sin(dist * 18.0 - s * 2.2) * exp(-dist * 7.0) * 0.06;

  // Veins: the folded field burns where the phase plane crosses zero.
  float ph = abs(sin(p.x + p.y - s * 0.35));
  float i1 = 0.085 / (ph + 0.07);
  // A second, fainter crossing at another angle enriches the pool.
  float ph2 = abs(sin(p.x - p.y * 0.7 + s * 0.27 + 2.0));
  float i2 = 0.035 / (ph2 + 0.08);

  float i = i1 + i2 * 0.6;
  vec3 col = uC0 * i * 0.7;
  col = 1.0 - exp(-col * 1.9);

  float gr = hash(gl_FragCoord.xy + floor(uTime * 5.0) * vec2(13.7, 7.3));
  col *= 0.94 + 0.12 * gr;
  col += (gr - 0.5) * 0.02;

  gl_FragColor = vec4(uBg + col, 1.0);
}
`;
function bo({ color: e = "#e6e6ec", background: o = A, speed: t = 1 }) {
  const s = S.useMemo(() => ({ uC0: e, uBg: o, uSpeed: t }), [e, o, t]);
  return _.jsx(j, { frag: Le, uniforms: s, mouse: !0 });
}
export {
  lo as A,
  ze as C,
  Ye as D,
  Ue as E,
  fo as G,
  ro as H,
  oo as L,
  Ke as M,
  eo as N,
  to as O,
  He as P,
  Ve as S,
  so as V,
  Xe as a,
  Je as b,
  Ze as c,
  Qe as d,
  ao as e,
  no as f,
  io as g,
  uo as h,
  co as i,
  ho as j,
  po as k,
  mo as l,
  vo as m,
  go as n,
  bo as o,
};
