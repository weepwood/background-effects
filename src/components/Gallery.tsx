import { useCallback, useMemo, useState } from "react";
import { ACCENT, BACKGROUNDS, type BackgroundEffect } from "@/effects/registry";
import { useI18n } from "@/i18n";
import { LazyEffect } from "./LazyEffect";

type Filter = "all" | "webgl" | "canvas-2d";

/** Fisher-Yates shuffle returning a new array. */
function shuffleEffects(list: readonly BackgroundEffect[]): BackgroundEffect[] {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/** Badge floating over the (always dark) effect canvas — fixed light-on-dark styling. */
function TechBadge({ tech }: { tech: BackgroundEffect["tech"] }) {
  return (
    <span
      className="mono-label"
      style={{
        color: tech === "webgl" ? ACCENT : "rgba(255,255,255,0.7)",
        border: "1px solid rgba(255,255,255,0.14)",
        background: "color-mix(in srgb, var(--color-fx-canvas) 70%, transparent)",
        backdropFilter: "blur(6px)",
        borderRadius: "var(--fx-radius-sm)",
        padding: "3px 8px",
      }}
    >
      {tech}
    </span>
  );
}

function Card({ effect, onOpen }: { effect: BackgroundEffect; onOpen: (id: string) => void }) {
  const { t, effectName, effectSubName, effectDesc } = useI18n();
  const subName = effectSubName(effect);

  return (
    <button
      type="button"
      onClick={() => onOpen(effect.id)}
      className="fx-card group flex cursor-pointer flex-col overflow-hidden text-left"
    >
      <div
        className="relative aspect-[16/10] w-full overflow-hidden"
        style={{ background: "var(--color-fx-canvas)" }}
      >
        <LazyEffect effect={effect} />
        <span
          className="mono-label absolute left-3 top-3"
          style={{ color: "rgba(255,255,255,0.75)", textShadow: "0 1px 8px rgba(0,0,0,0.6)" }}
        >
          {effect.index}
        </span>
        <span className="absolute right-3 top-3">
          <TechBadge tech={effect.tech} />
        </span>
        <span
          className="mono-label absolute bottom-3 right-3 translate-y-1 opacity-0 transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100"
          style={{
            color: "#0a0a0a",
            background: ACCENT,
            borderRadius: "var(--fx-radius-sm)",
            padding: "4px 9px",
            fontWeight: 600,
          }}
        >
          {t.openEffect}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-1.5 px-4 py-3.5">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-label-14" style={{ color: "var(--text-1)" }}>
            {effectName(effect)}
          </span>
          {subName && (
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                color: "var(--text-4)",
              }}
            >
              {subName}
            </span>
          )}
        </div>
        <span className="text-copy-13 line-clamp-2" style={{ color: "var(--text-3)" }}>
          {effectDesc(effect)}
        </span>
      </div>
    </button>
  );
}

export function Gallery({ onOpen }: { onOpen: (id: string) => void }) {
  const { t } = useI18n();
  const [filter, setFilter] = useState<Filter>("all");
  // Randomize the card order on every page entry, with a button to reshuffle on demand.
  const [ordered, setOrdered] = useState<BackgroundEffect[]>(() => shuffleEffects(BACKGROUNDS));
  const reshuffle = useCallback(() => setOrdered(shuffleEffects(BACKGROUNDS)), []);

  const filters: { id: Filter; label: string }[] = [
    { id: "all", label: t.filterAll },
    { id: "webgl", label: t.filterWebgl },
    { id: "canvas-2d", label: t.filterCanvas },
  ];

  const counts = useMemo(
    () => ({
      all: BACKGROUNDS.length,
      webgl: BACKGROUNDS.filter((b) => b.tech === "webgl").length,
      "canvas-2d": BACKGROUNDS.filter((b) => b.tech === "canvas-2d").length,
    }),
    [],
  );

  const items = ordered.filter((b) => filter === "all" || b.tech === filter);

  return (
    <section className="px-4 pb-16 pt-6 sm:px-6 lg:px-16">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {filters.map((f) => {
            const active = filter === f.id;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id)}
                className="cursor-pointer transition-colors"
                style={{
                  padding: "6px 14px",
                  borderRadius: "var(--fx-radius-full)",
                  border: active ? "1px solid var(--color-accent)" : "1px solid var(--border-2)",
                  background: active ? "var(--panel-2)" : "transparent",
                  color: active ? "var(--text-1)" : "var(--text-3)",
                  fontSize: 13,
                  fontWeight: active ? 600 : 400,
                }}
              >
                {f.label}
                <span
                  style={{
                    marginLeft: 8,
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                    color: active ? "var(--color-accent)" : "var(--text-4)",
                  }}
                >
                  {counts[f.id]}
                </span>
              </button>
            );
          })}
          <button
            type="button"
            onClick={reshuffle}
            className="inline-flex cursor-pointer items-center gap-1.5 transition-colors"
            style={{
              padding: "6px 12px",
              borderRadius: "var(--fx-radius-full)",
              border: "1px solid var(--border-2)",
              background: "transparent",
              color: "var(--text-2)",
              fontSize: 12.5,
            }}
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M16 3h5v5M4 20 21 3M21 16v5h-5M15 15l6 6M4 4l5 5" />
            </svg>
            <span>{t.shuffleOrder}</span>
          </button>
        </div>
        <p className="mono-label" style={{ color: "var(--text-4)", margin: 0 }}>
          {t.galleryHint}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {items.map((effect) => (
          <Card key={effect.id} effect={effect} onOpen={onOpen} />
        ))}
      </div>
    </section>
  );
}
