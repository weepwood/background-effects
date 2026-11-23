import { useI18n, type Lang } from "@/i18n";

const OPTIONS: { id: Lang; label: string; title: string }[] = [
  { id: "zh", label: "中", title: "中文" },
  { id: "en", label: "EN", title: "English" },
];

export function LangSwitch() {
  const { lang, setLang, t } = useI18n();
  return (
    <div className="icon-cluster" role="radiogroup" aria-label={t.langLabel}>
      {OPTIONS.map((opt) => {
        const active = lang === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={opt.title}
            title={opt.title}
            data-on={active}
            className="icon-tab icon-tab-text"
            onClick={() => setLang(opt.id)}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
