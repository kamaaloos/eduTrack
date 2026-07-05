/**
 * Copies web-optimized promo videos into public/videos/ for static serving.
 * Only syncs the active brand (EXPO_PUBLIC_APP_BRAND) and *-web / promo clips —
 * never full-size source masters.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "public", "videos");

/** Match Expo CLI: read `.env` when this script runs before `expo export`. */
function loadDotEnv() {
  const envPath = path.join(root, ".env");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    if (process.env[key] !== undefined) continue;
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
}

loadDotEnv();

const brand =
  process.env.EXPO_PUBLIC_APP_BRAND?.trim().toLowerCase() === "dugsi"
    ? "dugsi"
    : "edutrack";

/** @type {{ src: string; dest: string }[]} */
const copiesByBrand = {
  edutrack: [
    { src: "assets/edutrack-promo2.mp4", dest: "edutrack-promo2.mp4" },
    { src: "assets/edutrack2-web.mp4", dest: "edutrack2-web.mp4" },
    { src: "assets/edutrack-ar-web.mp4", dest: "edutrack-ar-web.mp4" },
  ],
  dugsi: [
    { src: "assets/dugsi-web.mp4", dest: "dugsi-web.mp4" },
    { src: "assets/dugsi-ar-web.mp4", dest: "dugsi-ar-web.mp4" },
    { src: "assets/dugsi-so-web.mp4", dest: "dugsi-so-web.mp4" },
    { src: "assets/dugsi-fi-web.mp4", dest: "dugsi-fi-web.mp4" },
  ],
};

const copies = copiesByBrand[brand];

function shouldCopy(srcPath, destPath) {
  if (!fs.existsSync(destPath)) return true;
  const srcStat = fs.statSync(srcPath);
  const destStat = fs.statSync(destPath);
  return srcStat.mtimeMs > destStat.mtimeMs || srcStat.size !== destStat.size;
}

fs.mkdirSync(outDir, { recursive: true });

const allowedDests = new Set(copies.map(({ dest }) => dest));

// Remove stale clips from the other brand or old full-size fallbacks
for (const entry of fs.readdirSync(outDir)) {
  if (!entry.endsWith(".mp4")) continue;
  if (!allowedDests.has(entry)) {
    fs.unlinkSync(path.join(outDir, entry));
    console.log(`[sync-web-videos] removed stale ${entry}`);
  }
}

let copied = 0;
for (const { src, dest } of copies) {
  const srcPath = path.join(root, src);
  const destPath = path.join(outDir, dest);
  if (!fs.existsSync(srcPath)) {
    console.warn(`[sync-web-videos] missing source: ${src}`);
    continue;
  }
  if (!shouldCopy(srcPath, destPath)) {
    continue;
  }
  fs.copyFileSync(srcPath, destPath);
  copied++;
  console.log(`[sync-web-videos] copied ${src} → public/videos/${dest}`);
}

if (copied === 0) {
  console.log(`[sync-web-videos] ${brand} videos up to date`);
} else {
  console.log(`[sync-web-videos] synced ${brand} (${copied} updated)`);
}
