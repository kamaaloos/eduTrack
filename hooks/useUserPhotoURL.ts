import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../src/services/firebase";

export function useUserPhotoURL(userId: string | null | undefined): string | null {
  const [photoURL, setPhotoURL] = useState<string | null>(null);

  useEffect(() => {
    if (!userId || !db) {
      setPhotoURL(null);
      return;
    }

    let cancelled = false;
    void (async () => {
      try {
        const snap = await getDoc(doc(db, "users", userId));
        if (cancelled) return;
        const url = snap.data()?.photoURL;
        setPhotoURL(typeof url === "string" && url.trim() ? url.trim() : null);
      } catch {
        if (!cancelled) setPhotoURL(null);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  return photoURL;
}
