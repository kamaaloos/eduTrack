/**
 * Copies promo videos into public/videos/ for web static serving (HTTP range requests).
 * Skips copy when the destination is newer than or same age as the source.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "public", "videos");

const copies = [
  { src: "assets/edutrack-promo2.mp4", dest: "edutrack-promo2.mp4", optional: true },
  { src: "assets/edutrack2-web.mp4", dest: "edutrack2-web.mp4", optional: true },
  { src: "assets/edutrack2.mp4", dest: "edutrack2.mp4", optional: true },
  { src: "assets/edutrack-ar-web.mp4", dest: "edutrack-ar-web.mp4", optional: true },
  { src: "assets/edutrack-ar.mp4", dest: "edutrack-ar.mp4", optional: true },
];

function shouldCopy(srcPath, destPath) {
  if (!fs.existsSync(destPath)) return true;
  const srcStat = fs.statSync(srcPath);
  const destStat = fs.statSync(destPath);
  return srcStat.mtimeMs > destStat.mtimeMs || srcStat.size !== destStat.size;
}

fs.mkdirSync(outDir, { recursive: true });

let copied = 0;
for (const { src, dest, optional } of copies) {
  const srcPath = path.join(root, src);
  const destPath = path.join(outDir, dest);
  if (!fs.existsSync(srcPath)) {
    if (!optional) {
      console.warn(`[sync-web-videos] missing source: ${src}`);
    }
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
  console.log("[sync-web-videos] videos up to date");
}
