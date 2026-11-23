import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ACCENT,
  BACKGROUNDS,
  type BackgroundEffect,
  type EffectValue,
  type EffectValues,
} from "@/effects/registry";
import { componentFileName, getComponentSource, getUsageExample } from "@/effects/sources";
import { useI18n } from "@/i18n";
import { ControlField } from "./ControlField";
import { HeroOverlay } from "./HeroOverlay";

const sectionTitle = {
  fontFamily: "var(--font-mono)",
  fontSize: 12,
  letterSpacing: "0.5px",
  textTransform: "uppercase" as const,
  color: "var(--color-accent)",
  margin: 0,
};

function Fullscreen({
  effect,
  values,
  overlay,
  onClose,
  onStep,
}: {
  effect: BackgroundEffect;
  values: EffectValues;
  overlay: boolean;
  onClose: () => void;
  onStep: (delta: number) => void;
}) {
  const { t, effectName } = useI18n();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onStep(1);
      if (e.key === "ArrowLeft") onStep(-1);
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose, onStep]);

  // The fullscreen bar floats over the (always dark) full-bleed canvas.
  const btn = {
    width: 34,
    height: 34,
    borderRadius: "var(--fx-radius-full)",
    border: "1px solid rgba(255,255,255,0.18)",
    background: "rgba(255,255,255,0.06)",
    color: "#ededed",
    cursor: "pointer",
    fontSize: 15,
    lineHeight: 1,
  } as const;

  return (
    <div className="fixed inset-0 z-50" style={{ background: "var(--color-fx-canvas)" }}>
      <div key={effect.id} className="absolute inset-0 fx-fade-in">
        {effect.render(values)}
      </div>
      {overlay && <HeroOverlay />}
      <div
        className="absolute bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-3"
        style={{
          border: "1px solid rgba(255,255,255,0.16)",
          background: "color-mix(in srgb, var(--color-fx-canvas) 70%, transparent)",
          backdropFilter: "blur(10px)",
          borderRadius: "var(--fx-radius-full)",
          padding: "7px 10px",
        }}
      >
        <button type="button" style={btn} onClick={() => onStep(-1)} aria-label={t.prevEffect}>
          ←
        </button>
        <span className="flex min-w-[150px] items-center justify-center gap-2 text-center">
          <span style={{ fontSize: 13.5, fontWeight: 600, color: "#ededed" }}>
            {effectName(effect)}
          </span>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              color: "rgba(255,255,255,0.45)",
            }}
          >
            {effect.index}
          </span>
        </span>
        <button type="button" style={btn} onClick={() => onStep(1)} aria-label={t.nextEffect}>
          →
        </button>
        <span style={{ width: 1, height: 20, background: "rgba(255,255,255,0.16)" }} />
        <button type="button" style={btn} onClick={onClose} aria-label={t.exitFullscreen}>
          ✕
        </button>
      </div>
    </div>
  );
}

function CodeBlock({ code, fileName }: { code: string; fileName: string }) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = code;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    setCopied(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), 1600);
  };

  const download = () => {
    const url = URL.createObjectURL(new Blob([code], { type: "text/plain;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  const action = {
    fontFamily: "var(--font-mono)",
    fontSize: 11,
    letterSpacing: "0.5px",
    textTransform: "uppercase",
    color: "var(--text-2)",
    background: "transparent",
    border: "1px solid var(--border-1)",
    borderRadius: "var(--fx-radius-sm)",
    padding: "4px 9px",
    cursor: "pointer",
  } as const;

  return (
    <div
      style={{
        border: "1px solid var(--border-1)",
        borderRadius: "var(--fx-radius-md)",
        background: "var(--panel)",
        overflow: "hidden",
      }}
    >
      <div
        className="flex items-center justify-between gap-3"
        style={{ padding: "7px 10px 7px 14px", borderBottom: "1px solid var(--border-1)" }}
      >
        <span className="mono-label" style={{ color: "var(--text-3)" }}>
          {fileName}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={download}
            style={{
              ...action,
              color: "var(--color-on-accent)",
              background: "var(--color-accent)",
              borderColor: "var(--color-accent)",
            }}
          >
            {t.download}
          </button>
          <button
            type="button"
            onClick={copy}
            style={
              copied
                ? {
                    ...action,
                    color: "var(--color-on-accent)",
                    background: "var(--color-accent)",
                    borderColor: "var(--color-accent)",
                  }
                : action
            }
          >
            {copied ? t.copied : t.copy}
          </button>
        </div>
      </div>
      <pre
        className="slim-scroll m-0 overflow-auto"
        style={{
          padding: "16px 18px",
          maxHeight: 560,
          fontFamily: "var(--font-mono)",
          fontSize: 12.5,
          lineHeight: 1.65,
          color: "var(--text-1)",
        }}
      >
        <code>{code}</code>
      </pre>
    </div>
  );
}

interface StudioProps {
  id: string;
  onSelect: (id: string) => void;
}

export function Studio({ id, onSelect }: StudioProps) {
  const { t, effectName, effectSubName, effectDesc, propDesc } = useI18n();
  const [overrides, setOverrides] = useState<Record<string, EffectValues>>({});
  const [overlay, setOverlay] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const [codeTab, setCodeTab] = useState<"usage" | "source">("usage");

  const index = Math.max(
    0,
    BACKGROUNDS.findIndex((b) => b.id === id),
  );
  const effect = BACKGROUNDS[index];
  const subName = effectSubName(effect);
  const values: EffectValues = useMemo(
    () => ({ ...effect.defaults, ...overrides[effect.id] }),
    [effect, overrides],
  );
  const modified = Object.keys(overrides[effect.id] ?? {}).length > 0;

  const setValue = (key: string, value: EffectValue) =>
    setOverrides((prev) => ({ ...prev, [effect.id]: { ...prev[effect.id], [key]: value } }));
  const reset = () => setOverrides((prev) => ({ ...prev, [effect.id]: {} }));

  const step = useCallback(
    (delta: number) => {
      const next = BACKGROUNDS[(index + delta + BACKGROUNDS.length) % BACKGROUNDS.length];
      onSelect(next.id);
    },
    [index, onSelect],
  );

  // ← / → switch effects while the studio is focused (not while typing in a field)
  useEffect(() => {
    if (fullscreen) return;
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) return;
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [fullscreen, step]);

  // keep the active pill visible in the mobile strip
  const pillRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  useEffect(() => {
    pillRefs.current[effect.id]?.scrollIntoView({ block: "nearest", inline: "center" });
  }, [effect.id]);

  const usage = useMemo(() => getUsageExample(effect, values), [effect, values]);
  const componentSource = useMemo(() => getComponentSource(effect), [effect]);
  const sourceLines = componentSource.split("\n").length;

  return (
    <div className="flex flex-col lg:flex-row" style={{ borderTop: "1px solid var(--border-1)" }}>
      {/* Sidebar (desktop) */}
      <aside
        className="slim-scroll hidden py-6 lg:sticky lg:top-0 lg:block lg:max-h-screen lg:w-[240px] lg:shrink-0 lg:self-start lg:overflow-y-auto"
        style={{ borderRight: "1px solid var(--border-1)" }}
      >
        <div className="mb-4 px-5">
          <div className="mono-label" style={{ color: "var(--color-accent)", marginBottom: 8 }}>
            {t.sidebarTitle}
          </div>
          <p className="text-copy-13" style={{ color: "var(--text-3)", margin: 0 }}>
            {t.sidebarSub}
          </p>
        </div>
        <nav>
          {BACKGROUNDS.map((b) => {
            const active = b.id === effect.id;
            return (
              <button
                key={b.id}
                type="button"
                onClick={() => onSelect(b.id)}
                className="nav-item flex w-full cursor-pointer items-center justify-between text-left transition-colors"
                style={{
                  padding: "9px 20px 9px 18px",
                  borderLeft: active ? "2px solid var(--color-accent)" : "2px solid transparent",
                  background: active ? "var(--panel-2)" : undefined,
                  color: active ? "var(--text-1)" : "var(--text-2)",
                  fontSize: 14,
                  fontWeight: active ? 600 : 400,
                }}
              >
                <span className="truncate">{effectName(b)}</span>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                    color: "var(--text-4)",
                    marginLeft: 8,
                  }}
                >
                  {b.index}
                </span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Pills (mobile) */}
      <div
        className="slim-scroll flex gap-2 overflow-x-auto px-4 py-4 lg:hidden"
        style={{ borderBottom: "1px solid var(--border-1)" }}
      >
        {BACKGROUNDS.map((b) => {
          const active = b.id === effect.id;
          return (
            <button
              key={b.id}
              type="button"
              ref={(el) => {
                pillRefs.current[b.id] = el;
              }}
              onClick={() => onSelect(b.id)}
              className="shrink-0 cursor-pointer"
              style={{
                padding: "7px 14px",
                borderRadius: "var(--fx-radius-full)",
                border: active ? "1px solid var(--color-accent)" : "1px solid var(--border-2)",
                background: active ? "var(--panel-2)" : "transparent",
                color: active ? "var(--text-1)" : "var(--text-2)",
                fontSize: 13,
                fontWeight: active ? 600 : 400,
                whiteSpace: "nowrap",
              }}
            >
              {effectName(b)}
            </button>
          );
        })}
      </div>

      {/* Main */}
      <div className="min-w-0 flex-1 p-4 sm:p-6">
        <div key={effect.id} className="fade-up">
          <div className="mono-label" style={{ color: "var(--text-3)", marginBottom: 10 }}>
            {t.backgroundsCrumb} <span style={{ margin: "0 6px" }}>·</span>{" "}
            {effect.index.replace("/", "")}
            <span style={{ color: "var(--text-4)" }}> / {BACKGROUNDS.length}</span>
          </div>
          <div className="flex flex-wrap items-center gap-3" style={{ marginBottom: 10 }}>
            <h2 className="text-heading-32" style={{ margin: 0, color: "var(--color-gray-1000)" }}>
              {effectName(effect)}
            </h2>
            {subName && (
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 13,
                  color: "var(--text-4)",
                }}
              >
                {subName}
              </span>
            )}
            <span
              className="mono-label"
              style={{
                color: effect.tech === "webgl" ? "var(--color-accent)" : "var(--text-3)",
                border: "1px solid var(--border-1)",
                borderRadius: "var(--fx-radius-sm)",
                padding: "3px 8px",
              }}
            >
              {effect.tech}
            </span>
          </div>
          <p
            className="text-copy-14"
            style={{ color: "var(--text-2)", margin: "0 0 22px", maxWidth: 640 }}
          >
            {effectDesc(effect)}
          </p>
        </div>

        {/* Preview — the effect canvas itself stays dark in both themes */}
        <div
          className="relative"
          style={{
            height: "clamp(340px, 52vh, 560px)",
            border: "1px solid var(--border-1)",
            borderRadius: "var(--fx-radius-md)",
            overflow: "hidden",
            background: "var(--color-fx-canvas)",
          }}
        >
          <div key={effect.id} className="absolute inset-0 fx-fade-in">
            {effect.render(values)}
          </div>
          {overlay && <HeroOverlay />}

          <div className="absolute bottom-3 right-3 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setOverlay((v) => !v)}
              className="mono-label cursor-pointer"
              style={{
                color: "rgba(255,255,255,0.8)",
                border: "1px solid rgba(255,255,255,0.18)",
                background: "color-mix(in srgb, var(--color-fx-canvas) 65%, transparent)",
                backdropFilter: "blur(8px)",
                borderRadius: "var(--fx-radius-sm)",
                padding: "5px 10px",
              }}
            >
              {overlay ? t.heroOverlayOn : t.heroOverlayOff}
            </button>
            <button
              type="button"
              onClick={() => setFullscreen(true)}
              className="mono-label cursor-pointer"
              style={{
                color: "#0a0a0a",
                background: ACCENT,
                border: `1px solid ${ACCENT}`,
                borderRadius: "var(--fx-radius-sm)",
                padding: "5px 10px",
                fontWeight: 600,
              }}
            >
              {t.fullscreen}
            </button>
          </div>
        </div>

        <div
          className="mono-label mt-3 flex flex-wrap items-center justify-between gap-2"
          style={{ color: "var(--text-4)" }}
        >
          <span>{t.keyHint}</span>
          <span>
            {effectName(BACKGROUNDS[(index + BACKGROUNDS.length - 1) % BACKGROUNDS.length])} ·{" "}
            <span style={{ color: "var(--text-2)" }}>{effectName(effect)}</span> ·{" "}
            {effectName(BACKGROUNDS[(index + 1) % BACKGROUNDS.length])}
          </span>
        </div>

        {/* Customize */}
        <section className="mt-10">
          <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
            <h3 style={sectionTitle}>{t.customize}</h3>
            <button
              type="button"
              onClick={reset}
              disabled={!modified}
              className="mono-label cursor-pointer disabled:cursor-default disabled:opacity-40"
              style={{
                color: "var(--text-3)",
                border: "1px solid var(--border-1)",
                borderRadius: "var(--fx-radius-sm)",
                background: "transparent",
                padding: "5px 10px",
              }}
            >
              {t.reset}
            </button>
          </div>
          <div
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
            style={{
              gap: "18px 22px",
              border: "1px solid var(--border-1)",
              borderRadius: "var(--fx-radius-md)",
              padding: "16px 18px",
              background: "var(--panel)",
            }}
          >
            {effect.controls.map((control) => (
              <ControlField
                key={`${effect.id}-${control.key}`}
                control={control}
                value={values[control.key]}
                onChange={(v) => setValue(control.key, v)}
              />
            ))}
          </div>
        </section>

        {/* Props */}
        <section className="mt-10">
          <h3 style={{ ...sectionTitle, marginBottom: 12 }}>{t.propsTitle}</h3>
          <div
            className="overflow-hidden"
            style={{
              border: "1px solid var(--border-1)",
              borderRadius: "var(--fx-radius-md)",
              background: "var(--panel)",
            }}
          >
            {effect.props.map((p, i) => (
              <div
                key={p.prop}
                className="grid grid-cols-1 gap-x-6 gap-y-1 sm:grid-cols-[130px_minmax(0,1fr)_minmax(0,1.4fr)]"
                style={{
                  padding: "12px 18px",
                  borderTop: i === 0 ? undefined : "1px solid var(--border-1)",
                }}
              >
                <div>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 12.5,
                      color: "var(--color-accent)",
                    }}
                  >
                    {p.prop}
                  </span>
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 11.5,
                      color: "var(--text-4)",
                    }}
                  >
                    {p.type}
                  </div>
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 12,
                    color: "var(--text-1)",
                    wordBreak: "break-word",
                  }}
                >
                  <span style={{ color: "var(--text-4)" }}>{t.defaultLabel} </span>
                  {p.def}
                </div>
                <div className="text-copy-13" style={{ color: "var(--text-2)" }}>
                  {propDesc(p.desc)}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Usage */}
        <section className="mt-10">
          <div
            className="flex flex-wrap items-center justify-between gap-2"
            style={{ marginBottom: 12 }}
          >
            <h3 style={sectionTitle}>{t.usageTitle}</h3>
            <span className="mono-label" style={{ color: "var(--text-4)" }}>
              {t.zeroDepBadge}
            </span>
          </div>

          <div className="mb-3 flex flex-wrap gap-1">
            {(
              [
                { id: "usage", label: t.tabUsage },
                { id: "source", label: t.tabSource(sourceLines) },
              ] as const
            ).map((tab) => {
              const active = codeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setCodeTab(tab.id)}
                  className="cursor-pointer transition-colors"
                  style={{
                    padding: "5px 13px",
                    borderRadius: "var(--fx-radius-full)",
                    border: active
                      ? "1px solid var(--color-accent)"
                      : "1px solid var(--border-2)",
                    background: active ? "var(--panel-2)" : "transparent",
                    color: active ? "var(--text-1)" : "var(--text-3)",
                    fontSize: 12.5,
                    fontWeight: active ? 600 : 400,
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {codeTab === "usage" ? (
            <>
              <p
                className="text-copy-14"
                style={{ color: "var(--text-2)", margin: "0 0 14px", maxWidth: 680 }}
              >
                {t.usageDesc(componentFileName(effect))}
              </p>
              <CodeBlock code={usage} fileName="Hero.tsx" />
            </>
          ) : (
            <>
              <p
                className="text-copy-14"
                style={{ color: "var(--text-2)", margin: "0 0 14px", maxWidth: 680 }}
              >
                {t.sourceDesc}
              </p>
              <CodeBlock code={componentSource} fileName={componentFileName(effect)} />
            </>
          )}
        </section>
      </div>

      {fullscreen && (
        <Fullscreen
          effect={effect}
          values={values}
          overlay={overlay}
          onClose={() => setFullscreen(false)}
          onStep={step}
        />
      )}
    </div>
  );
}
