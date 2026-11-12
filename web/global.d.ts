// Injected by build.mjs's esbuild `define` from the API_URL env var.
declare const __API_URL__: string;

// Side-effect CSS imports (esbuild bundles these; tsc just needs to know
// the specifier resolves to something).
declare module "*.css";
