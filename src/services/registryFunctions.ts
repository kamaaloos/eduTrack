import { getFunctions, type Functions } from "firebase/functions";
import { getRegistryFirebaseApp } from "./firebase";

/** Registry Cloud Functions (e.g. refreshSchoolUserCounts) deploy to us-central1. */
const REGISTRY_FUNCTIONS_REGION = "us-central1";

let registryFunctions: Functions | null = null;

export function getRegistryFunctions(): Functions | null {
  const app = getRegistryFirebaseApp();
  if (!app) {
    return null;
  }

  if (!registryFunctions) {
    registryFunctions = getFunctions(app, REGISTRY_FUNCTIONS_REGION);
  }

  return registryFunctions;
}
