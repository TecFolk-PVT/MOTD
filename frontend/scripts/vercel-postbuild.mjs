import { copyFileSync, existsSync } from "fs";
import { join } from "path";

const nextDir = join(process.cwd(), ".next");
const routesManifest = join(nextDir, "routes-manifest.json");
const deterministicManifest = join(nextDir, "routes-manifest-deterministic.json");

if (!existsSync(routesManifest)) {
  console.error(
    "[vercel-postbuild] Missing routes-manifest.json at",
    routesManifest
  );
  process.exit(1);
}

copyFileSync(routesManifest, deterministicManifest);
console.log("[vercel-postbuild] Created routes-manifest-deterministic.json");
