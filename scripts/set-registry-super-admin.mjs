#!/usr/bin/env node
/**
 * Grant registry super-admin to a Firebase Auth user (custom claims + Firestore profile).
 *
 * Usage:
 *   set GOOGLE_APPLICATION_CREDENTIALS=path\to\registry-service-account.json
 *   node scripts/set-registry-super-admin.mjs --email you@example.com
 *   node scripts/set-registry-super-admin.mjs --uid AUTH_UID_HERE
 */

import fs from "fs";

function printHelp() {
  console.log(`Usage:
  node scripts/set-registry-super-admin.mjs --email <address>
  node scripts/set-registry-super-admin.mjs --uid <firebase-auth-uid>

Requires GOOGLE_APPLICATION_CREDENTIALS or --credentials pointing at the registry project service account.
`);
}

function parseArgs(argv) {
  const opts = { email: "", uid: "", credentials: process.env.GOOGLE_APPLICATION_CREDENTIALS ?? "", help: false };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--email") opts.email = argv[++i] ?? "";
    else if (arg === "--uid") opts.uid = argv[++i] ?? "";
    else if (arg === "--credentials") opts.credentials = argv[++i] ?? "";
    else if (arg === "--help" || arg === "-h") opts.help = true;
  }
  return opts;
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (opts.help || (!opts.email && !opts.uid)) {
    printHelp();
    process.exit(opts.help ? 0 : 1);
  }

  if (!opts.credentials || !fs.existsSync(opts.credentials)) {
    console.error("Missing credentials. Set GOOGLE_APPLICATION_CREDENTIALS or pass --credentials.");
    process.exit(1);
  }

  const admin = (await import("firebase-admin")).default;
  if (admin.apps.length === 0) {
    admin.initializeApp({
      credential: admin.credential.cert(JSON.parse(fs.readFileSync(opts.credentials, "utf8"))),
    });
  }

  const auth = admin.auth();
  const db = admin.firestore();

  const user = opts.uid
    ? await auth.getUser(opts.uid)
    : await auth.getUserByEmail(opts.email.trim().toLowerCase());

  await auth.setCustomUserClaims(user.uid, { role: "superAdmin" });

  await db.collection("users").doc(user.uid).set(
    {
      role: "superAdmin",
      email: user.email ?? opts.email.trim().toLowerCase(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    },
    { merge: true },
  );

  console.log(`Super admin granted for ${user.email ?? user.uid}`);
  console.log(`  UID: ${user.uid}`);
  console.log(`  Firestore: users/${user.uid}`);
  console.log("Sign out and sign in again in Platform admin, then retry Sync count.");
}

void main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
