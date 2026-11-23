/**
 * Verifies that the standalone (zero-dependency) source shown in the UI is
 * self-contained: after stripping TypeScript/JSX, every free identifier is
 * either a browser/JS global or React — never an unimported module binding.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { transform } from "esbuild";
import { parse } from "acorn";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");

const GLOBALS = new Set([
  "React", "document", "window", "performance", "getComputedStyle", "matchMedia",
  "requestAnimationFrame", "cancelAnimationFrame", "ResizeObserver", "IntersectionObserver",
  "console", "JSON", "Math", "Number", "String", "Boolean", "Object", "Array", "Set", "Map",
  "isNaN", "parseInt", "parseFloat", "Float32Array", "Promise", "URL", "Blob", "localStorage",
  "HTMLCanvasElement", "PointerEvent", "WebGLRenderingContext", "undefined", "arguments",
]);

/* scope-aware free identifier collection (same rules as the generator) */
function patternNames(node, into) {
  if (!node) return;
  if (node.type === "Identifier") { into.add(node.name); return; }
  if (node.type === "ObjectPattern") { node.properties.forEach((p) => patternNames(p.value ?? p.argument, into)); return; }
  if (node.type === "ArrayPattern") { node.elements.forEach((e) => patternNames(e, into)); return; }
  if (node.type === "AssignmentPattern") { patternNames(node.left, into); return; }
  if (node.type === "RestElement") { patternNames(node.argument, into); return; }
}
function visit(node, scopes, refs) {
  if (!node || typeof node.type !== "string") return;
  switch (node.type) {
    case "Identifier":
      if (!scopes.some((s) => s.has(node.name))) refs.add(node.name);
      return;
    case "FunctionDeclaration": case "FunctionExpression": case "ArrowFunctionExpression":
      if (node.id) scopes[scopes.length - 1].add(node.id.name);
      { const inner = new Set(); node.params.forEach((p) => patternNames(p, inner)); scopes.push(inner); visit(node.body, scopes, refs); scopes.pop(); }
      return;
    case "VariableDeclaration":
      node.declarations.forEach((d) => { patternNames(d.id, scopes[scopes.length - 1]); if (d.init) visit(d.init, scopes, refs); });
      return;
    case "MemberExpression":
      visit(node.object, scopes, refs);
      if (node.computed) visit(node.property, scopes, refs);
      return;
    case "Property":
      if (node.computed) visit(node.key, scopes, refs);
      visit(node.value, scopes, refs);
      return;
    case "AssignmentExpression": case "UpdateExpression": {
      const target = node.type === "AssignmentExpression" ? node.left : node.argument;
      if (target.type === "Identifier" || /Pattern$/.test(target.type)) patternNames(target, scopes[scopes.length - 1]);
      else visit(target, scopes, refs);
      if (node.right) visit(node.right, scopes, refs);
      return;
    }
    case "CatchClause":
      if (node.param) patternNames(node.param, scopes[scopes.length - 1]);
      visit(node.body, scopes, refs);
      return;
    case "ImportDeclaration": case "ExportNamedDeclaration": return;
    default:
      for (const key of Object.keys(node)) {
        if (key === "type" || key === "start" || key === "end" || key === "loc") continue;
        const value = node[key];
        if (Array.isArray(value)) value.forEach((v) => visit(v, scopes, refs));
        else if (value && typeof value.type === "string") visit(value, scopes, refs);
      }
  }
}
function freeIdentifiers(js) {
  const ast = parse(js, { ecmaVersion: "latest", sourceType: "module" });
  // Module scope: import bindings + every top-level declaration.
  const moduleScope = new Set();
  const declared = [];
  for (const node of ast.body) {
    if (node.type === "ImportDeclaration") {
      node.specifiers.forEach((spec) => moduleScope.add(spec.local.name));
      continue;
    }
    if (node.type === "FunctionDeclaration" && node.id) { moduleScope.add(node.id.name); declared.push(node); continue; }
    if (node.type === "VariableDeclaration") {
      node.declarations.forEach((d) => patternNames(d.id, moduleScope));
    }
    declared.push(node);
  }
  const refs = new Set();
  for (const node of declared) {
    const scopes = [new Set(moduleScope)];
    if (node.type === "FunctionDeclaration") {
      node.params.forEach((p) => patternNames(p, scopes[0]));
      visit(node.body, scopes, refs);
    } else visit(node, scopes, refs);
  }
  return refs;
}

const engineSource = readFileSync(path.join(root, "src/effects/engine.tsx"), "utf8");
const { code: engineJs } = await transform(engineSource, { loader: "tsx", format: "esm" });
const engineFree = freeIdentifiers(engineJs);
const engineBad = [...engineFree].filter((n) => !GLOBALS.has(n));
console.log("engine free identifiers:", [...engineFree].join(", ") || "(none)");
if (engineBad.length) { console.error("ENGINE UNRESOLVED:", engineBad); process.exit(1); }

const ids = readFileSync(path.join(root, "src/effects/registry.ts"), "utf8")
  .split("\n")
  .map((l) => l.match(/^\s*id: "([a-z-]+)",/))
  .filter(Boolean)
  .map((m) => m[1]);

let failures = 0;
for (const id of ids) {
  const raw = readFileSync(path.join(root, `src/effects/fx/${id}.tsx`), "utf8");
  const body = raw.replace(/^\/\*\*[\s\S]*?\*\//, "").split("\n")
    .filter((line) => !/^import\s/.test(line)).join("\n").trim();
  const standalone = `${engineSource}\n\n${body}`;

  // 1. the standalone must not import anything besides React (already in engine)
  const importLines = [...standalone.matchAll(/^import[^\n]*$/gm)].map((m) => m[0]);
  const badImports = importLines.filter((l) => !/from "react(\/jsx-runtime)?"/.test(l));
  // 2. after transform, every free identifier must resolve
  const { code: js } = await transform(standalone, { loader: "tsx", format: "esm" });
  const free = freeIdentifiers(js);
  const unresolved = [...free].filter((n) => !GLOBALS.has(n));
  const problems = [
    ...(badImports.length ? [`unexpected imports: ${badImports.join(" | ")}`] : []),
    ...(unresolved.length ? [`unresolved identifiers: ${unresolved.join(", ")}`] : []),
  ];
  if (problems.length) { failures++; console.error(`✗ ${id}: ${problems.join("; ")}`); }
}
console.log(failures ? `${failures} effect(s) failed` : `all ${ids.length} standalone sources are self-contained ✓`);
process.exit(failures ? 1 : 0);
