/// <reference types="vite/client" />

/** Vite's `?raw` imports, used to display effect source code in the UI. */
declare module "*?raw" {
  const source: string;
  export default source;
}
