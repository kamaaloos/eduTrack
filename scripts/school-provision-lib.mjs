import { spawnSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const REPO_ROOT = path.join(__dirname, "..");

export function logStep(label) {
  console.log(`\n==> ${label}`);
}

export function runCommand(label, command, args, options = {}) {
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
    env: options.env ?? process.env,
  });

  if (result.status !== 0) {
    throw new Error(`Command failed (${result.status}): ${printable}`);
  }

  return result;
}

export function resolveCredentials(credentialsPath) {
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

export async function initRegistryAdmin(credentialsPath) {
  const keyPath = resolveCredentials(credentialsPath);
  process.env.GOOGLE_APPLICATION_CREDENTIALS = keyPath;

  const serviceAccount = JSON.parse(fs.readFileSync(keyPath, "utf8"));
  const admin = (await import("firebase-admin")).default;

  const existing = admin.apps.find((app) => app.name === "provision-registry");
  if (existing) {
    return { admin, registryProjectId: existing.options.projectId ?? serviceAccount.project_id };
  }

  const app = admin.initializeApp(
    {
      credential: admin.credential.cert(serviceAccount),
      projectId: serviceAccount.project_id,
    },
    "provision-registry",
  );

  return {
    admin,
    registryProjectId: app.options.projectId ?? serviceAccount.project_id,
  };
}

export async function initSchoolAdmin(credentialsPath, schoolProjectId) {
  const keyPath = resolveCredentials(credentialsPath);
  const serviceAccount = JSON.parse(fs.readFileSync(keyPath, "utf8"));
  const admin = (await import("firebase-admin")).default;
  const appName = `provision-school-${schoolProjectId}`;

  const existing = admin.apps.find((app) => app.name === appName);
  if (existing) {
    return admin.app(appName);
  }

  return admin.initializeApp(
    {
      credential: admin.credential.cert(serviceAccount),
      projectId: schoolProjectId,
    },
    appName,
  );
}

export function validateRegistryPayload(raw) {
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

export function loadRegistryPayload(jsonPath) {
  const absoluteJson = path.resolve(jsonPath);
  if (!fs.existsSync(absoluteJson)) {
    throw new Error(`Registry JSON not found: ${absoluteJson}`);
  }
  return validateRegistryPayload(
    JSON.parse(fs.readFileSync(absoluteJson, "utf8")),
  );
}

export async function seedSubscriptionDoc(projectId, credentialsPath, dryRun) {
  logStep(`Seed platform/subscription on ${projectId}`);
  if (dryRun) {
    console.log("    [dry-run] set platform/subscription { entitled: true }");
    return;
  }

  const schoolApp = await initSchoolAdmin(credentialsPath, projectId);
  const { getFirestore } = await import("firebase-admin/firestore");

  await getFirestore(schoolApp).doc("platform/subscription").set(
    {
      entitled: true,
      seededAt: new Date().toISOString(),
      source: "onboard-school-script",
    },
    { merge: true },
  );

  console.log("    platform/subscription written (entitled: true)");
}

async function findSchoolIdByProjectId(admin, projectId) {
  const snapshot = await admin
    .firestore()
    .collection("schoolRegistry")
    .where("firebase.projectId", "==", projectId)
    .limit(1)
    .get();

  if (snapshot.empty) return null;
  return snapshot.docs[0].id;
}

export async function upsertSchoolRegistry(payload, credentialsPath, dryRun) {
  const projectId = payload.firebase.projectId;

  logStep(`Register school "${payload.name}" in schoolRegistry (${projectId})`);
  if (dryRun) {
    console.log(`    [dry-run] upsert schoolRegistry for ${projectId}`);
    return { schoolId: "<dry-run-school-id>", created: true };
  }

  const { admin } = await initRegistryAdmin(credentialsPath);
  const existingId = await findSchoolIdByProjectId(admin, projectId);
  const record = {
    ...payload,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  if (existingId) {
    await admin.firestore().collection("schoolRegistry").doc(existingId).set(record, {
      merge: true,
    });
    console.log(`    Updated schoolRegistry/${existingId}`);
    return { schoolId: existingId, created: false };
  }

  const docRef = await admin.firestore().collection("schoolRegistry").add({
    ...record,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  console.log(`    Created schoolRegistry/${docRef.id}`);
  return { schoolId: docRef.id, created: true };
}

export async function deploySchoolProject(opts) {
  const project = opts.project.trim();
  if (!project) {
    throw new Error("--project is required for deploy mode.");
  }

  console.log(`Deploying school project: ${project}`);
  if (opts.dryRun) {
    console.log("(dry-run — commands will not execute)\n");
  }

  runCommand("Select Firebase project", "firebase", ["use", project], {
    dryRun: opts.dryRun,
  });

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
      "Deploy school Cloud Functions",
      "firebase",
      ["deploy", "--config", "firebase.school.json", "--only", "functions:school"],
      { dryRun: opts.dryRun },
    );
  }

  if (opts.seedSubscription) {
    await seedSubscriptionDoc(project, opts.credentials, opts.dryRun);
  }
}

export function resolveRegistryComputeSa(registryProjectId, explicitSa) {
  const trimmed = explicitSa?.trim();
  if (trimmed) return trimmed;

  const fromEnv = process.env.REGISTRY_COMPUTE_SA?.trim();
  if (fromEnv) return fromEnv;

  const projectNumber = process.env.REGISTRY_PROJECT_NUMBER?.trim();
  if (projectNumber) {
    return `${projectNumber}-compute@developer.gserviceaccount.com`;
  }

  if (!registryProjectId) {
    return null;
  }

  const result = spawnSync(
    "gcloud",
    [
      "projects",
      "describe",
      registryProjectId,
      "--format=value(projectNumber)",
    ],
    { encoding: "utf8", shell: process.platform === "win32" },
  );

  if (result.status !== 0 || !result.stdout?.trim()) {
    return null;
  }

  return `${result.stdout.trim()}-compute@developer.gserviceaccount.com`;
}

export function grantRegistryDatastoreAccess(schoolProjectId, computeSa, dryRun) {
  if (!computeSa) {
    if (dryRun) {
      logStep(`Grant registry read access on ${schoolProjectId}`);
      console.log(
        "    [dry-run] gcloud projects add-iam-policy-binding … --member=serviceAccount:<registry-compute-sa> --role=roles/datastore.user",
      );
      return false;
    }
    console.warn(
      "\nSkipping IAM: set REGISTRY_COMPUTE_SA or REGISTRY_PROJECT_NUMBER, or pass --registry-compute-sa.",
    );
    return false;
  }

  logStep(`Grant registry read access on ${schoolProjectId}`);
  console.log(`    Principal: ${computeSa}`);

  if (dryRun) {
    console.log("    [dry-run] gcloud projects add-iam-policy-binding …");
    return true;
  }

  const result = spawnSync(
    "gcloud",
    [
      "projects",
      "add-iam-policy-binding",
      schoolProjectId,
      `--member=serviceAccount:${computeSa}`,
      "--role=roles/datastore.user",
      "--quiet",
    ],
    { stdio: "inherit", shell: process.platform === "win32" },
  );

  if (result.status !== 0) {
    throw new Error(
      "gcloud IAM binding failed. Install gcloud CLI and ensure you can edit IAM on the school project.",
    );
  }

  return true;
}

async function buildRegistryFunctions(dryRun) {
  runCommand(
    "Build registry Cloud Functions",
    "npm",
    ["run", "build"],
    { cwd: path.join(REPO_ROOT, "functions"), dryRun },
  );
}

export async function syncRegistrySchoolState(schoolId, credentialsPath, dryRun) {
  logStep(`Sync subscription + user count for schoolRegistry/${schoolId}`);
  if (dryRun) {
    console.log("    [dry-run] refreshSchoolSubscription + syncSchoolUserCount");
    return { subscription: { ok: true }, userCount: { ok: true } };
  }

  await initRegistryAdmin(credentialsPath);
  await buildRegistryFunctions(false);

  const enforcementUrl = pathToFileURL(
    path.join(REPO_ROOT, "functions/lib/schoolSubscriptionEnforcement.js"),
  ).href;
  const syncUrl = pathToFileURL(
    path.join(REPO_ROOT, "functions/lib/syncSchoolUserCounts.js"),
  ).href;

  const { refreshSchoolSubscription } = await import(enforcementUrl);
  const { syncSchoolUserCount, getRegistryDb } = await import(syncUrl);

  const subscription = await refreshSchoolSubscription(schoolId);
  console.log(
    `    subscription sync: ${subscription.ok ? "ok" : "failed"}${
      subscription.error ? ` (${subscription.error})` : ""
    }`,
  );

  const doc = await getRegistryDb()
    .collection("schoolRegistry")
    .doc(schoolId)
    .get();
  const userCount = await syncSchoolUserCount(schoolId, doc.data() ?? {});
  console.log(
    `    user count sync: ${userCount.ok ? "ok" : "failed"}${
      userCount.error ? ` (${userCount.error})` : ""
    }${userCount.userCount != null ? ` → ${userCount.userCount}` : ""}`,
  );

  if (!subscription.ok) {
    throw new Error(`Subscription sync failed: ${subscription.error ?? "unknown"}`);
  }

  return { subscription, userCount };
}

export async function createFirstSchoolAdmin(
  schoolProjectId,
  { email, password, name },
  credentialsPath,
  dryRun,
) {
  const normalizedEmail = email.trim().toLowerCase();
  logStep(`Create first school admin ${normalizedEmail} on ${schoolProjectId}`);

  if (dryRun) {
    console.log("    [dry-run] createUser + users/{uid}");
    return null;
  }

  const schoolApp = await initSchoolAdmin(credentialsPath, schoolProjectId);
  const { getAuth } = await import("firebase-admin/auth");
  const { getFirestore } = await import("firebase-admin/firestore");
  const auth = getAuth(schoolApp);
  const db = getFirestore(schoolApp);

  let user;
  try {
    user = await auth.getUserByEmail(normalizedEmail);
    console.log(`    Auth user already exists: ${user.uid}`);
  } catch {
    user = await auth.createUser({
      email: normalizedEmail,
      password,
      displayName: name.trim(),
    });
    console.log(`    Created Auth user: ${user.uid}`);
  }

  await db
    .collection("users")
    .doc(user.uid)
    .set(
      {
        name: name.trim(),
        email: normalizedEmail,
        role: "admin",
        mustChangePassword: false,
        createdAt: new Date(),
        provisionedBy: "onboard-school-script",
      },
      { merge: true },
    );

  console.log(`    Firestore users/${user.uid} (role: admin)`);
  return user.uid;
}

export async function provisionSchoolFromRegistryJson(opts) {
  const payload = loadRegistryPayload(opts.provision);
  const schoolProjectId = payload.firebase.projectId;

  if (opts.project.trim() && opts.project.trim() !== schoolProjectId) {
    throw new Error(
      `--project ${opts.project} does not match firebase.projectId ${schoolProjectId} in JSON.`,
    );
  }

  console.log(`\nProvisioning school tenant: ${payload.name} (${schoolProjectId})`);
  if (opts.dryRun) {
    console.log("(dry-run — destructive steps are logged only)\n");
  }

  await deploySchoolProject({
    ...opts,
    project: schoolProjectId,
  });

  const { schoolId, created } = await upsertSchoolRegistry(
    payload,
    opts.credentials,
    opts.dryRun,
  );

  const { registryProjectId } = opts.dryRun
    ? { registryProjectId: process.env.REGISTRY_PROJECT_ID ?? "<registry-project-id>" }
    : await initRegistryAdmin(opts.credentials);

  if (!opts.skipIam) {
    const computeSa = resolveRegistryComputeSa(
      registryProjectId,
      opts.registryComputeSa,
    );
    grantRegistryDatastoreAccess(schoolProjectId, computeSa, opts.dryRun);
  }

  if (!opts.skipRegistrySync) {
    await syncRegistrySchoolState(schoolId, opts.credentials, opts.dryRun);
  } else if (opts.seedSubscription) {
    await seedSubscriptionDoc(schoolProjectId, opts.credentials, opts.dryRun);
  }

  let adminUid = null;
  if (opts.adminEmail && opts.adminPassword && opts.adminName) {
    adminUid = await createFirstSchoolAdmin(
      schoolProjectId,
      {
        email: opts.adminEmail,
        password: opts.adminPassword,
        name: opts.adminName,
      },
      opts.credentials,
      opts.dryRun,
    );
  }

  console.log("\nProvision complete.");
  console.log(`  School project:     ${schoolProjectId}`);
  console.log(`  Registry document:  schoolRegistry/${schoolId}${created ? " (new)" : " (updated)"}`);
  if (adminUid) {
    console.log(`  First admin:        users/${adminUid}`);
  } else if (!opts.adminEmail) {
    console.log("  First admin:        create manually in Firebase Auth + users/{uid}");
  }

  if (opts.skipIam) {
    console.log("\nReminder: grant registry compute SA Cloud Datastore User on the school project.");
  }
  if (opts.skipRegistrySync) {
    console.log("\nReminder: call refreshSchoolSubscriptions for this school on the registry project.");
  }
}
