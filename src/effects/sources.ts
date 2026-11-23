import type { BackgroundEffect, EffectValues } from "./registry";
import { EFFECT_SOURCES, ENGINE_SOURCE } from "./source-index";

/** Suggested file name for the standalone component. */
export function componentFileName(effect: BackgroundEffect): string {
  return `${effect.component}.tsx`;
}

/**
 * The effect as one self-contained file.
 *
 * The shared engine is inlined above the effect, so the only thing the file
 * imports is React — no Tailwind, no runtime, no other dependency. Copy it
 * anywhere in a React + TypeScript project and it works as-is.
 */
export function getComponentSource(effect: BackgroundEffect): string {
  const raw = EFFECT_SOURCES[effect.id] ?? "";
  const body = raw
    .replace(/^\/\*\*[\s\S]*?\*\//, "")
    .split("\n")
    .filter((line) => !/^import\s/.test(line))
    .join("\n")
    .trim();

  const header = [
    "/**",
    ` * ${effect.name} — animated background (${effect.tech})`,
    " *",
    " * Zero dependencies: only React is required. Copy this single file into any",
    ` * React + TypeScript project and render <${effect.component} /> behind a section.`,
    " * Props: " + effect.props.map((p) => p.prop).join(", "),
    " *",
    " * Tuned from getdesign.md/backgrounds.",
    " */",
  ].join("\n");

  return [
    header,
    ENGINE_SOURCE,
    "/* ------------------------------ the effect ------------------------------ */",
    body,
  ].join("\n\n");
}

/**
 * A ready-to-paste usage example reflecting the current control values.
 */
export function getUsageExample(effect: BackgroundEffect, values: EffectValues): string {
  const attrs: string[] = [];
  for (const prop of effect.props) {
    if (prop.prop === "colors") {
      const colors = ["c0", "c1", "c2"].map((key) => JSON.stringify(String(values[key])));
      attrs.push(`colors={[${colors.join(", ")}]}`);
      continue;
    }
    const value = values[prop.prop];
    if (value === undefined) continue;
    if (prop.type === "number") attrs.push(`${prop.prop}={${Number(value)}}`);
    else attrs.push(`${prop.prop}=${JSON.stringify(String(value))}`);
  }

  const element =
    attrs.length + effect.component.length <= 60
      ? `<${effect.component} ${attrs.join(" ")} />`
      : [`<${effect.component}`, ...attrs.map((a) => `  ${a}`), "/>"].join("\n");

  return [
    `import { ${effect.component} } from "./${effect.component}";`,
    "",
    "export function Hero() {",
    "  return (",
    '    <section className="relative overflow-hidden">',
    '      <div className="absolute inset-0">',
    `        ${element}`,
    "      </div>",
    '      <div className="relative">{/* your content */}</div>',
    "    </section>",
    "  );",
    "}",
  ].join("\n");
}
