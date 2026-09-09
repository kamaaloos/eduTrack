import { spawnSync } from "child_process";
import fs from "fs";
import path from "path";
import { REPO_ROOT, logStep } from "./school-provision-lib.mjs";

/** Must be present on every school Firebase project (`functions:school`). */
export const REQUIRED_SCHOOL_FUNCTIONS = [
  "setSchoolUserPassword",
  "requestSchoolPasswordReset",
  "removeSchoolUser",
  "sendPushOnNotificationCreated",
];

/** Markers that current firestore.rules should contain when deployed. */
export const REQUIRED_RULES_MARKERS = [
  "subscriptionEntitled",
  "expoPushToken",
];

/**
 * Parse `firebase --json functions:list` payload into function id strings.
 * Accepts several CLI shapes across firebase-tools versions.
 */
export function parseFunctionsListJson(payload) {
  if (!payload || typeof payload !== "object") return [];

  const result = payload.result ?? payload;
  const rawList = Array.isArray(result)
    ? result
    : Array.isArray(result?.functions)
      ? result.functions
      : Array.isArray(payload.functions)
        ? payload.functions
        : [];

  const names = new Set();
  for (const entry of rawList) {
    if (typeof entry === "string") {
      names.add(entry.split("/").pop() ?? entry);
      continue;
    }
    if (!entry || typeof entry !== "object") continue;
    const id =
      entry.id ??
      entry.name ??
      entry.functionId ??
      entry.functionName ??
      "";
    if (typeof id === "string" && id.trim()) {
      const short = id.includes("/") ? id.split("/").pop() : id;
      names.add(short);
    }
  }
  return [...names];
}

/** Fallback when --json is unavailable: scrape table / plain text. */
export function parseFunctionsListText(text) {
  const names = new Set();
  for (const required of REQUIRED_SCHOOL_FUNCTIONS) {
    if (text.includes(required)) names.add(required);
  }
  return [...names];
}

export function loadExpectedIndexes(indexesPath = path.join(REPO_ROOT, "firestore.indexes.json")) {
  const raw = JSON.parse(fs.readFileSync(indexesPath, "utf8"));
  return Array.isArray(raw.indexes) ? raw.indexes : [];
}

export function indexKey(index) {
  const collection = index.collectionGroup ?? index.collectionId ?? "";
  const fields = (index.fields ?? [])
    .map((f) => {
      const path = f.fieldPath ?? "";
      const order = f.order ?? f.arrayConfig ?? "";
      return `${path}:${order}`;
    })
    .join(",");
  return `${collection}|${fields}`;
}

export function findMissingIndexes(expected, deployed) {
  const deployedKeys = new Set((deployed ?? []).map(indexKey));
  return expected.filter((idx) => !deployedKeys.has(indexKey(idx)));
}

export function parseIndexesListJson(payload) {
  if (!payload || typeof payload !== "object") return [];
  const result = payload.result ?? payload;
  if (Array.isArray(result)) return result;
  if (Array.isArray(result?.indexes)) return result.indexes;
  if (Array.isArray(payload.indexes)) return payload.indexes;
  return [];
}

export function runFirebaseJson(args, options = {}) {
  const printable = ["firebase", "--json", ...args].join(" ");
  const result = spawnSync("firebase", ["--json", ...args], {
    cwd: options.cwd ?? REPO_ROOT,
    encoding: "utf8",
    shell: process.platform === "win32",
    env: options.env ?? process.env,
  });

  const stdout = result.stdout?.toString() ?? "";
  const stderr = result.stderr?.toString() ?? "";

  let parsed = null;
  try {
    parsed = stdout.trim() ? JSON.parse(stdout) : null;
  } catch {
    parsed = null;
  }

  return {
    status: result.status ?? 1,
    stdout,
    stderr,
    parsed,
    printable,
  };
}

function statusLine(ok, label, detail) {
  const mark = ok ? "OK" : "FAIL";
  console.log(`  [${mark}] ${label}${detail ? ` — ${detail}` : ""}`);
}

function warnLine(label, detail) {
  console.log(`  [WARN] ${label}${detail ? ` — ${detail}` : ""}`);
}

async function checkSubscriptionDoc(projectId, credentialsPath) {
  try {
    const { initSchoolAdmin } = await import("./school-provision-lib.mjs");
    const schoolApp = await initSchoolAdmin(credentialsPath, projectId);
    const { getFirestore } = await import("firebase-admin/firestore");
    const snap = await getFirestore(schoolApp).doc("platform/subscription").get();
    if (!snap.exists) {
      return { ok: false, detail: "doc missing (legacy = entitled until first sync)" };
    }
    const entitled = snap.data()?.entitled;
    return {
      ok: true,
      detail: `entitled=${entitled === undefined ? "(unset)" : String(entitled)}`,
    };
  } catch (err) {
    return {
      ok: false,
      detail: `could not read (${err instanceof Error ? err.message : err})`,
    };
  }
}

/**
 * Probe a school Firebase project for required functions, indexes, rules markers, subscription.
 * @returns {{ ok: boolean, warnings: number, errors: string[] }}
 */
export async function verifySchoolProject(opts) {
  const project = opts.project?.trim();
  if (!project) {
    throw new Error("--project is required.");
  }

  const strict = Boolean(opts.strict);
  const dryRun = Boolean(opts.dryRun);
  const errors = [];
  let warnings = 0;

  logStep(`Verify school project: ${project}`);
  if (dryRun) {
    console.log("  [dry-run] would check functions, indexes, rules release, platform/subscription");
    return { ok: true, warnings: 0, errors: [] };
  }

  // --- Functions (required) ---
  const fnResult = runFirebaseJson(["functions:list", "--project", project]);
  let deployedNames = parseFunctionsListJson(fnResult.parsed);
  if (deployedNames.length === 0 && fnResult.stdout) {
    // Non-JSON or empty result: try plain list
    const plain = spawnSync(
      "firebase",
      ["functions:list", "--project", project],
      {
        cwd: REPO_ROOT,
        encoding: "utf8",
        shell: process.platform === "win32",
      },
    );
    deployedNames = parseFunctionsListText(plain.stdout?.toString() ?? "");
  }

  if (fnResult.status !== 0 && deployedNames.length === 0) {
    errors.push("Could not list Cloud Functions (is Firebase CLI logged in?)");
    statusLine(false, "Cloud Functions", fnResult.stderr.trim() || "list failed");
  } else {
    const missing = REQUIRED_SCHOOL_FUNCTIONS.filter(
      (name) => !deployedNames.includes(name),
    );
    if (missing.length) {
      errors.push(`Missing functions: ${missing.join(", ")}`);
      statusLine(false, "Cloud Functions", `missing ${missing.join(", ")}`);
    } else {
      statusLine(
        true,
        "Cloud Functions",
        `all ${REQUIRED_SCHOOL_FUNCTIONS.length} school functions present`,
      );
    }
  }

  // --- Indexes (warn by default; fail in --strict) ---
  const expectedIndexes = loadExpectedIndexes();
  const idxResult = runFirebaseJson([
    "firestore:indexes",
    "--project",
    project,
  ]);
  const deployedIndexes = parseIndexesListJson(idxResult.parsed);
  if (idxResult.status !== 0 && deployedIndexes.length === 0) {
    warnings += 1;
    warnLine(
      "Firestore indexes",
      "could not list — check Console if attendance queries return empty",
    );
  } else {
    const missingIdx = findMissingIndexes(expectedIndexes, deployedIndexes);
    if (missingIdx.length) {
      const detail = missingIdx
        .map((i) => i.collectionGroup ?? "?")
        .join(", ");
      if (strict) {
        errors.push(`Missing indexes for: ${detail}`);
        statusLine(false, "Firestore indexes", `missing composites (${detail})`);
      } else {
        warnings += 1;
        warnLine(
          "Firestore indexes",
          `missing or still building (${detail}) — attendance may look empty until Enabled`,
        );
      }
    } else {
      statusLine(true, "Firestore indexes", `${expectedIndexes.length} expected composites found`);
    }
  }

  // --- Rules release markers (warn / strict) ---
  const rulesCheck = await checkFirestoreRulesRelease(project);
  if (rulesCheck.status === "ok") {
    statusLine(true, "Firestore rules", rulesCheck.detail);
  } else if (rulesCheck.status === "fail") {
    if (strict) {
      errors.push(rulesCheck.detail);
      statusLine(false, "Firestore rules", rulesCheck.detail);
    } else {
      warnings += 1;
      warnLine("Firestore rules", rulesCheck.detail);
    }
  } else {
    warnings += 1;
    warnLine("Firestore rules", rulesCheck.detail);
  }

  // --- platform/subscription (warn) ---
  if (opts.credentials || process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    const sub = await checkSubscriptionDoc(
      project,
      opts.credentials || process.env.GOOGLE_APPLICATION_CREDENTIALS,
    );
    if (sub.ok) {
      statusLine(true, "platform/subscription", sub.detail);
    } else if (strict) {
      errors.push(`platform/subscription: ${sub.detail}`);
      statusLine(false, "platform/subscription", sub.detail);
    } else {
      warnings += 1;
      warnLine("platform/subscription", sub.detail);
    }
  } else {
    warnings += 1;
    warnLine(
      "platform/subscription",
      "skipped (set GOOGLE_APPLICATION_CREDENTIALS or --credentials)",
    );
  }

  const ok = errors.length === 0;
  console.log("");
  if (ok) {
    console.log(
      `Verify passed${warnings ? ` with ${warnings} warning(s)` : ""}.`,
    );
    if (warnings) {
      console.log(
        "  Tip: push gaps and empty attendance often mean indexes still Building or rules/functions were skipped.",
      );
    }
  } else {
    console.log("Verify FAILED:");
    for (const err of errors) {
      console.log(`  - ${err}`);
    }
    console.log(
      "\n  Fix: npm run onboard:school -- --project " +
        project +
        "\n  Then re-run: npm run verify:school -- " +
        project,
    );
  }

  return { ok, warnings, errors };
}

async function checkFirestoreRulesRelease(projectId) {
  const tokenResult = spawnSync(
    "gcloud",
    ["auth", "print-access-token"],
    {
      encoding: "utf8",
      shell: process.platform === "win32",
    },
  );
  const token = tokenResult.stdout?.toString().trim();
  if (tokenResult.status !== 0 || !token) {
    return {
      status: "skip",
      detail: "skipped (gcloud auth print-access-token unavailable)",
    };
  }

  try {
    const releaseUrl = `https://firebaserules.googleapis.com/v1/projects/${projectId}/releases/cloud.firestore`;
    const releaseRes = await fetch(releaseUrl, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!releaseRes.ok) {
      return {
        status: "fail",
        detail: `release HTTP ${releaseRes.status} — rules may never have been deployed`,
      };
    }
    const release = await releaseRes.json();
    const rulesetName = release.rulesetName;
    if (!rulesetName) {
      return { status: "fail", detail: "no ruleset attached to cloud.firestore release" };
    }

    const rulesetRes = await fetch(
      `https://firebaserules.googleapis.com/v1/${rulesetName}`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    if (!rulesetRes.ok) {
      return {
        status: "fail",
        detail: `ruleset HTTP ${rulesetRes.status}`,
      };
    }
    const ruleset = await rulesetRes.json();
    const sourceFiles = ruleset.source?.files ?? [];
    const content = sourceFiles.map((f) => f.content ?? "").join("\n");
    const missingMarkers = REQUIRED_RULES_MARKERS.filter(
      (m) => !content.includes(m),
    );
    if (missingMarkers.length) {
      return {
        status: "fail",
        detail: `deployed rules missing markers: ${missingMarkers.join(", ")} (stale rules?)`,
      };
    }
    return {
      status: "ok",
      detail: `release present; markers ${REQUIRED_RULES_MARKERS.join(", ")}`,
    };
  } catch (err) {
    return {
      status: "skip",
      detail: `could not fetch rules (${err instanceof Error ? err.message : err})`,
    };
  }
}
