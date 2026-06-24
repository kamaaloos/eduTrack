/**
 * Create web-optimized promo clips (no system ffmpeg required).
 * Uses the ffmpeg-static npm package.
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ffmpegPath from "ffmpeg-static";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const jobs = [
  { input: "assets/edutrack.mp4", output: "assets/edutrack-web.mp4" },
  { input: "assets/edutrack2.mp4", output: "assets/edutrack2-web.mp4" },
  { input: "assets/edutrack-ar.mp4", output: "assets/edutrack-ar-web.mp4" },
  { input: "assets/edutrack-promo2-full.mp4", output: "assets/edutrack-promo2.mp4", crf: 32 },
];

if (!ffmpegPath || !fs.existsSync(ffmpegPath)) {
  console.error("[encode-web-video] ffmpeg binary not found (ffmpeg-static).");
  process.exit(1);
}

function encodeWebVideo({ input: inputRel, output: outputRel, crf = 28 }) {
  const input = path.join(root, inputRel);
  const output = path.join(root, outputRel);

  if (!fs.existsSync(input)) {
    console.warn(`[encode-web-video] skipping missing input: ${inputRel}`);
    return false;
  }

  const args = [
    "-y",
    "-i",
    input,
    "-c:v",
    "libx264",
    "-profile:v",
    "main",
    "-vf",
    "scale=w='min(1280,iw)':h='min(1280,ih)':force_original_aspect_ratio=decrease",
    "-crf",
    String(crf),
    "-c:a",
    "aac",
    "-b:a",
    "128k",
    "-movflags",
    "+faststart",
    output,
  ];

  console.log(`[encode-web-video] ${inputRel} → ${outputRel} (crf ${crf}) …`);
  const result = spawnSync(ffmpegPath, args, { stdio: "inherit" });

  if (result.status !== 0) {
    console.error(`[encode-web-video] ffmpeg failed for ${inputRel}`);
    process.exit(result.status ?? 1);
  }

  const sizeMb = (fs.statSync(output).size / (1024 * 1024)).toFixed(1);
  console.log(`[encode-web-video] done ${outputRel} (${sizeMb} MB)`);
  return true;
}

let encoded = 0;
for (const job of jobs) {
  if (encodeWebVideo(job)) {
    encoded++;
  }
}

if (encoded === 0) {
  console.error("[encode-web-video] no inputs found");
  process.exit(1);
}

console.log("[encode-web-video] finished. Run: npm run prepare:web-videos");
