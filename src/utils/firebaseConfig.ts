import type { SchoolFirebaseConfig } from "../types/school";

/** Default Firebase Storage bucket when registry entry omits storageBucket. */
export function defaultStorageBucket(projectId: string): string {
  const id = projectId.trim();
  if (!id) return "";
  return `${id}.appspot.com`;
}

export function normalizeSchoolFirebaseConfig(
  config: SchoolFirebaseConfig,
): SchoolFirebaseConfig {
  const projectId = config.projectId.trim();
  const storageBucket =
    config.storageBucket?.trim() || defaultStorageBucket(projectId);

  return {
    ...config,
    apiKey: config.apiKey.trim(),
    authDomain: config.authDomain.trim(),
    projectId,
    storageBucket,
    messagingSenderId: config.messagingSenderId.trim(),
    appId: config.appId.trim(),
  };
}
