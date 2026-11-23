import type { CSSProperties } from "react";
import type { EffectControl, EffectValue } from "@/effects/registry";
import { useI18n } from "@/i18n";

const labelStyle: CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: 11,
  letterSpacing: "0.5px",
  textTransform: "uppercase",
  color: "var(--text-3)",
};

interface ControlFieldProps {
  control: EffectControl;
  value: EffectValue;
  onChange: (value: EffectValue) => void;
}

/** One tweakable prop of an effect (color / range / text / segment). */
export function ControlField({ control, value, onChange }: ControlFieldProps) {
  const { controlLabel, segmentLabel } = useI18n();
  const label = <span style={labelStyle}>{controlLabel(control.label)}</span>;

  if (control.kind === "color") {
    return (
      <label className="flex cursor-pointer flex-col gap-2">
        {label}
        <span className="flex items-center gap-2">
          <input
            type="color"
            value={String(value)}
            onChange={(e) => onChange(e.target.value)}
            style={{
              width: 34,
              height: 26,
              padding: 0,
              border: "1px solid var(--border-1)",
              borderRadius: "var(--fx-radius-sm)",
              background: "transparent",
              cursor: "pointer",
            }}
          />
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 12,
              color: "var(--text-1)",
              textTransform: "uppercase",
            }}
          >
            {String(value)}
          </span>
        </span>
      </label>
    );
  }

  if (control.kind === "range") {
    return (
      <label className="flex flex-col gap-2">
        <span className="flex items-center justify-between">
          {label}
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--color-accent)" }}>
            {Number(value).toFixed(1)}
          </span>
        </span>
        <input
          type="range"
          min={control.min}
          max={control.max}
          step={control.step}
          value={Number(value)}
          onChange={(e) => onChange(Number(e.target.value))}
          style={{ accentColor: "var(--color-accent)", width: "100%", cursor: "pointer" }}
        />
      </label>
    );
  }

  if (control.kind === "segment") {
    return (
      <div className="flex flex-col gap-2">
        {label}
        <div className="flex gap-1">
          {control.options.map((option) => {
            const active = value === option;
            return (
              <button
                key={option}
                type="button"
                onClick={() => onChange(option)}
                style={{
                  padding: "5px 12px",
                  borderRadius: "var(--fx-radius-sm)",
                  border: active ? "1px solid var(--color-accent)" : "1px solid var(--border-2)",
                  background: active ? "var(--panel-2)" : "transparent",
                  color: active ? "var(--text-1)" : "var(--text-3)",
                  fontSize: 12.5,
                  cursor: "pointer",
                }}
              >
                {segmentLabel(option)}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <label className="flex flex-col gap-2">
      {label}
      <input
        type="text"
        value={String(value)}
        onChange={(e) => onChange(e.target.value)}
        style={{
          background: "var(--color-background-200)",
          border: "1px solid var(--border-2)",
          borderRadius: "var(--fx-radius-sm)",
          padding: "6px 10px",
          fontFamily: "var(--font-mono)",
          fontSize: 12.5,
          color: "var(--text-1)",
          outline: "none",
        }}
      />
    </label>
  );
}
