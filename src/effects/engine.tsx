import * as React from "react";

/**
 * Tiny rendering engine shared by every background effect.
 *
 * Two components:
 *  - `CanvasLayer`  — 2D canvas + requestAnimationFrame loop
 *  - `ShaderCanvas` — WebGL fullscreen quad + fragment shader
 *
 * Both fill their nearest positioned ancestor, pause when off-screen or when
 * the tab is hidden, cap the device pixel ratio, and respect
 * `prefers-reduced-motion` by painting a single static frame.
 */

/** Default effect color, resolved from a CSS custom property when possible. */
export const FX_COLOR = "var(--color-accent)";
/** Default canvas fill behind an effect. */
export const FX_BACKGROUND = "var(--color-fx-canvas)";

/**
 * Resolve a color that is either a plain hex string or a `var(--token)`
 * reference read from the canvas' computed style.
 */
export function resolveColor(canvas: HTMLCanvasElement, value: string): string {
  if (!value.startsWith("var(")) return value;
  const token = value.slice(4, -1).trim();
  return getComputedStyle(canvas).getPropertyValue(token).trim() || "#f97316";
}

/** Deterministic 2D hash — used for film grain and per-element jitter. */
export function hash2(a: number, b: number): number {
  const n = Math.sin(a * 127.1 + b * 311.7) * 43758.5453;
  return n - Math.floor(n);
}

const CANVAS_STYLE = {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  width: "100%",
  height: "100%",
  pointerEvents: "none",
} as const;

export interface CanvasLayerProps {
  /** Called every frame: 2D context, CSS-pixel size, seconds since mount. */
  draw: (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    time: number,
  ) => void;
}

/** A 2D canvas that calls `draw` on every animation frame. */
export function CanvasLayer({ draw }: CanvasLayerProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = 0;
    let height = 0;
    let frame = 0;
    let onScreen = true;
    const start = performance.now();

    const render = () => {
      draw(ctx, width, height, (performance.now() - start) / 1000);
      frame = requestAnimationFrame(render);
    };
    const play = () => {
      if (reduced || frame || !onScreen || document.hidden) return;
      frame = requestAnimationFrame(render);
    };
    const stop = () => {
      cancelAnimationFrame(frame);
      frame = 0;
    };
    const resize = () => {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw(ctx, width, height, reduced ? 2.5 : (performance.now() - start) / 1000);
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    resize();

    const intersectionObserver = new IntersectionObserver(([entry]) => {
      onScreen = entry?.isIntersecting ?? true;
      onScreen ? play() : stop();
    });
    intersectionObserver.observe(canvas);

    const onVisibility = () => (document.hidden ? stop() : play());
    document.addEventListener("visibilitychange", onVisibility);
    play();

    return () => {
      stop();
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [draw]);

  return <canvas ref={canvasRef} aria-hidden style={CANVAS_STYLE} />;
}

const VERTEX_SHADER =
  "attribute vec2 aPos; void main() { gl_Position = vec4(aPos, 0.0, 1.0); }";

/** `#rgb` / `#rrggbb` → normalized [r, g, b]. */
function hexToRgb(hex: string): [number, number, number] {
  let raw = hex.replace("#", "").trim();
  if (raw.length === 3) raw = raw.split("").map((c) => c + c).join("");
  const value = parseInt(raw, 16);
  if (Number.isNaN(value)) return [1, 1, 1];
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255].map(
    (c) => c / 255,
  ) as [number, number, number];
}

export interface ShaderCanvasProps {
  /** GLSL fragment shader source. `uRes`, `uTime`, `uSpeed` are provided. */
  frag: string;
  /** Uniform values: numbers upload as floats, strings as rgb colors. */
  uniforms: Record<string, string | number>;
  /** Track the pointer in a `uMouse` uniform (0..1, y flipped). */
  mouse?: boolean;
  /** Initial `uMouse` value before the pointer moves. */
  mouseInitial?: [number, number];
  /** Device pixel ratio cap. */
  maxDpr?: number;
  /** Frame rate cap. */
  fps?: number;
  /** Seconds spent easing color uniforms to their new value. */
  easeColors?: number;
}

/** A WebGL canvas running one fragment shader over a fullscreen triangle. */
export function ShaderCanvas({
  frag,
  uniforms,
  mouse = false,
  mouseInitial = [0.5, 0.5],
  maxDpr = 2,
  fps,
  easeColors,
}: ShaderCanvasProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const entries = Object.entries(uniforms ?? {});
  const nonColorKey = JSON.stringify(
    easeColors
      ? Object.fromEntries(entries.filter((entry) => typeof entry[1] !== "string"))
      : (uniforms ?? {}),
  );
  const colorKey = easeColors
    ? JSON.stringify(
        Object.fromEntries(entries.filter((entry) => typeof entry[1] === "string")),
      )
    : "";

  // Latest color uniforms, read at paint time so eased colors follow prop changes.
  const colorValues = React.useRef<Record<string, string>>({});
  colorValues.current = Object.fromEntries(
    entries.filter((entry): entry is [string, string] => typeof entry[1] === "string"),
  );

  const paintNow = React.useRef<(() => void) | null>(null);
  React.useEffect(() => {
    paintNow.current?.();
  }, [colorKey]);

  const [contextGeneration, setContextGeneration] = React.useState(0);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", {
      antialias: false,
      alpha: false,
      powerPreference: "low-power",
    });
    if (!gl) return;

    // Guard against duplicate listeners when the effect re-runs (StrictMode).
    if (!canvas.dataset.glHooked) {
      canvas.dataset.glHooked = "1";
      canvas.addEventListener("webglcontextlost", (event) => event.preventDefault());
    }
    const onRestored = () => setContextGeneration((n) => n + 1);
    canvas.addEventListener("webglcontextrestored", onRestored);
    if (gl.isContextLost()) {
      gl.getExtension("WEBGL_lose_context")?.restoreContext();
      return () => canvas.removeEventListener("webglcontextrestored", onRestored);
    }

    const compile = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return shader;
      if (!gl.isContextLost()) {
        console.error("ShaderCanvas compile error:", gl.getShaderInfoLog(shader));
      }
      gl.deleteShader(shader);
      return null;
    };

    const vertexShader = compile(gl.VERTEX_SHADER, VERTEX_SHADER);
    const fragmentShader = compile(gl.FRAGMENT_SHADER, frag);
    if (!vertexShader || !fragmentShader) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("ShaderCanvas link error:", gl.getProgramInfoLog(program));
      return;
    }
    gl.useProgram(program);

    // One big triangle covering the viewport.
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(program, "aPos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(program, "uRes");
    const uTime = gl.getUniformLocation(program, "uTime");
    const uMouse = mouse ? gl.getUniformLocation(program, "uMouse") : null;

    let mouseSmoothX = mouseInitial[0];
    let mouseSmoothY = mouseInitial[1];
    let mouseTargetX = mouseInitial[0];
    let mouseTargetY = mouseInitial[1];

    const onPointerMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      mouseTargetX = Math.min(1.2, Math.max(-0.2, (event.clientX - rect.left) / rect.width));
      mouseTargetY = Math.min(1.2, Math.max(-0.2, 1 - (event.clientY - rect.top) / rect.height));
    };
    if (mouse) window.addEventListener("pointermove", onPointerMove, { passive: true });

    const toRgb = (value: string) => hexToRgb(resolveColor(canvas, value));

    // Color uniforms that ease toward their new value instead of snapping.
    const eased: { loc: WebGLUniformLocation | null; name: string; now: [number, number, number] }[] =
      [];
    for (const [name, value] of Object.entries(uniforms ?? {})) {
      const loc = gl.getUniformLocation(program, name);
      if (typeof value === "number") {
        gl.uniform1f(loc, value);
      } else {
        const rgb = toRgb(value);
        gl.uniform3f(loc, ...rgb);
        if (easeColors) eased.push({ loc, name, now: rgb });
      }
    }

    let lastEase = performance.now();
    const easeColorsNow = (immediate: boolean) => {
      if (!eased.length) return;
      const now = performance.now();
      const t = immediate
        ? 1
        : 1 - Math.exp(-((now - lastEase) / 1000) / ((easeColors || 1) / 3));
      lastEase = now;
      for (const entry of eased) {
        const target = toRgb(colorValues.current[entry.name] ?? "#000000");
        entry.now = entry.now.map((c, i) => c + (target[i] - c) * t) as [number, number, number];
        gl.uniform3f(entry.loc, ...entry.now);
      }
    };

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
    let frame = 0;
    let onScreen = true;
    const start = performance.now();

    const paint = (time: number) => {
      easeColorsNow(false);
      gl.uniform2f(uRes, gl.drawingBufferWidth, gl.drawingBufferHeight);
      gl.uniform1f(uTime, time);
      if (uMouse) {
        mouseSmoothX += (mouseTargetX - mouseSmoothX) * 0.08;
        mouseSmoothY += (mouseTargetY - mouseSmoothY) * 0.08;
        gl.uniform2f(uMouse, mouseSmoothX, mouseSmoothY);
      }
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    const minFrameTime = fps ? 1000 / fps - 1 : 0;
    let lastDraw = 0;
    const loop = (now: number) => {
      frame = requestAnimationFrame(loop);
      if (now - lastDraw < minFrameTime) return;
      lastDraw = now;
      paint((performance.now() - start) / 1000);
    };
    const play = () => {
      if (reduced || frame || !onScreen || document.hidden) return;
      frame = requestAnimationFrame(loop);
    };
    const stop = () => {
      cancelAnimationFrame(frame);
      frame = 0;
    };
    const resize = () => {
      canvas.width = Math.round(canvas.clientWidth * dpr);
      canvas.height = Math.round(canvas.clientHeight * dpr);
      gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
      paint(reduced ? 2.5 : (performance.now() - start) / 1000);
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    resize();

    const intersectionObserver = new IntersectionObserver(([entry]) => {
      onScreen = entry?.isIntersecting ?? true;
      onScreen ? play() : stop();
    });
    intersectionObserver.observe(canvas);

    const onVisibility = () => (document.hidden ? stop() : play());
    document.addEventListener("visibilitychange", onVisibility);
    paintNow.current = () => {
      if (frame) return;
      easeColorsNow(true);
      paint(reduced ? 2.5 : (performance.now() - start) / 1000);
    };
    play();

    return () => {
      stop();
      paintNow.current = null;
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      if (mouse) window.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("webglcontextrestored", onRestored);
    };
  }, [frag, nonColorKey, contextGeneration, mouse, maxDpr, fps, easeColors]);

  return <canvas ref={canvasRef} aria-hidden style={CANVAS_STYLE} />;
}
