import * as h from "react";
import * as $ from "react/jsx-runtime";
function se(a, o) {
  if (!o.startsWith("var(")) return o;
  const n = o.slice(4, -1).trim();
  return getComputedStyle(a).getPropertyValue(n).trim() || "#f97316";
}
function ue(a, o) {
  const n = Math.sin(a * 127.1 + o * 311.7) * 43758.5453;
  return n - Math.floor(n);
}
function le({ draw: a }) {
  const o = h.useRef(null);
  return (
    h.useEffect(() => {
      const n = o.current;
      if (!n) return;
      const c = n.getContext("2d");
      if (!c) return;
      const b = window.matchMedia("(prefers-reduced-motion: reduce)").matches,
        d = Math.min(window.devicePixelRatio || 1, 2);
      let u = 0,
        g = 0,
        l = 0,
        E = !0;
      const R = performance.now(),
        x = () => {
          (a(c, u, g, (performance.now() - R) / 1e3),
            (l = requestAnimationFrame(x)));
        },
        v = () => {
          b || l || !E || document.hidden || (l = requestAnimationFrame(x));
        },
        A = () => {
          (cancelAnimationFrame(l), (l = 0));
        },
        S = () => {
          ((u = n.clientWidth),
            (g = n.clientHeight),
            (n.width = Math.round(u * d)),
            (n.height = Math.round(g * d)),
            c.setTransform(d, 0, 0, d, 0, 0),
            a(c, u, g, b ? 2.5 : (performance.now() - R) / 1e3));
        },
        t = new ResizeObserver(S);
      (t.observe(n), S());
      const e = new IntersectionObserver(([L]) => {
        ((E = L?.isIntersecting ?? !0), E ? v() : A());
      });
      e.observe(n);
      const w = () => {
        document.hidden ? A() : v();
      };
      return (
        document.addEventListener("visibilitychange", w),
        v(),
        () => {
          (A(),
            t.disconnect(),
            e.disconnect(),
            document.removeEventListener("visibilitychange", w));
        }
      );
    }, [a]),
    $.jsx("canvas", {
      ref: o,
      "aria-hidden": !0,
      className: "absolute inset-0 h-full w-full",
      style: { pointerEvents: "none" },
    })
  );
}
const ae =
  "attribute vec2 aPos; void main() { gl_Position = vec4(aPos, 0.0, 1.0); }";
function ce(a) {
  let o = a.replace("#", "").trim();
  o.length === 3 &&
    (o = o
      .split("")
      .map((c) => c + c)
      .join(""));
  const n = parseInt(o, 16);
  return Number.isNaN(n)
    ? [1, 1, 1]
    : [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}
function de({
  frag: a,
  uniforms: o,
  mouse: n = !1,
  mouseInitial: c = [0.5, 0.5],
  maxDpr: b = 2,
  fps: d,
  easeColors: u,
}) {
  const g = h.useRef(null),
    l = Object.entries(o ?? {}),
    E = JSON.stringify(
      u
        ? Object.fromEntries(l.filter(([, t]) => typeof t != "string"))
        : (o ?? {}),
    ),
    R = u
      ? JSON.stringify(
          Object.fromEntries(l.filter(([, t]) => typeof t == "string")),
        )
      : "",
    x = h.useRef({});
  x.current = Object.fromEntries(l.filter((t) => typeof t[1] == "string"));
  const v = h.useRef(null);
  h.useEffect(() => {
    v.current?.();
  }, [R]);
  const [A, S] = h.useState(0);
  return (
    h.useEffect(() => {
      const t = g.current;
      if (!t) return;
      const e = t.getContext("webgl", {
        antialias: !1,
        alpha: !1,
        powerPreference: "low-power",
      });
      if (!e) return;
      t.dataset.glHooked ||
        ((t.dataset.glHooked = "1"),
        t.addEventListener("webglcontextlost", (r) => r.preventDefault()));
      const w = () => S((r) => r + 1);
      if ((t.addEventListener("webglcontextrestored", w), e.isContextLost()))
        return (
          e.getExtension("WEBGL_lose_context")?.restoreContext(),
          () => t.removeEventListener("webglcontextrestored", w)
        );
      const L = (r, i) => {
          const s = e.createShader(r);
          return s
            ? (e.shaderSource(s, i),
              e.compileShader(s),
              e.getShaderParameter(s, e.COMPILE_STATUS)
                ? s
                : (e.isContextLost() ||
                    console.error(
                      "ShaderCanvas compile error:",
                      e.getShaderInfoLog(s),
                    ),
                  e.deleteShader(s),
                  null))
            : null;
        },
        B = L(e.VERTEX_SHADER, ae),
        _ = L(e.FRAGMENT_SHADER, a);
      if (!B || !_) return;
      const f = e.createProgram();
      if (!f) return;
      if (
        (e.attachShader(f, B),
        e.attachShader(f, _),
        e.linkProgram(f),
        !e.getProgramParameter(f, e.LINK_STATUS))
      ) {
        console.error("ShaderCanvas link error:", e.getProgramInfoLog(f));
        return;
      }
      e.useProgram(f);
      const ee = e.createBuffer();
      (e.bindBuffer(e.ARRAY_BUFFER, ee),
        e.bufferData(
          e.ARRAY_BUFFER,
          new Float32Array([-1, -1, 3, -1, -1, 3]),
          e.STATIC_DRAW,
        ));
      const V = e.getAttribLocation(f, "aPos");
      (e.enableVertexAttribArray(V),
        e.vertexAttribPointer(V, 2, e.FLOAT, !1, 0, 0));
      const te = e.getUniformLocation(f, "uRes"),
        ne = e.getUniformLocation(f, "uTime"),
        H = n ? e.getUniformLocation(f, "uMouse") : null;
      let y = c[0],
        M = c[1],
        I = c[0],
        U = c[1];
      const W = (r) => {
        const i = t.getBoundingClientRect();
        i.width === 0 ||
          i.height === 0 ||
          ((I = Math.min(1.2, Math.max(-0.2, (r.clientX - i.left) / i.width))),
          (U = Math.min(
            1.2,
            Math.max(-0.2, 1 - (r.clientY - i.top) / i.height),
          )));
      };
      n && window.addEventListener("pointermove", W, { passive: !0 });
      const P = [],
        k = (r) => ce(se(t, r));
      for (const [r, i] of Object.entries(o ?? {})) {
        const s = e.getUniformLocation(f, r);
        if (typeof i == "number") e.uniform1f(s, i);
        else {
          const m = k(i);
          (e.uniform3f(s, ...m), u && P.push({ loc: s, name: r, now: m }));
        }
      }
      let q = performance.now();
      const z = (r) => {
          if (!P.length) return;
          const i = performance.now(),
            s = r ? 1 : 1 - Math.exp(-((i - q) / 1e3) / ((u || 1) / 3));
          q = i;
          for (const m of P) {
            const oe = k(x.current[m.name] ?? "#000000");
            ((m.now = m.now.map((Z, ie) => Z + (oe[ie] - Z) * s)),
              e.uniform3f(m.loc, ...m.now));
          }
        },
        T = window.matchMedia("(prefers-reduced-motion: reduce)").matches,
        D = Math.min(window.devicePixelRatio || 1, b);
      let p = 0,
        C = !0;
      const F = performance.now(),
        N = (r) => {
          (z(!1),
            e.uniform2f(te, e.drawingBufferWidth, e.drawingBufferHeight),
            e.uniform1f(ne, r),
            H &&
              ((y += (I - y) * 0.08),
              (M += (U - M) * 0.08),
              e.uniform2f(H, y, M)),
            e.drawArrays(e.TRIANGLES, 0, 3));
        },
        re = d ? 1e3 / d - 1 : 0;
      let G = 0;
      const K = (r) => {
          ((p = requestAnimationFrame(K)),
            !(r - G < re) && ((G = r), N((performance.now() - F) / 1e3)));
        },
        O = () => {
          T || p || !C || document.hidden || (p = requestAnimationFrame(K));
        },
        j = () => {
          (cancelAnimationFrame(p), (p = 0));
        },
        Y = () => {
          ((t.width = Math.round(t.clientWidth * D)),
            (t.height = Math.round(t.clientHeight * D)),
            e.viewport(0, 0, e.drawingBufferWidth, e.drawingBufferHeight),
            N(T ? 2.5 : (performance.now() - F) / 1e3));
        },
        J = new ResizeObserver(Y);
      (J.observe(t), Y());
      const X = new IntersectionObserver(([r]) => {
        ((C = r?.isIntersecting ?? !0), C ? O() : j());
      });
      X.observe(t);
      const Q = () => {
        document.hidden ? j() : O();
      };
      return (
        document.addEventListener("visibilitychange", Q),
        O(),
        (v.current = () => {
          p || (z(!0), N(T ? 2.5 : (performance.now() - F) / 1e3));
        }),
        () => {
          (j(),
            (v.current = null),
            J.disconnect(),
            X.disconnect(),
            document.removeEventListener("visibilitychange", Q),
            n && window.removeEventListener("pointermove", W),
            t.removeEventListener("webglcontextrestored", w));
        }
      );
    }, [a, E, A, n, b, d, u]),
    $.jsx("canvas", {
      ref: g,
      "aria-hidden": !0,
      className: "absolute inset-0 h-full w-full",
      style: { pointerEvents: "none" },
    })
  );
}
const me = "var(--color-accent)",
  he = "var(--color-fx-canvas)";
export { me as A, he as C, le as F, de as S, se as c, ue as h };
