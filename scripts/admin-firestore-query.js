/**
 * Local admin script — NOT used by the mobile app.
 *
 * Usage:
 *   Set GOOGLE_APPLICATION_CREDENTIALS to your service account JSON path, or
 *   place serviceAccountKey.json in the project root (gitignored).
 *
 *   node scripts/admin-firestore-query.js
 */

const fs = require("fs");
const path = require("path");
const admin = require("firebase-admin");

const keyPath =
  process.env.GOOGLE_APPLICATION_CREDENTIALS ||
  path.join(__dirname, "..", "serviceAccountKey.json");

if (!fs.existsSync(keyPath)) {
  console.error(
    "Missing credentials.\n" +
      "  - Set GOOGLE_APPLICATION_CREDENTIALS to your service account JSON path, or\n" +
      "  - Copy serviceAccountKey.example.json → serviceAccountKey.json (local only, never commit).",
  );
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(require(keyPath)),
});

const db = admin.firestore();

async function run() {
  // Example query — edit for your debugging needs
  const snapshot = await db
    .collection("users")
    .where("role", "==", "student")
    .limit(10)
    .get();

  snapshot.forEach((doc) => {
    console.log(doc.id, doc.data());
  });
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
