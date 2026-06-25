import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const baseline = JSON.parse(
  readFileSync(join(root, "typecheck-app.baseline.json"), "utf8"),
);
const maxErrors =
  typeof baseline.maxErrors === "number" ? baseline.maxErrors : 0;

let output = "";
try {
  execSync("npx tsc --noEmit -p tsconfig.app.json", {
    cwd: root,
    stdio: "pipe",
    encoding: "utf8",
  });
  console.log("typecheck:app passed with zero errors.");
  if (baseline.maxErrors > 0) {
    console.log(
      "Tip: set typecheck-app.baseline.json maxErrors to 0 now that the app is clean.",
    );
  }
} catch (err) {
  const error = err;
  output = `${error.stdout ?? ""}${error.stderr ?? ""}`;
  const count = (output.match(/error TS\d+:/g) ?? []).length;

  if (count === 0) {
    console.error("typecheck:app failed but no TS errors were parsed:");
    console.error(output);
    process.exit(error.status ?? 1);
  }

  if (count > maxErrors) {
    console.error(
      `typecheck:app regressed: ${count} errors (baseline allows ${maxErrors}).`,
    );
    console.error(output);
    process.exit(1);
  }

  console.warn(
    `typecheck:app: ${count} known strict errors (baseline ${maxErrors}).`,
  );
}
