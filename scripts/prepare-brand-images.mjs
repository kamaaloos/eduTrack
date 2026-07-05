/**
 * Resize high-res brand artwork to Expo-friendly sizes (matches eduTrack assets).
 * Archives originals as *.source.png on first run, then writes optimized outputs.
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ffmpegPath from "ffmpeg-static";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/** @type {{ source: string; output: string; size: number }[]} */
const jobs = [
  {
    source: "assets/images/dugsi-icon.source.png",
    output: "assets/images/dugsi-icon.png",
    size: 640,
  },
  {
    source: "assets/images/dugsi-logo.source.png",
    output: "assets/images/dugsi-logo.png",
    size: 640,
  },
];

if (!ffmpegPath || !fs.existsSync(ffmpegPath)) {
  console.error("[prepare-brand-images] ffmpeg binary not found (ffmpeg-static).");
  process.exit(1);
}

function ensureSource(sourceRel, outputRel) {
  const sourcePath = path.join(root, sourceRel);
  const outputPath = path.join(root, outputRel);

  if (fs.existsSync(sourcePath)) {
    return true;
  }

  if (fs.existsSync(outputPath)) {
    fs.copyFileSync(outputPath, sourcePath);
    console.log(`[prepare-brand-images] archived ${outputRel} → ${sourceRel}`);
    return true;
  }

  console.warn(`[prepare-brand-images] missing source: ${sourceRel}`);
  return false;
}

function resizePng({ sourceRel, outputRel, size }) {
  const sourcePath = path.join(root, sourceRel);
  const outputPath = path.join(root, outputRel);

  if (!fs.existsSync(sourcePath)) {
    return false;
  }

  const args = [
    "-y",
    "-i",
    sourcePath,
    "-vf",
    `scale=${size}:${size}:force_original_aspect_ratio=decrease,pad=${size}:${size}:(ow-iw)/2:(oh-ih)/2:color=0x00000000`,
    "-frames:v",
    "1",
    "-update",
    "1",
    outputPath,
  ];

  console.log(
    `[prepare-brand-images] ${sourceRel} → ${outputRel} (${size}×${size}) …`,
  );
  const result = spawnSync(ffmpegPath, args, { stdio: "inherit" });

  if (result.status !== 0) {
    console.error(`[prepare-brand-images] ffmpeg failed for ${sourceRel}`);
    process.exit(result.status ?? 1);
  }

  const kb = Math.round(fs.statSync(outputPath).size / 1024);
  console.log(`[prepare-brand-images] done ${outputRel} (${kb} KB)`);
  return true;
}

let processed = 0;
for (const job of jobs) {
  if (!ensureSource(job.source, job.output)) {
    continue;
  }
  if (resizePng({ sourceRel: job.source, outputRel: job.output, size: job.size })) {
    processed++;
  }
}

if (processed === 0) {
  console.warn("[prepare-brand-images] no images processed");
  process.exit(1);
}

console.log("[prepare-brand-images] finished");
