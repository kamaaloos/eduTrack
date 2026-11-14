/**
 * Builds a polished docs/promo/how-edutrack-works.pptx with
 * slide transitions + entrance animations (injected into OOXML).
 *
 * Usage: node docs/promo/build-how-edutrack-works-pptx.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import JSZip from "jszip";
import PptxGenJS from "pptxgenjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outPath = path.join(__dirname, "how-edutrack-works.pptx");
const fallbackPath = path.join(__dirname, "how-edutrack-works-stunning.pptx");

const C = {
  ink: "071726",
  ink2: "0B1F33",
  soft: "3D4F63",
  muted: "6B7C8F",
  accent: "0E5A8A",
  accentHot: "1F8A70",
  sand: "E8F1F5",
  card: "F4F8FB",
  line: "C9D7E3",
  white: "FFFFFF",
  glow: "9ED0C2",
};

const pptx = new PptxGenJS();
pptx.defineLayout({ name: "WIDE", width: 13.333, height: 7.5 });
pptx.layout = "WIDE";
pptx.author = "eduTrack";
pptx.title = "How eduTrack Works";
pptx.subject = "Product walkthrough";

function bgLight(slide) {
  slide.addShape(pptx.shapes.RECTANGLE, {
    x: 0,
    y: 0,
    w: 13.333,
    h: 7.5,
    fill: { color: C.white },
  });
  slide.addShape(pptx.shapes.OVAL, {
    x: 9.8,
    y: -1.6,
    w: 5.2,
    h: 5.2,
    fill: { color: "E7F3EF" },
  });
  slide.addShape(pptx.shapes.OVAL, {
    x: -1.8,
    y: 4.8,
    w: 4.4,
    h: 4.4,
    fill: { color: "E4EEF6" },
  });
  slide.addShape(pptx.shapes.RECTANGLE, {
    x: 0,
    y: 0,
    w: 0.16,
    h: 7.5,
    fill: { color: C.accent },
  });
}

function bgDark(slide) {
  slide.addShape(pptx.shapes.RECTANGLE, {
    x: 0,
    y: 0,
    w: 13.333,
    h: 7.5,
    fill: { color: C.ink },
  });
  slide.addShape(pptx.shapes.OVAL, {
    x: 8.6,
    y: -2.2,
    w: 7,
    h: 7,
    fill: { color: "0D2A40" },
  });
  slide.addShape(pptx.shapes.OVAL, {
    x: -2.4,
    y: 3.8,
    w: 6,
    h: 6,
    fill: { color: "0A2235" },
  });
  slide.addShape(pptx.shapes.RECTANGLE, {
    x: 0.7,
    y: 6.85,
    w: 2.2,
    h: 0.1,
    fill: { color: C.accentHot },
  });
}

function eyebrow(slide, text, dark = false) {
  slide.addText(text.toUpperCase(), {
    x: 0.75,
    y: 0.38,
    w: 11.5,
    h: 0.32,
    fontSize: 12,
    fontFace: "Calibri",
    bold: true,
    color: dark ? C.glow : C.accent,
    charSpacing: 4,
  });
}

function heading(slide, text, opts = {}) {
  slide.addText(text, {
    x: 0.75,
    y: opts.y ?? 0.8,
    w: opts.w ?? 11.6,
    h: opts.h ?? 0.85,
    fontSize: opts.fontSize ?? 34,
    fontFace: "Calibri",
    bold: true,
    color: opts.color ?? C.ink2,
  });
}

function card(slide, x, y, w, h, title, body, accent = C.accent) {
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x,
    y,
    w,
    h,
    fill: { color: C.card },
    line: { color: C.line, width: 1 },
    rectRadius: 0.12,
    shadow: {
      type: "outer",
      color: "071726",
      blur: 10,
      offset: 3,
      opacity: 0.08,
    },
  });
  slide.addShape(pptx.shapes.RECTANGLE, {
    x,
    y,
    w: 0.1,
    h,
    fill: { color: accent },
  });
  slide.addText(title, {
    x: x + 0.28,
    y: y + 0.22,
    w: w - 0.45,
    h: 0.38,
    fontSize: 16,
    bold: true,
    color: C.ink2,
    fontFace: "Calibri",
  });
  slide.addText(body, {
    x: x + 0.28,
    y: y + 0.62,
    w: w - 0.45,
    h: h - 0.85,
    fontSize: 13,
    color: C.muted,
    fontFace: "Calibri",
    valign: "top",
  });
}

// 1 — Title
{
  const s = pptx.addSlide();
  bgDark(s);
  eyebrow(s, "Product walkthrough", true);
  s.addText("How eduTrack\nworks", {
    x: 0.75,
    y: 1.7,
    w: 9,
    h: 2.4,
    fontSize: 54,
    fontFace: "Calibri",
    bold: true,
    color: C.white,
  });
  s.addText(
    "One school platform for students, teachers, parents, and admins — on mobile and web, across many schools.",
    {
      x: 0.75,
      y: 4.35,
      w: 9.5,
      h: 1.1,
      fontSize: 18,
      fontFace: "Calibri",
      color: "B7C7D6",
    },
  );
  s.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 0.75,
    y: 5.8,
    w: 2.4,
    h: 0.48,
    fill: { color: C.accentHot },
    rectRadius: 0.08,
  });
  s.addText("Also branded as Dugsi", {
    x: 0.75,
    y: 5.8,
    w: 2.4,
    h: 0.48,
    fontSize: 12,
    bold: true,
    color: C.white,
    align: "center",
    valign: "middle",
    fontFace: "Calibri",
  });
}

// 2 — Architecture
{
  const s = pptx.addSlide();
  bgLight(s);
  eyebrow(s, "Architecture");
  heading(s, "Registry + school projects");
  s.addText("Pick a school → connect to that school’s data → sign in there.", {
    x: 0.75,
    y: 1.55,
    w: 11.5,
    h: 0.4,
    fontSize: 15,
    color: C.soft,
    fontFace: "Calibri",
  });

  const panels = [
    {
      x: 0.75,
      title: "Registry",
      accent: C.accent,
      lines: [
        "School list & logos",
        "Each school’s Firebase config",
        "Usage / expiry controls",
        "Super-admin platform access",
      ],
    },
    {
      x: 7.0,
      title: "School project",
      accent: C.accentHot,
      lines: [
        "Users, classes, and links",
        "Homework, exams, grades",
        "Attendance & remarks",
        "In-app notifications",
      ],
    },
  ];

  for (const p of panels) {
    s.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: p.x,
      y: 2.2,
      w: 5.5,
      h: 4.3,
      fill: { color: C.card },
      line: { color: C.line, width: 1 },
      rectRadius: 0.14,
      shadow: {
        type: "outer",
        color: "071726",
        blur: 12,
        offset: 4,
        opacity: 0.1,
      },
    });
    s.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: p.x + 0.35,
      y: 2.5,
      w: 1.7,
      h: 0.42,
      fill: { color: p.accent },
      rectRadius: 0.08,
    });
    s.addText(p.title, {
      x: p.x + 0.35,
      y: 2.5,
      w: 1.7,
      h: 0.42,
      fontSize: 13,
      bold: true,
      color: C.white,
      align: "center",
      valign: "middle",
      fontFace: "Calibri",
    });
    s.addText(
      p.lines.map((line) => ({ text: `•  ${line}`, options: { breakLine: true } })),
      {
        x: p.x + 0.45,
        y: 3.25,
        w: 4.6,
        h: 2.8,
        fontSize: 16,
        color: C.soft,
        fontFace: "Calibri",
        paraSpacing: 14,
      },
    );
  }
}

// 3 — Roles
{
  const s = pptx.addSlide();
  bgLight(s);
  eyebrow(s, "People");
  heading(s, "Roles in the school");
  const roles = [
    ["Student", "Homework, exams, grades, attendance, announcements", C.accent],
    ["Teacher", "Classes, attendance, homework/exams, remarks", C.accentHot],
    ["Parent", "Linked children, absence replies, school updates", C.accent],
    ["Admin", "Users, classes, import, appearance, notify", C.accentHot],
    ["Secretary", "Parent directory & fee operations", C.accent],
    ["Super admin", "Register schools & platform controls", C.accentHot],
  ];
  roles.forEach((role, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    card(
      s,
      0.75 + col * 4.1,
      1.85 + row * 2.45,
      3.9,
      2.2,
      role[0],
      role[1],
      role[2],
    );
  });
}

// 4 — Journey
{
  const s = pptx.addSlide();
  bgLight(s);
  eyebrow(s, "Getting in");
  heading(s, "First-run journey");
  const steps = [
    "Open the app (onboarding if needed)",
    "Choose your school from the registry",
    "Sign in with school email & password",
    "Land on your role dashboard",
  ];
  steps.forEach((text, i) => {
    const y = 1.85 + i * 1.15;
    s.addShape(pptx.shapes.OVAL, {
      x: 0.85,
      y: y + 0.05,
      w: 0.62,
      h: 0.62,
      fill: { color: i % 2 ? C.accentHot : C.accent },
      shadow: {
        type: "outer",
        color: "071726",
        blur: 8,
        offset: 2,
        opacity: 0.15,
      },
    });
    s.addText(String(i + 1), {
      x: 0.85,
      y: y + 0.05,
      w: 0.62,
      h: 0.62,
      fontSize: 18,
      bold: true,
      color: C.white,
      align: "center",
      valign: "middle",
      fontFace: "Calibri",
    });
    s.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 1.75,
      y,
      w: 10.4,
      h: 0.78,
      fill: { color: C.card },
      line: { color: C.line, width: 1 },
      rectRadius: 0.1,
    });
    s.addText(text, {
      x: 2.05,
      y,
      w: 9.8,
      h: 0.78,
      fontSize: 18,
      color: C.ink2,
      valign: "middle",
      fontFace: "Calibri",
    });
  });
}

// 5 — Daily loop
{
  const s = pptx.addSlide();
  bgLight(s);
  eyebrow(s, "School day");
  heading(s, "The daily loop");
  const items = [
    ["Attendance", "Teacher marks class; parents can be notified"],
    ["Homework & exams", "Published to students (and often parents)"],
    ["Progress", "Grades, remarks, and report cards"],
    ["Communications", "Announcements, in-app alerts, mobile push"],
  ];
  items.forEach((item, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    card(
      s,
      0.75 + col * 6.15,
      1.9 + row * 2.4,
      5.9,
      2.15,
      item[0],
      item[1],
      i % 2 ? C.accentHot : C.accent,
    );
  });
}

// 6 — Admin
{
  const s = pptx.addSlide();
  bgLight(s);
  eyebrow(s, "Operations");
  heading(s, "What admins run");
  const items = [
    ["Accounts", "Create users, set temp passwords, QR / print cards"],
    ["Structure", "Classes + student / teacher / parent links"],
    ["Import", "Excel bulk setup for users and relations"],
    ["Brand", "School colors and fonts (appearance)"],
  ];
  items.forEach((item, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    card(
      s,
      0.75 + col * 6.15,
      1.9 + row * 2.4,
      5.9,
      2.15,
      item[0],
      item[1],
      i % 2 ? C.accentHot : C.accent,
    );
  });
}

// 7 — Families
{
  const s = pptx.addSlide();
  bgLight(s);
  eyebrow(s, "Parents");
  heading(s, "Parent ↔ student model");
  const panels = [
    {
      x: 0.75,
      title: "Links",
      accent: C.accent,
      lines: [
        "One student → one parent (replace with confirm)",
        "One parent → many students",
        "Detail shows children + their classes",
      ],
    },
    {
      x: 7.0,
      title: "Parent view",
      accent: C.accentHot,
      lines: [
        "Follow linked children’s progress",
        "Respond to absence requests",
        "Receive school announcements & alerts",
      ],
    },
  ];
  for (const p of panels) {
    s.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: p.x,
      y: 1.9,
      w: 5.5,
      h: 4.5,
      fill: { color: C.card },
      line: { color: C.line, width: 1 },
      rectRadius: 0.14,
      shadow: {
        type: "outer",
        color: "071726",
        blur: 12,
        offset: 4,
        opacity: 0.1,
      },
    });
    s.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: p.x + 0.35,
      y: 2.25,
      w: 1.8,
      h: 0.42,
      fill: { color: p.accent },
      rectRadius: 0.08,
    });
    s.addText(p.title, {
      x: p.x + 0.35,
      y: 2.25,
      w: 1.8,
      h: 0.42,
      fontSize: 13,
      bold: true,
      color: C.white,
      align: "center",
      valign: "middle",
      fontFace: "Calibri",
    });
    s.addText(
      p.lines.map((line) => ({ text: `•  ${line}`, options: { breakLine: true } })),
      {
        x: p.x + 0.45,
        y: 3.05,
        w: 4.7,
        h: 2.8,
        fontSize: 16,
        color: C.soft,
        fontFace: "Calibri",
        paraSpacing: 16,
      },
    );
  }
}

// 8 — Platforms
{
  const s = pptx.addSlide();
  bgLight(s);
  eyebrow(s, "Delivery");
  heading(s, "Platforms & brands");
  const items = [
    ["Android / iOS / Web", "Same Expo codebase everywhere"],
    ["eduTrack or Dugsi", "Brand via build-time settings"],
    ["Web hosting", "Static export to Firebase Hosting"],
    ["Security", "Firestore rules per school + registry"],
  ];
  items.forEach((item, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    card(
      s,
      0.75 + col * 6.15,
      1.9 + row * 2.4,
      5.9,
      2.15,
      item[0],
      item[1],
      i % 2 ? C.accentHot : C.accent,
    );
  });
}

// 9 — Close
{
  const s = pptx.addSlide();
  bgDark(s);
  eyebrow(s, "Summary", true);
  s.addText("One app.\nMany schools.", {
    x: 0.75,
    y: 1.9,
    w: 11,
    h: 2.2,
    fontSize: 52,
    bold: true,
    color: C.white,
    fontFace: "Calibri",
  });
  s.addText(
    "Pick a school → role-based school life: academics, attendance, family links, and admin ops.",
    {
      x: 0.75,
      y: 4.4,
      w: 10.5,
      h: 0.9,
      fontSize: 20,
      color: "B7C7D6",
      fontFace: "Calibri",
    },
  );
  s.addText("Super-admin keeps the platform; each school keeps its own data.", {
    x: 0.75,
    y: 5.5,
    w: 10.5,
    h: 0.45,
    fontSize: 15,
    color: "8FA3B5",
    fontFace: "Calibri",
  });
}

const draftPath = path.join(__dirname, ".how-edutrack-works.draft.pptx");
await pptx.writeFile({ fileName: draftPath });

/** ---- Inject transitions + entrance animations into OOXML ---- */

const TRANSITIONS = [
  `<p:transition spd="med" advClick="1"><p:fade/></p:transition>`,
  `<p:transition spd="med" advClick="1"><p:push dir="l"/></p:transition>`,
  `<p:transition spd="med" advClick="1"><p:wipe dir="l"/></p:transition>`,
  `<p:transition spd="med" advClick="1"><p:cover dir="u"/></p:transition>`,
  `<p:transition spd="med" advClick="1"><p:fade/></p:transition>`,
  `<p:transition spd="med" advClick="1"><p:push dir="u"/></p:transition>`,
  `<p:transition spd="med" advClick="1"><p:wipe dir="d"/></p:transition>`,
  `<p:transition spd="med" advClick="1"><p:cover dir="r"/></p:transition>`,
  `<p:transition spd="slow" advClick="1"><p:fade throughBlack="1"/></p:transition>`,
];

function collectShapeIds(slideXml) {
  const ids = [];
  const re = /<p:cNvPr id="(\d+)"/g;
  let match;
  while ((match = re.exec(slideXml))) {
    const id = Number(match[1]);
    if (id > 1) ids.push(id);
  }
  // Keep content shapes; skip very early chrome if needed by taking unique sorted
  return [...new Set(ids)].sort((a, b) => a - b);
}

function buildTimingXml(shapeIds) {
  // Animate later / larger content shapes so backgrounds stay put.
  // Skip the first few shapes (bg washes / accent bar) when there are many.
  const skip = shapeIds.length > 8 ? Math.min(4, shapeIds.length - 6) : 0;
  const targets = shapeIds.slice(skip);
  if (targets.length === 0) return "";

  let nextId = 3;
  const animPars = targets
    .map((spid, index) => {
      const delay = index === 0 ? "200" : "220";
      const nodeType = index === 0 ? "withEffect" : "afterEffect";
      const cTnId = nextId++;
      const effectId = nextId++;
      const setId = nextId++;
      return `
      <p:par>
        <p:cTn id="${cTnId}" fill="hold" presetID="10" presetClass="entr" presetSubtype="0" grpId="0" nodeType="${nodeType}">
          <p:stCondLst>
            <p:cond delay="${delay}"/>
          </p:stCondLst>
          <p:childTnLst>
            <p:animEffect transition="in" filter="fade">
              <p:cBhvr>
                <p:cTn id="${effectId}" dur="450"/>
                <p:tgtEl><p:spTgt spid="${spid}"/></p:tgtEl>
              </p:cBhvr>
            </p:animEffect>
            <p:set>
              <p:cBhvr>
                <p:cTn id="${setId}" dur="1" fill="hold">
                  <p:stCondLst><p:cond delay="0"/></p:stCondLst>
                </p:cTn>
                <p:tgtEl><p:spTgt spid="${spid}"/></p:tgtEl>
                <p:attrNameLst><p:attrName>style.visibility</p:attrName></p:attrNameLst>
              </p:cBhvr>
              <p:to><p:strVal val="visible"/></p:to>
            </p:set>
          </p:childTnLst>
        </p:cTn>
      </p:par>`;
    })
    .join("");

  return `
<p:timing>
  <p:tnLst>
    <p:par>
      <p:cTn id="1" dur="indefinite" restart="never" nodeType="tmRoot">
        <p:childTnLst>
          <p:seq concurrent="1" nextAc="seek">
            <p:cTn id="2" dur="indefinite" nodeType="mainSeq">
              <p:childTnLst>
                ${animPars}
              </p:childTnLst>
            </p:cTn>
            <p:prevCondLst>
              <p:cond evt="onPrev" delay="0">
                <p:tgtEl><p:sldTgt/></p:tgtEl>
              </p:cond>
            </p:prevCondLst>
            <p:nextCondLst>
              <p:cond evt="onNext" delay="0">
                <p:tgtEl><p:sldTgt/></p:tgtEl>
              </p:cond>
            </p:nextCondLst>
          </p:seq>
        </p:childTnLst>
      </p:cTn>
    </p:par>
  </p:tnLst>
</p:timing>`;
}

const zip = await JSZip.loadAsync(fs.readFileSync(draftPath));
const slideFiles = Object.keys(zip.files)
  .filter((name) => /^ppt\/slides\/slide\d+\.xml$/.test(name))
  .sort((a, b) => {
    const na = Number(a.match(/slide(\d+)/)[1]);
    const nb = Number(b.match(/slide(\d+)/)[1]);
    return na - nb;
  });

for (let i = 0; i < slideFiles.length; i++) {
  const file = slideFiles[i];
  let xml = await zip.file(file).async("string");
  // Remove any existing transition/timing
  xml = xml.replace(/<p:transition[\s\S]*?<\/p:transition>/g, "");
  xml = xml.replace(/<p:timing[\s\S]*?<\/p:timing>/g, "");

  const shapeIds = collectShapeIds(xml);
  const transition = TRANSITIONS[i % TRANSITIONS.length];
  const timing = buildTimingXml(shapeIds);
  xml = xml.replace(
    "</p:sld>",
    `${transition}${timing}</p:sld>`,
  );
  zip.file(file, xml);
}

const polished = await zip.generateAsync({
  type: "nodebuffer",
  compression: "DEFLATE",
});

let finalPath = outPath;
try {
  fs.writeFileSync(outPath, polished);
} catch (err) {
  if (err && err.code === "EBUSY") {
    finalPath = fallbackPath;
    fs.writeFileSync(fallbackPath, polished);
    console.warn(
      `Locked: ${outPath}\nWrote instead → ${fallbackPath}\nClose the open PPTX and re-run to replace the main file.`,
    );
  } else {
    throw err;
  }
}

try {
  fs.unlinkSync(draftPath);
} catch {
  /* ignore */
}

console.log(`Wrote polished deck with transitions/animations → ${finalPath}`);
