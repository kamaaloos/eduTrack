import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import type { SchoolThemeConfig, SchoolThemeInput } from "../types/schoolTheme";
import {
  normalizeSchoolThemeInput,
  themeToFirestore,
  validateThemeInput,
} from "../utils/schoolTheme";
import { db, requireSchoolDb } from "./firebase";

function appearanceDocRef() {
  return doc(requireSchoolDb(), "platform", "appearance");
}

export async function getSchoolAppearance(): Promise<SchoolThemeInput | null> {
  if (!db) return null;
  try {
    const snap = await getDoc(doc(db, "platform", "appearance"));
    if (!snap.exists()) return null;
    return normalizeSchoolThemeInput(snap.data());
  } catch (err) {
    const code = String((err as { code?: string })?.code ?? "");
    const message = String((err as Error)?.message ?? "");
    // Expected before login / when school rules are not yet deployed.
    if (
      code === "permission-denied" ||
      message.toLowerCase().includes("permission")
    ) {
      return null;
    }
    console.warn("getSchoolAppearance failed:", err);
    return null;
  }
}

export async function setSchoolAppearance(
  theme: SchoolThemeConfig,
): Promise<void> {
  const error = validateThemeInput(theme);
  if (error) throw new Error(error);

  await setDoc(
    appearanceDocRef(),
    {
      ...themeToFirestore(theme),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}
