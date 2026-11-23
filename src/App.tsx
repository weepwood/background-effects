import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { ACCENT, BACKGROUNDS, type BackgroundEffect } from "@/effects/registry";
import { Gallery } from "@/components/Gallery";
import { LangSwitch } from "@/components/LangSwitch";
import { LazyEffect } from "@/components/LazyEffect";
import { Studio } from "@/components/Studio";
import { ThemeSwitch } from "@/components/ThemeSwitch";
import { useHashRoute } from "@/hooks/useHashRoute";
import { useTheme } from "@/hooks/useTheme";
import { I18nProvider, useI18n } from "@/i18n";

const DEFAULT_ID = "veil-rays";

function pickRandomEffect(excludeId?: string): BackgroundEffect {
  const pool = excludeId ? BACKGROUNDS.filter((b) => b.id !== excludeId) : BACKGROUNDS;
  return pool[Math.floor(Math.random() * pool.length)] ?? BACKGROUNDS[0];
}

function AppShell() {
  const [route, go] = useHashRoute();
  const { mode, setMode } = useTheme();
  const { t, effectName } = useI18n();

  // Pick a random hero background on every page entry, and allow manual reshuffling.
  const [heroEffect, setHeroEffect] = useState<BackgroundEffect>(() => pickRandomEffect());
  const shuffleHero = useCallback(() => {
    setHeroEffect((prev) => pickRandomEffect(prev.id));
  }, []);

  const lastStudioId = useRef(heroEffect.id || DEFAULT_ID);
  const galleryScroll = useRef(0);
  const prevView = useRef(route.view);

  if (route.view === "studio") {
    const known = BACKGROUNDS.some((b) => b.id === route.id);
    if (known) lastStudioId.current = route.id;
  }

  const openStudio = useCallback(
    (id: string) => {
      if (route.view === "gallery") galleryScroll.current = window.scrollY;
      go({ view: "studio", id });
    },
    [go, route.view],
  );

  const selectInStudio = useCallback((id: string) => go({ view: "studio", id }), [go]);

  // Restore the gallery scroll position when coming back; start studio at the top.
  useLayoutEffect(() => {
    if (prevView.current !== route.view) {
      window.scrollTo(0, route.view === "gallery" ? galleryScroll.current : 0);
      prevView.current = route.view;
    }
  }, [route.view]);

  useEffect(() => {
    const current =
      route.view === "studio" ? BACKGROUNDS.find((b) => b.id === route.id) : null;
    document.title = current
      ? `${effectName(current)} — ${t.title}`
      : `${t.title} · ${t.effectsCount(BACKGROUNDS.length)}`;
  }, [route, effectName, t]);

  const isGallery = route.view === "gallery";

  // Over the always-dark gallery canvas the badge keeps the fixed acid green;
  // elsewhere it follows the theme accent (magenta on light, acid on dark).
  const badgeAccent = isGallery ? ACCENT : "var(--color-accent)";
  const badge = {
    color: badgeAccent,
    border: `1px solid color-mix(in srgb, ${badgeAccent} 45%, transparent)`,
    borderRadius: 4,
    padding: "3px 6px",
    fontFamily: "var(--font-mono)",
    letterSpacing: "0.04em",
  } as const;

  const controls = (
    <div className="flex shrink-0 flex-wrap items-center gap-2 self-start sm:self-auto">
      <LangSwitch />
      <ThemeSwitch mode={mode} onChange={setMode} />
      <div className="chip-cluster">
        {(
          [
            { id: "gallery", label: t.gallery },
            { id: "studio", label: t.studio },
          ] as const
        ).map((tab) => {
          const active = tab.id === route.view;
          return (
            <button
              key={tab.id}
              type="button"
              data-on={active}
              className="chip-tab"
              onClick={() =>
                tab.id === "gallery"
                  ? go({ view: "gallery" })
                  : go({ view: "studio", id: lastStudioId.current })
              }
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen flex-col min-[2200px]:mx-auto min-[2200px]:max-w-[2000px]">
      {isGallery ? (
        <header className="relative overflow-hidden" style={{ borderBottom: "1px solid var(--border-1)" }}>
          <LazyEffect key={heroEffect.id} effect={heroEffect} rootMargin="0px" />
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "linear-gradient(to bottom, rgba(0,0,0,0) 40%, var(--color-background) 100%)",
            }}
          />

          <div className="on-canvas relative flex flex-col gap-5 px-4 pb-10 pt-12 sm:px-6 sm:pb-14 sm:pt-20 lg:px-16">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex min-w-0 flex-col gap-3">
                <div className="inline-flex flex-wrap items-center gap-2.5">
                  <h1
                    className="m-0 text-[34px] leading-none sm:text-[52px]"
                    style={{
                      fontFamily: "'Geist'",
                      color: "rgba(255,255,255,0.97)",
                      fontWeight: 600,
                      letterSpacing: "-0.03em",
                      textShadow: "0 2px 28px rgba(0,0,0,0.5)",
                    }}
                  >
                    {t.title}
                  </h1>
                  <span className="text-[11px] uppercase leading-none" style={badge}>
                    {t.effectsCount(BACKGROUNDS.length)}
                  </span>
                </div>
                <p
                  className="text-copy-14 m-0 max-w-2xl"
                  style={{
                    color: "rgba(255,255,255,0.74)",
                    textShadow: "0 1px 12px rgba(0,0,0,0.4)",
                  }}
                >
                  {t.subtitle}
                </p>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2 pt-0.5">
                  <p className="mono-label m-0" style={{ color: "rgba(255,255,255,0.48)" }}>
                    {t.extractedFrom}{" "}
                    <a
                      href="https://getdesign.md/backgrounds"
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        color: "rgba(255,255,255,0.8)",
                        textDecoration: "underline",
                        textUnderlineOffset: 3,
                      }}
                    >
                      getdesign.md/backgrounds
                    </a>{" "}
                    · {t.heroMeta}
                  </p>
                  <div className="inline-flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => openStudio(heroEffect.id)}
                      className="mono-label cursor-pointer transition-opacity hover:opacity-100"
                      style={{
                        color: "#ededed",
                        border: "1px solid rgba(255,255,255,0.18)",
                        background: "color-mix(in srgb, var(--color-fx-canvas) 62%, transparent)",
                        backdropFilter: "blur(8px)",
                        borderRadius: "var(--fx-radius-full)",
                        padding: "3px 10px",
                      }}
                    >
                      <span style={{ color: "rgba(255,255,255,0.5)" }}>{t.heroBadgeLabel}: </span>
                      <span style={{ color: ACCENT }}>{effectName(heroEffect)}</span>
                      <span style={{ color: "rgba(255,255,255,0.45)", marginLeft: 4 }}>
                        {heroEffect.index} ↗
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={shuffleHero}
                      title={t.shuffleHero}
                      aria-label={t.shuffleHero}
                      className="mono-label inline-flex cursor-pointer items-center gap-1 transition-colors hover:border-white/40"
                      style={{
                        color: "rgba(255,255,255,0.78)",
                        border: "1px solid rgba(255,255,255,0.18)",
                        background: "color-mix(in srgb, var(--color-fx-canvas) 62%, transparent)",
                        backdropFilter: "blur(8px)",
                        borderRadius: "var(--fx-radius-full)",
                        padding: "3px 9px",
                      }}
                    >
                      <svg
                        width="11"
                        height="11"
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
                      <span>{t.shuffleHero}</span>
                    </button>
                  </div>
                </div>
              </div>

              {controls}
            </div>
          </div>
        </header>
      ) : (
        /* Simplified compact top bar in Studio mode — no subtitle or extra copy */
        <header
          className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 sm:px-6"
          style={{ background: "var(--color-background)" }}
        >
          <div className="flex min-w-0 items-center gap-2.5">
            <button
              type="button"
              onClick={() => go({ view: "gallery" })}
              className="inline-flex cursor-pointer items-center gap-2 text-left transition-opacity hover:opacity-80"
              style={{ background: "transparent", border: "none", padding: 0 }}
            >
              <h1
                className="m-0 text-[16px] leading-none sm:text-[17px]"
                style={{
                  fontFamily: "'Geist'",
                  color: "var(--color-gray-1000)",
                  fontWeight: 600,
                  letterSpacing: "-0.02em",
                }}
              >
                {t.title}
              </h1>
            </button>
            <span className="text-[10.5px] uppercase leading-none" style={badge}>
              {BACKGROUNDS.length}
            </span>
          </div>

          {controls}
        </header>
      )}

      <main className="w-full flex-1">
        {isGallery ? (
          <Gallery onOpen={openStudio} />
        ) : (
          <Studio
            id={BACKGROUNDS.some((b) => b.id === route.id) ? route.id : DEFAULT_ID}
            onSelect={selectInStudio}
          />
        )}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <I18nProvider>
      <AppShell />
    </I18nProvider>
  );
}
