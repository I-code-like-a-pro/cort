// Frontend build and dev server (separate from the API server).
//   npm run dev     bundle, rebuild on save, and serve at http://127.0.0.1:5173
//   npm run build   one-off production bundle into public/ (static files)
//
// Two pages are built:
//   /            the Cort dashboard        (src/main.jsx           -> app.js, app.css)
//   /presenter.html   the slide pilot      (src/presenter/main.jsx -> presenter.js, presenter.css)
//
// API_URL   where the backend API lives      (default http://127.0.0.1:3000)
// PORT      port for this dev server          (default 5173)
import { build, context } from "esbuild";

const API_URL = process.env.API_URL || "http://127.0.0.1:3000";
const PORT = Number(process.env.PORT) || 5173;
const watch = process.argv.includes("--watch");

const options = {
  entryPoints: {
    app: "src/main.tsx",
    presenter: "src/presenter/main.tsx",
  },
  bundle: true,
  minify: !watch,
  outdir: "public",
  jsx: "automatic",
  target: "es2020",
  define: {
    "process.env.NODE_ENV": watch ? '"development"' : '"production"',
    __API_URL__: JSON.stringify(API_URL),
  },
  logLevel: "info",
};

if (watch) {
  const ctx = await context(options);
  await ctx.watch();
  await ctx.serve({ servedir: "public", host: "127.0.0.1", port: PORT });
  console.log(`Frontend running at http://127.0.0.1:${PORT}`);
  console.log(`Slide pilot at     http://127.0.0.1:${PORT}/presenter.html`);
  console.log(`It calls the API at ${API_URL}`);
} else {
  await build(options);
}
