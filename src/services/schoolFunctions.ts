import { getApp } from "firebase/app";
import { getFunctions, type Functions } from "firebase/functions";
import { getConnectedSchoolProjectId } from "./schoolConnectionState";

/** School Cloud Functions deploy to us-central1 (firebase.school.json). */
const SCHOOL_FUNCTIONS_REGION = "us-central1";

let schoolFunctions: Functions | null = null;
let schoolFunctionsProjectId: string | null = null;

export function getSchoolFunctions(): Functions | null {
  const projectId = getConnectedSchoolProjectId();
  if (!projectId) {
    return null;
  }

  if (schoolFunctions && schoolFunctionsProjectId === projectId) {
    return schoolFunctions;
  }

  try {
    const app = getApp(`EduTrackSchool-${projectId}`);
    schoolFunctions = getFunctions(app, SCHOOL_FUNCTIONS_REGION);
    schoolFunctionsProjectId = projectId;
    return schoolFunctions;
  } catch {
    schoolFunctions = null;
    schoolFunctionsProjectId = null;
    return null;
  }
}

export function resetSchoolFunctionsCache(): void {
  schoolFunctions = null;
  schoolFunctionsProjectId = null;
}
