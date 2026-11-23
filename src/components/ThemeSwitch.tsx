import type { ReactNode } from "react";
import type { ThemeMode } from "@/hooks/useTheme";
import { useI18n } from "@/i18n";

interface ThemeSwitchProps {
  mode: ThemeMode;
  onChange: (mode: ThemeMode, at: { x: number; y: number }) => void;
}

const svgBase = {
  width: 15,
  height: 15,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.85,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

/** System / auto theme: monitor with a diagonal light/dark split screen. */
const SystemIcon = (
  <svg {...svgBase} aria-hidden>
    <rect x="3" y="4" width="18" height="12.5" rx="2.2" />
    <path d="M19.2 5.8 4.8 14.7H19.2Z" fill="currentColor" stroke="none" opacity="0.28" />
    <path d="M8.5 20h7M12 16.5V20" />
  </svg>
);

const SunIcon = (
  <svg {...svgBase} aria-hidden>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2.4v2.1M12 19.5v2.1M4.9 4.9l1.5 1.5M17.6 17.6l1.5 1.5M2.4 12h2.1M19.5 12h2.1M4.9 19.1l1.5-1.5M17.6 6.4l1.5-1.5" />
  </svg>
);

const MoonIcon = (
  <svg {...svgBase} aria-hidden>
    <path d="M20.4 14.2A8.2 8.2 0 1 1 9.8 3.6a6.5 6.5 0 0 0 10.6 10.6Z" />
  </svg>
);

export function ThemeSwitch({ mode, onChange }: ThemeSwitchProps) {
  const { t } = useI18n();

  const options: { id: ThemeMode; label: string; icon: ReactNode }[] = [
    { id: "auto", label: t.themeAuto, icon: SystemIcon },
    { id: "light", label: t.themeLight, icon: SunIcon },
    { id: "dark", label: t.themeDark, icon: MoonIcon },
  ];

  return (
    <div className="icon-cluster" role="radiogroup" aria-label={t.themeGroup}>
      {options.map((option) => {
        const active = mode === option.id;
        return (
          <button
            key={option.id}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={option.label}
            title={option.label}
            data-on={active}
            className="icon-tab"
            onClick={(e) => onChange(option.id, { x: e.clientX, y: e.clientY })}
          >
            {option.icon}
          </button>
        );
      })}
    </div>
  );
}
