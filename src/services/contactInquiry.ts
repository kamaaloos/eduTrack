import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  type Timestamp,
} from "firebase/firestore";
import { registryDb } from "./firebase";

export type ContactInquiryInput = {
  name: string;
  email: string;
  schoolName: string;
  message: string;
  language: string;
};

export type ContactInquiry = ContactInquiryInput & {
  id: string;
  createdAt: Date | null;
};

function requireRegistryDb() {
  if (!registryDb) {
    throw new Error("Firebase registry is not configured");
  }
  return registryDb;
}

function mapContactInquiry(
  id: string,
  data: Record<string, unknown>,
): ContactInquiry {
  const createdAtRaw = data.createdAt as Timestamp | undefined;
  return {
    id,
    name: typeof data.name === "string" ? data.name : "",
    email: typeof data.email === "string" ? data.email : "",
    schoolName: typeof data.schoolName === "string" ? data.schoolName : "",
    message: typeof data.message === "string" ? data.message : "",
    language: typeof data.language === "string" ? data.language : "",
    createdAt: createdAtRaw?.toDate?.() ?? null,
  };
}

export async function submitContactInquiry(input: ContactInquiryInput): Promise<void> {
  const db = requireRegistryDb();
  await addDoc(collection(db, "contactInquiries"), {
    name: input.name.trim(),
    email: input.email.trim(),
    schoolName: input.schoolName.trim(),
    message: input.message.trim(),
    language: input.language,
    createdAt: serverTimestamp(),
  });
}

export async function listContactInquiries(): Promise<ContactInquiry[]> {
  const db = requireRegistryDb();
  const snapshot = await getDocs(
    query(
      collection(db, "contactInquiries"),
      orderBy("createdAt", "desc"),
      limit(100),
    ),
  );
  return snapshot.docs.map((docSnap) =>
    mapContactInquiry(docSnap.id, docSnap.data()),
  );
}

export async function deleteContactInquiry(id: string): Promise<void> {
  const db = requireRegistryDb();
  await deleteDoc(doc(db, "contactInquiries", id));
}
