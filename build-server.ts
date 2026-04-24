import * as esbuild from "esbuild";

esbuild
  .build({
    entryPoints: ["server.ts"],
    bundle: true,
    platform: "node",
    target: "node18",
    outfile: "dist/server.cjs",
    format: "cjs",
    external: ["express", "cors"], // exclude node_modules if needed, or bundle. It's safer to not bundle express natively if not needed, but since it's just 'express' we can exclude it. Actually better to bundle it if we didn't specify packages, wait: externalize all node_modules is common, but let's just let it bundle everything except native.
  })
  .catch(() => process.exit(1));
