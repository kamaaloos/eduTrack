import AsyncStorage from "@react-native-async-storage/async-storage";

function storageKey(userId: string, schoolId: string): string {
  return `edutrack:dismissed:${schoolId}:${userId}`;
}

export async function readDismissedKeys(
  userId: string,
  schoolId: string,
): Promise<Set<string>> {
  try {
    const raw = await AsyncStorage.getItem(storageKey(userId, schoolId));
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((k): k is string => typeof k === "string"));
  } catch {
    return new Set();
  }
}

export async function addDismissedKey(
  userId: string,
  schoolId: string,
  key: string,
): Promise<void> {
  const current = await readDismissedKeys(userId, schoolId);
  if (current.has(key)) return;
  current.add(key);
  await AsyncStorage.setItem(
    storageKey(userId, schoolId),
    JSON.stringify([...current]),
  );
}
