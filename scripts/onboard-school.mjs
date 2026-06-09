#!/usr/bin/env node
/**
 * Deploy EduTrack school Firebase assets (rules, indexes, storage, push function).
 * Optionally register a school in the registry or seed platform/subscription.
 *
 * Prerequisites:
 *   - Firebase CLI installed and logged in (`firebase login`)
 *   - Node.js 20+
 *
 * Examples:
 *   node scripts/onboard-school.mjs --project edutrack-school-2
 *   node scripts/onboard-school.mjs --project edutrack-school-2 --dry-run
 *   node scripts/onboard-school.mjs --project edutrack-school-2 --seed-subscription
 *   node scripts/onboard-school.mjs --register scripts/school-registry.example.json
 */

import { spawnSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.join(__dirname, "..");

function printHelp() {
  console.log(`Usage:
  node scripts/onboard-school.mjs --project <school-project-id> [options]
  node scripts/onboard-school.mjs --register <registry-json-path> [options]

Deploy options:
  --project <id>           School Firebase project ID (required for deploy)
  --dry-run                Print commands without running them
  --skip-storage           Skip storage rules deploy
  --skip-functions         Skip school Cloud Functions build + deploy
  --seed-subscription      Write platform/subscription { entitled: true } (needs credentials)

Register options:
  --register <path>        Add school to schoolRegistry from JSON (needs registry credentials)

Credentials (for --seed-subscription / --register):
  GOOGLE_APPLICATION_CREDENTIALS   Path to service account JSON
  --credentials <path>               Override credentials path

Registry sync hint (manual after register):
  firebase use <registry-project-id>
  firebase deploy --only functions:registry:refreshSchoolSubscriptions
  # Call refreshSchoolSubscriptions with {} from Firebase console or super-admin
`);
}

function parseArgs(argv) {
  const opts = {
    project: "",
    register: "",
    dryRun: false,
    skipStorage: false,
    skipFunctions: false,
    seedSubscription: false,
    credentials: process.env.GOOGLE_APPLICATION_CREDENTIALS ?? "",
    help: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    switch (arg) {
      case "--project":
        opts.project = argv[++i] ?? "";
        break;
      case "--register":
        opts.register = argv[++i] ?? "";
        break;
      case "--credentials":
        opts.credentials = argv[++i] ?? "";
        break;
      case "--dry-run":
        opts.dryRun = true;
        break;
      case "--skip-storage":
        opts.skipStorage = true;
        break;
      case "--skip-functions":
        opts.skipFunctions = true;
        break;
      case "--seed-subscription":
        opts.seedSubscription = true;
        break;
      case "--help":
      case "-h":
        opts.help = true;
        break;
      default:
        console.error(`Unknown argument: ${arg}`);
        opts.help = true;
        break;
    }
  }

  return opts;
}

function logStep(label) {
  console.log(`\n==> ${label}`);
}

function runCommand(label, command, args, options = {}) {
  const cwd = options.cwd ?? REPO_ROOT;
  const printable = [command, ...args].join(" ");
  logStep(label);
  console.log(`    ${printable}`);

  if (options.dryRun) {
    return { status: 0 };
  }

  const result = spawnSync(command, args, {
    cwd,
    stdio: "inherit",
    shell: process.platform === "win32",
  });

  if (result.status !== 0) {
    throw new Error(`Command failed (${result.status}): ${printable}`);
  }

  return result;
}

function resolveCredentials(credentialsPath) {
  const resolved = credentialsPath
    ? path.resolve(credentialsPath)
    : path.join(REPO_ROOT, "serviceAccountKey.json");

  if (!fs.existsSync(resolved)) {
    throw new Error(
      `Missing credentials at ${resolved}.\n` +
        "Set GOOGLE_APPLICATION_CREDENTIALS or pass --credentials <path>.",
    );
  }

  return resolved;
}

async function seedSubscriptionDoc(projectId, credentialsPath, dryRun) {
  logStep(`Seed platform/subscription on ${projectId}`);
  if (dryRun) {
    console.log("    [dry-run] set platform/subscription { entitled: true }");
    return;
  }

  const keyPath = resolveCredentials(credentialsPath);
  const serviceAccount = JSON.parse(fs.readFileSync(keyPath, "utf8"));
  const admin = (await import("firebase-admin")).default;

  if (admin.apps.length === 0) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId,
    });
  }

  await admin.firestore().doc("platform/subscription").set(
    {
      entitled: true,
      seededAt: new Date().toISOString(),
      source: "onboard-school-script",
    },
    { merge: true },
  );

  console.log("    platform/subscription written (entitled: true)");
}

function validateRegistryPayload(raw) {
  const requiredFirebase = [
    "apiKey",
    "authDomain",
    "projectId",
    "storageBucket",
    "messagingSenderId",
    "appId",
  ];

  if (!raw?.name?.trim()) {
    throw new Error("Registry JSON: name is required.");
  }
  if (!raw?.testingExpiresAt?.trim()) {
    throw new Error("Registry JSON: testingExpiresAt (YYYY-MM-DD) is required.");
  }
  if (!raw?.firebase || typeof raw.firebase !== "object") {
    throw new Error("Registry JSON: firebase config object is required.");
  }

  for (const field of requiredFirebase) {
    if (!String(raw.firebase[field] ?? "").trim()) {
      throw new Error(`Registry JSON: firebase.${field} is required.`);
    }
  }

  return {
    name: raw.name.trim(),
    country: raw.country?.trim() || null,
    city: raw.city?.trim() || null,
    logoUrl: raw.logoUrl?.trim() || null,
    active: raw.active !== false,
    testingExpiresAt: raw.testingExpiresAt.trim(),
    usageExpiresAt: raw.usageExpiresAt?.trim() || null,
    userCount:
      raw.userCount == null || raw.userCount === ""
        ? null
        : Number(raw.userCount),
    firebase: {
      apiKey: raw.firebase.apiKey.trim(),
      authDomain: raw.firebase.authDomain.trim(),
      projectId: raw.firebase.projectId.trim(),
      storageBucket: raw.firebase.storageBucket.trim(),
      messagingSenderId: String(raw.firebase.messagingSenderId).trim(),
      appId: raw.firebase.appId.trim(),
    },
  };
}

async function registerSchoolFromJson(jsonPath, credentialsPath, dryRun) {
  const absoluteJson = path.resolve(jsonPath);
  if (!fs.existsSync(absoluteJson)) {
    throw new Error(`Registry JSON not found: ${absoluteJson}`);
  }

  const payload = validateRegistryPayload(
    JSON.parse(fs.readFileSync(absoluteJson, "utf8")),
  );

  logStep(`Register school "${payload.name}" in schoolRegistry`);
  if (dryRun) {
    console.log(`    [dry-run] addDoc schoolRegistry (${payload.firebase.projectId})`);
    return;
  }

  const keyPath = resolveCredentials(credentialsPath);
  const serviceAccount = JSON.parse(fs.readFileSync(keyPath, "utf8"));
  const admin = (await import("firebase-admin")).default;

  if (admin.apps.length === 0) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }

  const docRef = await admin.firestore().collection("schoolRegistry").add({
    ...payload,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  console.log(`    Registered schoolRegistry/${docRef.id}`);
  console.log(
    "\nNext steps:",
  );
  console.log(
    "  1. IAM on the SCHOOL project: grant registry compute SA Cloud Datastore User",
  );
  console.log(
    "     (see docs/REGISTER_NEW_SCHOOL.md — billable userCount sync).",
  );
  console.log(
    "  2. Call refreshSchoolSubscriptions on the registry project ({} or this school id).",
  );
}

async function deploySchoolProject(opts) {
  if (!opts.project.trim()) {
    throw new Error("--project is required for deploy mode.");
  }

  console.log(`Onboarding school project: ${opts.project}`);
  if (opts.dryRun) {
    console.log("(dry-run — commands will not execute)\n");
  }

  runCommand(
    "Select Firebase project",
    "firebase",
    ["use", opts.project],
    { dryRun: opts.dryRun },
  );

  if (!opts.skipFunctions) {
    runCommand(
      "Install school-functions dependencies",
      "npm",
      ["install"],
      { cwd: path.join(REPO_ROOT, "school-functions"), dryRun: opts.dryRun },
    );
    runCommand(
      "Build school-functions",
      "npm",
      ["run", "build"],
      { cwd: path.join(REPO_ROOT, "school-functions"), dryRun: opts.dryRun },
    );
  }

  runCommand(
    "Deploy Firestore rules + indexes",
    "firebase",
    [
      "deploy",
      "--config",
      "firebase.school.json",
      "--only",
      "firestore:rules,firestore:indexes",
    ],
    { dryRun: opts.dryRun },
  );

  if (!opts.skipStorage) {
    runCommand(
      "Deploy Storage rules",
      "firebase",
      ["deploy", "--config", "firebase.school.json", "--only", "storage"],
      { dryRun: opts.dryRun },
    );
  }

  if (!opts.skipFunctions) {
    runCommand(
      "Deploy push notification function",
      "firebase",
      [
        "deploy",
        "--config",
        "firebase.school.json",
        "--only",
        "functions:school:sendPushOnNotificationCreated",
      ],
      { dryRun: opts.dryRun },
    );
  }

  if (opts.seedSubscription) {
    await seedSubscriptionDoc(opts.project, opts.credentials, opts.dryRun);
  }

  console.log("\nSchool deploy complete.");
  console.log("Remaining manual steps:");
  console.log("  1. Register the school in super-admin (or use --register JSON).");
  console.log(
    "  2. IAM on this school project: grant registry compute SA Cloud Datastore User",
  );
  console.log("     (required for billable userCount — docs/REGISTER_NEW_SCHOOL.md).");
  console.log("  3. Call refreshSchoolSubscriptions on the registry project.");
  console.log("  4. Create the first school admin user in Firebase Auth + users/{uid}.");
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (opts.help) {
    printHelp();
    process.exit(opts.project || opts.register ? 0 : 1);
  }

  try {
    if (opts.register) {
      await registerSchoolFromJson(opts.register, opts.credentials, opts.dryRun);
      return;
    }

    await deploySchoolProject(opts);
  } catch (err) {
    console.error(`\nOnboarding failed: ${err instanceof Error ? err.message : err}`);
    process.exit(1);
  }
}

void main();
