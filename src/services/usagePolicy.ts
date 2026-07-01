import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db } from "./firebase";
import { USAGE_POLICY_VERSION } from "../constants/usagePolicy";
import {
  USAGE_POLICY_ACCEPTED_AT_FIELD,
  USAGE_POLICY_ACCEPTED_VERSION_FIELD,
} from "../utils/usagePolicy";

export async function acceptAdminUsagePolicy(): Promise<void> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("You must be signed in to accept the usage policy.");
  }

  const profileSnap = await getDoc(doc(db, "users", user.uid));
  const role = profileSnap.data()?.role;
  if (role !== "admin") {
    throw new Error("Only school administrators can accept this policy.");
  }

  await setDoc(
    doc(db, "users", user.uid),
    {
      [USAGE_POLICY_ACCEPTED_VERSION_FIELD]: USAGE_POLICY_VERSION,
      [USAGE_POLICY_ACCEPTED_AT_FIELD]: serverTimestamp(),
    },
    { merge: true },
  );
}
