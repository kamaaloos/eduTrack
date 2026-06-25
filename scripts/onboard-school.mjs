#!/usr/bin/env node
/**
 * Deploy or fully provision EduTrack school tenants.
 *
 * Prerequisites:
 *   - Firebase CLI installed and logged in (`firebase login`)
 *   - Node.js 20+
 *   - For provision/register: registry service account (GOOGLE_APPLICATION_CREDENTIALS)
 *   - For IAM step: gcloud CLI with permission to edit school project IAM
 *
 * Examples:
 *   npm run onboard:school -- --project edutrack-school-2
 *   npm run onboard:school -- --project edutrack-school-2 --dry-run
 *   npm run onboard:school -- --register scripts/school-registry.example.json
 *   npm run provision:school -- scripts/my-school.json
 *   npm run provision:school -- scripts/my-school.json --dry-run
 *   npm run provision:school -- scripts/my-school.json --admin-email admin@school.example --admin-password '...' --admin-name 'Admin'
 */

import {
  deploySchoolProject,
  loadRegistryPayload,
  provisionSchoolFromRegistryJson,
  upsertSchoolRegistry,
} from "./school-provision-lib.mjs";

function printHelp() {
  console.log(`Usage:
  node scripts/onboard-school.mjs --project <school-project-id> [options]
  node scripts/onboard-school.mjs --register <registry-json-path> [options]
  node scripts/onboard-school.mjs --provision <registry-json-path> [options]

Deploy options (--project):
  --project <id>              School Firebase project ID
  --dry-run                   Print commands without running them
  --skip-storage              Skip storage rules deploy
  --skip-functions            Skip school Cloud Functions build + deploy
  --seed-subscription         Write platform/subscription { entitled: true }

Register options (--register):
  --register <path>           Upsert schoolRegistry from JSON (registry credentials)

Provision options (--provision) — deploy + registry + IAM + sync in one run:
  --provision <path>          Registry JSON (see scripts/school-registry.example.json)
  --skip-iam                  Skip gcloud Datastore User grant for registry compute SA
  --skip-registry-sync        Skip subscription + userCount sync (use --seed-subscription instead)
  --registry-compute-sa <email>  Override registry compute service account
  --admin-email <email>       Create first school admin (with --admin-password, --admin-name)
  --admin-password <password>
  --admin-name <display name>

Shared:
  --credentials <path>        Service account JSON (default: GOOGLE_APPLICATION_CREDENTIALS)
  REGISTRY_COMPUTE_SA         Env override for IAM principal
  REGISTRY_PROJECT_NUMBER     Env override (builds <number>-compute@developer.gserviceaccount.com)
`);
}

function parseArgs(argv) {
  const opts = {
    project: "",
    register: "",
    provision: "",
    dryRun: false,
    skipStorage: false,
    skipFunctions: false,
    seedSubscription: false,
    skipIam: false,
    skipRegistrySync: false,
    registryComputeSa: "",
    adminEmail: "",
    adminPassword: "",
    adminName: "",
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
      case "--provision":
        opts.provision = argv[++i] ?? "";
        break;
      case "--credentials":
        opts.credentials = argv[++i] ?? "";
        break;
      case "--registry-compute-sa":
        opts.registryComputeSa = argv[++i] ?? "";
        break;
      case "--admin-email":
        opts.adminEmail = argv[++i] ?? "";
        break;
      case "--admin-password":
        opts.adminPassword = argv[++i] ?? "";
        break;
      case "--admin-name":
        opts.adminName = argv[++i] ?? "";
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
      case "--skip-iam":
        opts.skipIam = true;
        break;
      case "--skip-registry-sync":
        opts.skipRegistrySync = true;
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

async function registerSchoolFromJson(jsonPath, credentialsPath, dryRun) {
  const payload = loadRegistryPayload(jsonPath);
  const { schoolId, created } = await upsertSchoolRegistry(
    payload,
    credentialsPath,
    dryRun,
  );

  console.log(
    `\nRegistry ${created ? "created" : "updated"}: schoolRegistry/${schoolId}`,
  );
  console.log("\nNext steps:");
  console.log(
    "  1. Deploy school assets: npm run onboard:school -- --project",
    payload.firebase.projectId,
  );
  console.log(
    "  2. IAM on the school project: grant registry compute SA Cloud Datastore User",
  );
  console.log(
    "  3. Full automation next time: npm run provision:school --",
    jsonPath,
  );
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (opts.help) {
    printHelp();
    process.exit(opts.project || opts.register || opts.provision ? 0 : 1);
  }

  const modeCount = [opts.project, opts.register, opts.provision].filter(
    (value) => value.trim().length > 0,
  ).length;

  if (modeCount > 1) {
    console.error("Use only one of --project, --register, or --provision.");
    process.exit(1);
  }

  if (modeCount === 0) {
    printHelp();
    process.exit(1);
  }

  if (
    opts.adminEmail &&
    (!opts.adminPassword.trim() || !opts.adminName.trim())
  ) {
    console.error("--admin-email requires --admin-password and --admin-name.");
    process.exit(1);
  }

  try {
    if (opts.provision) {
      await provisionSchoolFromRegistryJson(opts);
      return;
    }

    if (opts.register) {
      await registerSchoolFromJson(opts.register, opts.credentials, opts.dryRun);
      return;
    }

    await deploySchoolProject(opts);
    console.log("\nSchool deploy complete.");
    console.log("Tip: npm run provision:school -- scripts/my-school.json automates registry + IAM + sync.");
  } catch (err) {
    console.error(
      `\nOnboarding failed: ${err instanceof Error ? err.message : err}`,
    );
    process.exit(1);
  }
}

void main();
