#!/usr/bin/env node
/**
 * Verify a school Firebase project has required functions, indexes, and rules.
 *
 * Examples:
 *   npm run verify:school -- edutrack-school-2 --preview
 *   npm run verify:school -- edutrack-school-2 --strict
 *   node scripts/verify-school-project.mjs --project edutrack-school-2 --credentials path\to\sa.json
 */

import { verifySchoolProject } from "./verify-school-lib.mjs";

function printHelp() {
  console.log(`Usage:
  npm run verify:school -- <school-project-id> [options]
  node scripts/verify-school-project.mjs --project <school-project-id> [options]

Options:
  --project <id>         School Firebase project ID (or pass as first positional arg)
  --strict               Fail on missing indexes, stale rules, or missing subscription
  --preview              Print what would be checked (do not probe Firebase)
  --credentials <path>   Service account for platform/subscription read
  --help                 Show this help

Exit codes:
  0  Healthy (warnings allowed unless --strict)
  1  Missing required Cloud Functions or --strict failures

Note: Prefer positional project id under npm on Windows — npm may consume --project / --dry-run.
`);
}

function parseArgs(argv) {
  const opts = {
    project: "",
    strict: false,
    dryRun: false,
    credentials: process.env.GOOGLE_APPLICATION_CREDENTIALS ?? "",
    help: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    switch (arg) {
      case "--project":
        opts.project = argv[++i] ?? "";
        break;
      case "--credentials":
        opts.credentials = argv[++i] ?? "";
        break;
      case "--strict":
        opts.strict = true;
        break;
      case "--preview":
      case "--dry-run":
        opts.dryRun = true;
        break;
      case "--help":
      case "-h":
        opts.help = true;
        break;
      default:
        // Positional project id — npm on Windows may swallow `--project`.
        if (!arg.startsWith("-") && !opts.project) {
          opts.project = arg;
          break;
        }
        console.error(`Unknown argument: ${arg}`);
        opts.help = true;
        break;
    }
  }

  return opts;
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (opts.help || !opts.project.trim()) {
    printHelp();
    process.exit(opts.help && !opts.project.trim() ? 0 : 1);
  }

  try {
    const result = await verifySchoolProject(opts);
    process.exit(result.ok ? 0 : 1);
  } catch (err) {
    console.error(`\nVerify failed: ${err instanceof Error ? err.message : err}`);
    process.exit(1);
  }
}

void main();
