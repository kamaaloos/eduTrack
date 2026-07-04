# EduTrack promo materials

| File | Purpose |
|------|---------|
| [`edutrack-platform-promo.html`](./edutrack-platform-promo.html) | Auto-playing slide deck — **screen-record this** to create an MP4 |
| [`VOICEOVER.md`](./VOICEOVER.md) | Narration script timed to each slide (English) |
| [`VOICEOVER.fi.md`](./VOICEOVER.fi.md) | Same script in Finnish |
| [`VOICEOVER.so.md`](./VOICEOVER.so.md) | Same script in Somali |
| [`CAPCUT.md`](./CAPCUT.md) | 9 clips under 16s + CapCut TTS workflow |

## Quick start

```text
Open docs/promo/edutrack-platform-promo.html in a browser
→ Fullscreen
→ Start screen recorder
→ Auto-play runs ~72 seconds (9 slides × 8 s)

Screenshots live in `docs/promo/assets/` (classroom, parent app, dashboard, homework, exams, attendance).
```

Controls: **Space** = pause/play, **Arrow keys** = prev/next.

The logo loads from `assets/images/edutrack-logo.png` when opened from the repo (relative path).

## Web landing hero video

The landing page serves promo clips from `public/videos/` (static files with HTTP range support — much smoother than bundling a 120 MB file through Metro).

```bash
npm run prepare:web-videos
```

For acceptable web performance, create a web-optimized encode (target under ~15 MB, fast-start moov atom).

**No system ffmpeg?** Use the project script (bundled binary via `ffmpeg-static`):

```bash
npm run encode:web-video
```

Or, if `ffmpeg` is installed on your PATH:

```bash
ffmpeg -i assets/edutrack2.mp4 -c:v libx264 -profile:v main -vf "scale=1280:-2" -crf 28 -c:a aac -b:a 128k -movflags +faststart assets/edutrack2-web.mp4
npm run prepare:web-videos
```

The player prefers web-optimized encodes (`*-web.mp4`) when present, otherwise falls back to the full-size originals.

`npm run encode:web-video` compresses:

- **eduTrack:** onboarding (`edutrack.mp4` → `edutrack-web.mp4`), web landing (`edutrack2.mp4` → `edutrack2-web.mp4`), Arabic (`edutrack-ar.mp4` → `edutrack-ar-web.mp4`), and optional landing promo (`edutrack-promo2-full.mp4` → `edutrack-promo2.mp4`).
- **Dugsi:** all four language promos (`dugsi.mp4`, `dugsi-ar.mp4`, `dugsi-so.mp4`, `dugsi-fi.mp4` → matching `*-web.mp4`).

Video selection is brand- and language-aware (`src/constants/promoVideos.ts`): native onboarding and web landing pick the clip for the active language; eduTrack Somali/Finnish fall back to English.
