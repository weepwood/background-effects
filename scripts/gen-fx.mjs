#!/usr/bin/env node
/**
 * Generates the per-effect component modules from the extracted getdesign.md
 * chunks in scripts/vendor:
 *
 *   src/effects/fx/<id>.tsx      — one self-contained component per effect
 *   src/effects/registry.ts      — effect metadata + render functions
 *   src/effects/source-index.ts  — raw source text of each generated module
 *
 * The transformation is AST-driven (acorn): identifiers are renamed only where
 * they are true references to a module-scope binding, so local shadowing is
 * respected. `jsx(Comp, {...})` calls are rewritten as real JSX.
 */
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "acorn";
import { BACKGROUNDS } from "./vendor/registry.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const fxDir = path.join(root, "src/effects/fx");

/** Minified runtime export name → clean engine export name. */
const ENGINE_EXPORTS = {
  C: "FX_BACKGROUND",
  A: "FX_COLOR",
  S: "ShaderCanvas",
  c: "resolveColor",
  h: "hash2",
  F: "CanvasLayer",
};
const ENGINE_NAMES = Object.values(ENGINE_EXPORTS);

const pascal = (id) => id.split("-").map((p) => p[0].toUpperCase() + p.slice(1)).join("");
const camel = (id) => id.replace(/-(\w)/g, (_, c) => c.toUpperCase());
const indent = (text, n) =>
  text
    .split("\n")
    .map((line) => (line ? " ".repeat(n) + line : line))
    .join("\n");

/* ------------------------------------------------------------------ */
/* Scope-aware identifier references                                   */
/* ------------------------------------------------------------------ */

function patternNames(node, into) {
  if (!node) return;
  switch (node.type) {
    case "Identifier":
      into.add(node.name);
      break;
    case "ObjectPattern":
      node.properties.forEach((p) => patternNames(p.value ?? p.argument, into));
      break;
    case "ArrayPattern":
      node.elements.forEach((e) => patternNames(e, into));
      break;
    case "AssignmentPattern":
      patternNames(node.left, into);
      break;
    case "RestElement":
      patternNames(node.argument, into);
      break;
    default:
      break;
  }
}

/** Visit the default-value expressions inside a binding pattern. */
function visitPatternDefaults(node, scopes, refs) {
  if (!node) return;
  switch (node.type) {
    case "AssignmentPattern":
      visit(node.right, scopes, refs);
      visitPatternDefaults(node.left, scopes, refs);
      return;
    case "ObjectPattern":
      node.properties.forEach((p) => visitPatternDefaults(p.value ?? p.argument, scopes, refs));
      return;
    case "ArrayPattern":
      node.elements.forEach((e) => visitPatternDefaults(e, scopes, refs));
      return;
    case "RestElement":
      visitPatternDefaults(node.argument, scopes, refs);
      return;
    default:
      return;
  }
}

function visit(node, scopes, refs) {
  if (!node || typeof node.type !== "string") return;
  switch (node.type) {
    case "Identifier": {
      if (!scopes.some((s) => s.has(node.name))) {
        if (!refs.has(node.name)) refs.set(node.name, []);
        refs.get(node.name).push([node.start, node.end]);
      }
      return;
    }
    case "FunctionDeclaration":
    case "FunctionExpression":
    case "ArrowFunctionExpression": {
      if (node.id) scopes[scopes.length - 1].add(node.id.name);
      const inner = new Set();
      node.params.forEach((p) => patternNames(p, inner));
      scopes.push(inner);
      node.params.forEach((p) => visitPatternDefaults(p, scopes, refs));
      visit(node.body, scopes, refs);
      scopes.pop();
      return;
    }
    case "VariableDeclaration": {
      const scope = scopes[scopes.length - 1];
      node.declarations.forEach((d) => {
        patternNames(d.id, scope);
        visitPatternDefaults(d.id, scopes, refs);
        if (d.init) visit(d.init, scopes, refs);
      });
      return;
    }
    case "MemberExpression":
      visit(node.object, scopes, refs);
      if (node.computed) visit(node.property, scopes, refs);
      return;
    case "Property":
      if (node.computed) visit(node.key, scopes, refs);
      visit(node.value, scopes, refs);
      return;
    case "AssignmentExpression":
    case "UpdateExpression": {
      const target = node.type === "AssignmentExpression" ? node.left : node.argument;
      if (target.type === "Identifier" || /Pattern$/.test(target.type)) {
        patternNames(target, scopes[scopes.length - 1]);
      } else {
        visit(target, scopes, refs);
      }
      if (node.right) visit(node.right, scopes, refs);
      return;
    }
    case "CatchClause":
      if (node.param) patternNames(node.param, scopes[scopes.length - 1]);
      if (node.param) visitPatternDefaults(node.param, scopes, refs);
      visit(node.body, scopes, refs);
      return;
    case "ImportDeclaration":
    case "ExportNamedDeclaration":
      return;
    default:
      for (const key of Object.keys(node)) {
        if (key === "type" || key === "start" || key === "end" || key === "loc") continue;
        const value = node[key];
        if (Array.isArray(value)) value.forEach((v) => visit(v, scopes, refs));
        else if (value && typeof value.type === "string") visit(value, scopes, refs);
      }
  }
}

/** Map<name, [start, end][]> of references resolving outside `node`. */
function refsOf(node) {
  const scopes = [new Set()];
  const refs = new Map();
  if (node.type === "FunctionDeclaration") {
    node.params.forEach((p) => patternNames(p, scopes[0]));
    node.params.forEach((p) => visitPatternDefaults(p, scopes, refs));
    visit(node.body, scopes, refs);
  } else {
    visit(node, scopes, refs);
  }
  return refs;
}

/* ------------------------------------------------------------------ */
/* Text helpers                                                        */
/* ------------------------------------------------------------------ */

function applyRenames(text, renames) {
  const sorted = [...renames].sort((a, b) => b.start - a.start);
  let out = text;
  for (const r of sorted) out = out.slice(0, r.start) + r.text + out.slice(r.end);
  return out;
}

/** Slice [start, end] out of `text`, applying the renames that fall inside. */
function sliceWithRenames(text, renames, start, end) {
  const local = renames
    .filter((r) => r.start >= start && r.end <= end)
    .map((r) => ({ ...r, start: r.start - start, end: r.end - start }))
    .sort((a, b) => b.start - a.start);
  let out = text.slice(start, end);
  for (const r of local) out = out.slice(0, r.start) + r.text + out.slice(r.end);
  return out;
}

const lineIndent = (text, start) => {
  const lineStart = text.lastIndexOf("\n", start - 1) + 1;
  return /^[ \t]*/.exec(text.slice(lineStart, start))[0];
};

/* ------------------------------------------------------------------ */
/* Pass A — rename runtime / react aliases across a chunk             */
/* ------------------------------------------------------------------ */

function prepareChunk(rawText) {
  const ast = parse(rawText, { ecmaVersion: "latest", sourceType: "module" });
  const aliasMap = new Map();
  for (const node of ast.body) {
    if (node.type !== "ImportDeclaration") continue;
    const source = node.source.value;
    for (const spec of node.specifiers) {
      if (spec.type === "ImportNamespaceSpecifier") {
        if (source === "react") aliasMap.set(spec.local.name, "React");
        else if (source === "react/jsx-runtime") aliasMap.set(spec.local.name, "jsx");
      } else if (spec.type === "ImportSpecifier" && /runtime\.js$/.test(source)) {
        const nice = ENGINE_EXPORTS[spec.imported.name];
        if (nice) aliasMap.set(spec.local.name, nice);
      }
    }
  }

  // `_.jsx(Comp, props)` → `jsx(Comp, props)`: the namespace access collapses
  // to a bare call so the return statement can be rewritten as real JSX.
  const jsxNamespace = [...aliasMap.entries()].find(([, nice]) => nice === "jsx")?.[0];
  const memberReplacements = [];
  const walkAll = (node) => {
    if (!node || typeof node.type !== "string") return;
    if (
      node.type === "MemberExpression" &&
      !node.computed &&
      node.object.type === "Identifier" &&
      node.object.name === jsxNamespace &&
      node.property.type === "Identifier"
    ) {
      memberReplacements.push({ start: node.start, end: node.end, text: node.property.name });
    }
    for (const key of Object.keys(node)) {
      if (key === "type" || key === "start" || key === "end" || key === "loc") continue;
      const value = node[key];
      if (Array.isArray(value)) value.forEach(walkAll);
      else if (value && typeof value.type === "string") walkAll(value);
    }
  };
  walkAll(ast);

  const renames = [...memberReplacements];
  for (const node of ast.body) {
    if (node.type === "ImportDeclaration") continue;
    for (const [name, positions] of refsOf(node)) {
      const replacement = aliasMap.get(name);
      if (!replacement) continue;
      for (const [start, end] of positions) {
        const shadowedByReplacement = memberReplacements.some(
          (r) => start < r.end && end > r.start,
        );
        if (!shadowedByReplacement) renames.push({ start, end, text: replacement });
      }
    }
  }
  const text = applyRenames(rawText, renames);

  const ast2 = parse(text, { ecmaVersion: "latest", sourceType: "module" });
  const topDecls = new Map();
  for (const node of ast2.body) {
    if (node.type === "FunctionDeclaration" && node.id) topDecls.set(node.id.name, node);
    else if (node.type === "VariableDeclaration") {
      node.declarations.forEach((d) => {
        if (d.id.type === "Identifier") topDecls.set(d.id.name, node);
      });
    }
  }
  return { text, ast: ast2, topDecls };
}

/* ------------------------------------------------------------------ */
/* Pass B — extract one effect as a self-contained module             */
/* ------------------------------------------------------------------ */

function propType(meta, name, fallbackText) {
  const declared = meta.props.find((p) => p.prop === name)?.type;
  const type =
    declared ?? (fallbackText && /^-?\d+(\.\d+)?$/.test(fallbackText) ? "number" : "string");
  return type.replace(/'([^']*)'/g, '"$1"');
}

function buildEffectFile(meta, chunk) {
  const element = meta.render(meta.defaults);
  const fnName = element.type.name;
  const fn = chunk.topDecls.get(fnName);
  if (!fn) throw new Error(`component ${fnName} not found for ${meta.id}`);
  if (fn.params[0]?.type !== "ObjectPattern") {
    throw new Error(`${meta.id}: unexpected parameter shape`);
  }

  const componentName = pascal(meta.id);
  const propsName = `${componentName}Props`;

  /* --- dependencies: top-level declarations the component references */
  const included = [];
  const seen = new Set([fnName]);
  const queue = [...refsOf(fn).keys()].filter((n) => chunk.topDecls.has(n) && !seen.has(n));
  while (queue.length) {
    const name = queue.shift();
    if (seen.has(name)) continue;
    seen.add(name);
    const node = chunk.topDecls.get(name);
    included.push(node);
    for (const free of refsOf(node).keys()) {
      if (chunk.topDecls.has(free) && !seen.has(free)) queue.push(free);
    }
  }
  included.sort((a, b) => a.start - b.start);

  const regions = [...included, fn].sort((a, b) => a.start - b.start);
  const regionStart = regions[0].start;
  const regionEnd = regions[regions.length - 1].end;

  const freeRefs = new Map();
  const mergeRefs = (node) => {
    for (const [name, positions] of refsOf(node)) {
      if (!freeRefs.has(name)) freeRefs.set(name, []);
      freeRefs.get(name).push(...positions);
    }
  };
  mergeRefs(fn);
  included.forEach(mergeRefs);

  const allRenames = [
    { start: fn.start, end: fn.start, text: "export " },
    { start: fn.id.start, end: fn.id.end, text: componentName },
    { start: fn.params[0].end, end: fn.params[0].end, text: `: ${propsName}` },
  ];

  /* --- the returned `jsx(Comp, { ... })` call, rewritten as JSX */
  const returnStmt = fn.body.body.find((s) => s.type === "ReturnStatement");
  const call = returnStmt?.argument;
  const convertible =
    call &&
    call.type === "CallExpression" &&
    call.callee.type === "Identifier" &&
    call.callee.name === "jsx" &&
    call.arguments.length === 2 &&
    call.arguments[0].type === "Identifier" &&
    call.arguments[1].type === "ObjectExpression";
  const returnStart = convertible ? returnStmt.start : -1;
  const returnEnd = convertible ? returnStmt.end : -1;

  /* --- rename the shader const to FRAGMENT_SHADER, including the use inside
         the JSX call (applied while building the attribute text below) */
  let shaderConstName = null;
  if (convertible) {
    for (const property of call.arguments[1].properties) {
      const key = property.key;
      const name = key.type === "Identifier" ? key.name : String(key.value);
      if (name === "frag" && property.value.type === "Identifier") {
        shaderConstName = property.value.name;
      }
    }
  }
  if (shaderConstName && chunk.topDecls.has(shaderConstName)) {
    const decl = chunk.topDecls.get(shaderConstName);
    const shaderDeclId = decl.declarations.find((d) => d.id.name === shaderConstName)?.id;
    if (shaderDeclId) {
      allRenames.push({
        start: shaderDeclId.start,
        end: shaderDeclId.end,
        text: "FRAGMENT_SHADER",
      });
    }
    for (const [start, end] of freeRefs.get(shaderConstName) ?? []) {
      if (start === shaderDeclId?.start) continue;
      if (start >= regionStart && end <= regionEnd) {
        allRenames.push({ start, end, text: "FRAGMENT_SHADER" });
      }
    }
  }

  /* --- build the JSX element */
  let usedJsx = !convertible;
  if (convertible) {
    const [componentRef, propsObject] = call.arguments;
    const indentBase = lineIndent(chunk.text, returnStmt.start);
    const attrs = [];
    for (const property of propsObject.properties) {
      const key = property.key;
      const name = key.type === "Identifier" ? key.name : String(key.value);
      const value = property.value;
      if (value.type === "Literal" && typeof value.value === "boolean") {
        if (value.value) attrs.push(name);
        continue;
      }
      if (value.type === "Literal" && typeof value.value === "string") {
        attrs.push(`${name}=${JSON.stringify(value.value)}`);
        continue;
      }
      const raw = sliceWithRenames(chunk.text, allRenames, value.start, value.end).replace(
        /\s+/g,
        " ",
      );
      attrs.push(`${name}={${raw}}`);
    }
    const tag = componentRef.name;
    const oneLine = `<${tag} ${attrs.join(" ")} />`;
    const jsxText =
      oneLine.length + indentBase.length <= 88
        ? `return ${oneLine};`
        : [
            "return (",
            `${indentBase}  <${tag}`,
            ...attrs.map((a) => `${indentBase}    ${a}`),
            `${indentBase}  />`,
            `${indentBase});`,
          ].join("\n");
    allRenames.push({ start: returnStart, end: returnEnd, text: jsxText, keep: true });
  }

  /* --- renames used when slicing the region: the JSX replacement itself plus
         everything outside the return statement it covers */
  const regionRenames = allRenames.filter(
    (r) => r.keep || !(r.start >= returnStart && r.end <= returnEnd),
  );

  /* --- assemble the file */
  const depsText = included
    .map((node) => sliceWithRenames(chunk.text, regionRenames, node.start, node.end).trimEnd())
    .join("\n\n");
  const fnText = sliceWithRenames(chunk.text, regionRenames, fn.start, fn.end).trimEnd();

  const freeNames = new Set(freeRefs.keys());
  const engineImports = ENGINE_NAMES.filter((n) => freeNames.has(n));
  const usesReact = freeNames.has("React");
  if (convertible) freeNames.delete("jsx");
  const needsJsx = usedJsx || freeNames.has("jsx");

  const paramProps = fn.params[0].properties.map((property) => {
    const key = property.key;
    const name = key.type === "Identifier" ? key.name : String(key.value);
    const value = property.value.type === "AssignmentPattern" ? property.value.right : null;
    const fallbackText = value ? chunk.text.slice(value.start, value.end) : undefined;
    const described = meta.props.find((p) => p.prop === name);
    return { name, type: propType(meta, name, fallbackText), desc: described?.desc };
  });

  const lines = [
    "/**",
    ` * ${meta.name} — ${meta.desc}`,
    " *",
    " * Self-contained animated background: needs only React.",
    " * Extracted from getdesign.md/backgrounds.",
    " */",
    "// @ts-nocheck — the public props are typed, the internals are vendored as-is.",
  ];
  if (usesReact) lines.push('import * as React from "react";');
  if (needsJsx) lines.push('import { jsx } from "react/jsx-runtime";');
  if (engineImports.length) lines.push(`import { ${engineImports.join(", ")} } from "../engine";`);
  lines.push("");
  lines.push(`export interface ${propsName} {`);
  for (const prop of paramProps) {
    if (prop.desc) lines.push(`  /** ${prop.desc} */`);
    lines.push(`  ${prop.name}?: ${prop.type};`);
  }
  lines.push("}");
  if (depsText) {
    lines.push("");
    lines.push(depsText);
  }
  lines.push("");
  lines.push(fnText);
  lines.push("");

  return {
    id: meta.id,
    componentName,
    propsName,
    props: paramProps.map((p) => p.name),
    source: lines.join("\n"),
    deps: included.map((n) => chunk.text.slice(n.start, n.start + 40)),
  };
}

/* ------------------------------------------------------------------ */
/* Run                                                                 */
/* ------------------------------------------------------------------ */

const chunks = {
  "canvas-2d": prepareChunk(readFileSync(path.join(here, "vendor/canvas-effects.js"), "utf8")),
  webgl: prepareChunk(readFileSync(path.join(here, "vendor/webgl-effects.js"), "utf8")),
};

rmSync(fxDir, { recursive: true, force: true });
mkdirSync(fxDir, { recursive: true });

const generated = [];
for (const meta of BACKGROUNDS) {
  const fnName = meta.render(meta.defaults).type.name;
  const chunk = chunks["canvas-2d"].topDecls.has(fnName) ? chunks["canvas-2d"] : chunks["webgl"];
  const file = buildEffectFile(meta, chunk);
  writeFileSync(path.join(fxDir, `${meta.id}.tsx`), file.source);
  generated.push(file);
}

/* --- registry.ts -------------------------------------------------- */

const registryLines = [
  'import * as React from "react";',
  'import type { ReactElement } from "react";',
  ...generated.map((f) => `import { ${f.componentName}, type ${f.propsName} } from "./fx/${f.id}";`),
  "",
  '/** Accent color of the original getdesign.md dark theme. */',
  'export const ACCENT = "#ceff00";',
  "",
  "export type EffectValue = string | number;",
  "export type EffectValues = Record<string, EffectValue>;",
  "",
  "export interface EffectProp {",
  "  prop: string;",
  "  type: string;",
  "  def: string;",
  "  desc: string;",
  "}",
  "",
  "export type EffectControl =",
  '  | { key: string; label: string; kind: "color" }',
  '  | { key: string; label: string; kind: "text" }',
  '  | { key: string; label: string; kind: "range"; min: number; max: number; step: number }',
  '  | { key: string; label: string; kind: "segment"; options: string[] };',
  "",
  "export interface BackgroundEffect {",
  "  id: string;",
  "  name: string;",
  '  tech: "webgl" | "canvas-2d";',
  "  /** PascalCase component name exported from ./fx/<id>.tsx */",
  "  component: string;",
  "  desc: string;",
  '  /** Position on the original page, e.g. "/01". */',
  "  index: string;",
  "  props: EffectProp[];",
  "  defaults: EffectValues;",
  "  controls: EffectControl[];",
  "  render: (values: EffectValues) => ReactElement;",
  "}",
  "",
  "/** Map control values to component props (c0/c1/c2 → colors). */",
  "function toProps<T>(values: EffectValues): T {",
  "  const props: Record<string, unknown> = {};",
  "  for (const [key, value] of Object.entries(values)) {",
  '    if (key === "c0" || key === "c1" || key === "c2") continue;',
  "    props[key] = value;",
  "  }",
  '  if ("c0" in values) props.colors = [values.c0, values.c1, values.c2];',
  "  return props as T;",
  "}",
  "",
  "export const BACKGROUNDS: BackgroundEffect[] = [",
];
for (const meta of BACKGROUNDS) {
  const file = generated.find((g) => g.id === meta.id);
  registryLines.push("  {");
  registryLines.push(`    id: ${JSON.stringify(meta.id)},`);
  registryLines.push(`    name: ${JSON.stringify(meta.name)},`);
  registryLines.push(`    tech: ${JSON.stringify(meta.tech)},`);
  registryLines.push(`    component: ${JSON.stringify(file.componentName)},`);
  registryLines.push(`    desc: ${JSON.stringify(meta.desc)},`);
  registryLines.push(`    index: ${JSON.stringify(meta.index)},`);
  registryLines.push(`    props: ${indent(JSON.stringify(meta.props, null, 2), 4)},`);
  registryLines.push(`    defaults: ${indent(JSON.stringify(meta.defaults, null, 2), 4)},`);
  registryLines.push(`    controls: ${indent(JSON.stringify(meta.controls, null, 2), 4)},`);
  registryLines.push(
    `    render: (v) => React.createElement(${file.componentName}, toProps<${file.propsName}>(v)),`,
  );
  registryLines.push("  },");
}
registryLines.push("];");
registryLines.push("");
writeFileSync(path.join(root, "src/effects/registry.ts"), registryLines.join("\n"));

/* --- source-index.ts ---------------------------------------------- */

const indexLines = [
  'import engineSource from "./engine.tsx?raw";',
  ...generated.map((f) => `import ${camel(f.id)}Source from "./fx/${f.id}.tsx?raw";`),
  "",
  "/** Raw text of every generated effect module, plus the shared engine. */",
  "export const ENGINE_SOURCE: string = engineSource;",
  "",
  "export const EFFECT_SOURCES: Record<string, string> = {",
  ...generated.map((f) => `  ${JSON.stringify(f.id)}: ${camel(f.id)}Source,`),
  "};",
  "",
];
writeFileSync(path.join(root, "src/effects/source-index.ts"), indexLines.join("\n"));

console.log(`generated ${generated.length} effect modules`);
console.log(
  generated
    .map(
      (f) =>
        `${f.id.padEnd(16)} ${f.componentName.padEnd(16)} ${String(f.source.split("\n").length).padStart(4)} lines  deps:${f.deps.length}`,
    )
    .join("\n"),
);
