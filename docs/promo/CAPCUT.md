# CapCut — clips under 16 seconds

CapCut’s AI voice / some import limits want **each clip shorter than 16 seconds**. This promo uses **9 slides × 8 seconds** — each slide is already safe.

## Record 9 short clips (recommended)

1. Open [`edutrack-platform-promo.html`](./edutrack-platform-promo.html) → **Fullscreen**.
2. Click **Clip mode** (toolbar turns teal).
3. Press **1** on the keyboard (jump to slide 1) or start on slide 1.
4. Start screen recording in CapCut or OBS.
5. Click **Play 8s clip** (or press **Space**) — one slide animates for 8s and **stops** (no auto-advance).
6. Stop recording → save as `clip-01.mp4` (under 16s).
7. Click **Next** → repeat for slides 2–9 (keys **2**–**9** jump to a slide).

Import all 9 clips into CapCut on the timeline in order.

## AI voice — 9 separate TTS clips

In CapCut: **Text → Text to speech**. Paste **one block at a time** from [`VOICEOVER.md`](./VOICEOVER.md) (section “CapCut copy-paste”). Generate audio for clip 1, place on timeline, then clip 2, etc.

Do **not** paste the full script in one go — split into 9 parts.

## If you already recorded one long video

Split with ffmpeg (9 × 8s, starting after 0s):

```powershell
cd docs\promo
mkdir clips -ErrorAction SilentlyContinue
ffmpeg -i edutrack-promo-full.mp4 -f segment -segment_time 8 -reset_timestamps 1 clips\clip-%02d.mp4
```

Rename so you have `clip-01` … `clip-09`. Each segment is 8 seconds (< 16s).

## CapCut assembly

1. Import `clip-01.mp4` … `clip-09.mp4` in order.
2. Add TTS audio per clip (or one WAV per slide from ElevenLabs).
3. Optional: light background music at low volume.
4. Export 1080p MP4.

## Timing reference

| Clip | Slide | Seconds |
|------|-------|---------|
| 01 | Title | 0–8 |
| 02 | Classroom / roles | 8–16 |
| 03 | Parents | 16–24 |
| 04 | Dashboard | 24–32 |
| 05 | Homework & exams | 32–40 |
| 06 | Attendance | 40–48 |
| 07 | Multi-school | 48–56 |
| 08 | Languages | 56–64 |
| 09 | Closing | 64–72 |
