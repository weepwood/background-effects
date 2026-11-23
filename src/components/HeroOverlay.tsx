import type { CSSProperties } from "react";
import { ACCENT } from "@/effects/registry";
import { useI18n } from "@/i18n";

const monoLabel: CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "11px",
  letterSpacing: "0.5px",
  textTransform: "uppercase",
};

const glass = "color-mix(in srgb, var(--color-fx-canvas) 55%, transparent)";

/** Sample landing-hero content laid over an effect, mirroring the original preview. */
export function HeroOverlay() {
  const { t, lang } = useI18n();

  return (
    <div
      aria-hidden
      className="absolute inset-0 flex flex-col"
      style={{ pointerEvents: "none", padding: "16px clamp(14px, 3vw, 26px)" }}
    >
      <div
        className="flex items-center justify-between"
        style={{
          border: "1px solid rgba(255,255,255,0.14)",
          background: glass,
          backdropFilter: "blur(8px)",
          borderRadius: "var(--fx-radius-md)",
          padding: "9px 14px",
        }}
      >
        <div className="flex items-center gap-2">
          <span
            className="flex items-center justify-center"
            style={{
              width: 22,
              height: 22,
              borderRadius: "var(--fx-radius-sm)",
              background: "rgba(255,255,255,0.92)",
              color: "#0a0a0a",
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            ↑
          </span>
          <span style={{ color: "rgba(255,255,255,0.92)", fontSize: 14, fontWeight: 600 }}>
            {t.overlayBrand}
          </span>
        </div>
        <div className="hidden items-center gap-5 sm:flex">
          {t.overlayNav.map((item) => (
            <span key={item} style={{ color: "rgba(255,255,255,0.6)", fontSize: 13 }}>
              {item}
            </span>
          ))}
          <span
            style={{
              background: "rgba(255,255,255,0.92)",
              color: "#0a0a0a",
              fontSize: 12.5,
              fontWeight: 600,
              padding: "6px 12px",
              borderRadius: "var(--fx-radius-sm)",
            }}
          >
            {t.overlaySignUp}
          </span>
        </div>
      </div>

      <div
        className="flex flex-1 flex-col items-start justify-center text-left"
        style={{ paddingBottom: 20, paddingLeft: "clamp(6px, 2vw, 26px)", maxWidth: 620 }}
      >
        <span
          style={{
            ...monoLabel,
            color: "rgba(255,255,255,0.75)",
            border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: "var(--fx-radius-full)",
            padding: "4px 12px",
            background: glass,
            marginBottom: 16,
          }}
        >
          {t.overlayPill}
        </span>
        <div
          style={{
            fontFamily: "'Geist'",
            fontSize: "clamp(24px, 3.4vw, 44px)",
            fontWeight: 600,
            letterSpacing: lang === "zh" ? "-0.5px" : "-1.5px",
            lineHeight: 1.12,
            color: "rgba(255,255,255,0.96)",
            textShadow: "0 2px 24px rgba(0,0,0,0.45)",
          }}
        >
          {lang === "zh" ? (
            <>
              {t.overlayTitle1}
              <br />
              <span style={{ color: ACCENT, fontWeight: 700 }}>{t.overlayTitleAccent}</span>
              {t.overlayTitle2}
            </>
          ) : (
            <>
              {t.overlayTitle1}
              <span style={{ color: ACCENT, fontWeight: 700 }}>{t.overlayTitleAccent}</span>
              <br />
              {t.overlayTitle2.trimStart()}
            </>
          )}
        </div>
        <p
          style={{
            fontSize: 14,
            lineHeight: 1.6,
            color: "rgba(255,255,255,0.75)",
            margin: "14px 0 0",
            maxWidth: 400,
            textShadow: "0 1px 12px rgba(0,0,0,0.4)",
          }}
        >
          {t.overlayDesc}
        </p>
        <div className="flex items-center gap-3" style={{ marginTop: 20 }}>
          <span
            style={{
              background: "rgba(255,255,255,0.94)",
              color: "#0a0a0a",
              fontSize: 13.5,
              fontWeight: 600,
              padding: "9px 18px",
              borderRadius: "var(--fx-radius-sm)",
            }}
          >
            {t.overlayPrimary}
          </span>
          <span
            style={{
              border: "1px solid rgba(255,255,255,0.45)",
              color: "rgba(255,255,255,0.9)",
              fontSize: 13.5,
              fontWeight: 600,
              padding: "9px 18px",
              borderRadius: "var(--fx-radius-sm)",
            }}
          >
            {t.overlaySecondary}
          </span>
        </div>
      </div>
    </div>
  );
}
