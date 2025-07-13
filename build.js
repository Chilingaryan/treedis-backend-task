const { build } = require("esbuild");

build({
  entryPoints: ["./src/main.ts"],
  bundle: true,
  platform: "node",
  target: "node20",
  // outfile: "dist/main.js",
  outdir: "dist",
  sourcemap: true,
  format: "cjs",
  alias: { "@": "./src" },
}).catch(() => process.exit(1));
