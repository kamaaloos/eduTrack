import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  setDoc,
  writeBatch,
  type Firestore,
} from "firebase/firestore";
import type {
  FinishSchoolTermResult,
  SchoolTermPurgeCounts,
  SchoolTermRecord,
} from "../types/schoolTerm";
import {
  defaultSchoolTermLabel,
} from "../utils/academicYear";
import {
  emptySchoolTermPurgeCounts,
  purgeCountKeyForRootCollection,
  SCHOOL_TERM_CLASS_SUBCOLLECTIONS,
  SCHOOL_TERM_ROOT_COLLECTIONS,
} from "../utils/schoolTermPurge";
import { resolveSchoolTerm } from "../utils/schoolTerm";
import { db, requireSchoolDb } from "./firebase";

const SCHOOL_TERM_DOC = "platform/schoolTerm";
const DELETE_BATCH_SIZE = 400;

export type SchoolTermProgress = {
  stage: string;
  deleted: number;
};

function schoolDbOrThrow(): Firestore {
  return requireSchoolDb();
}

export async function getSchoolTermRecord(): Promise<SchoolTermRecord | null> {
  if (!db) return null;
  const snap = await getDoc(doc(db, SCHOOL_TERM_DOC));
  if (!snap.exists()) return null;
  const data = snap.data();
  if (data.status !== "active" && data.status !== "between") return null;
  return {
    status: data.status,
    label: String(data.label ?? defaultSchoolTermLabel()),
    startedAt: String(data.startedAt ?? new Date().toISOString()),
    startedBy: String(data.startedBy ?? ""),
    endedAt: data.endedAt ?? null,
    endedBy: data.endedBy ?? null,
  };
}

async function deleteQueryBatch(
  schoolDb: Firestore,
  docs: { ref: { path: string } }[],
): Promise<number> {
  if (docs.length === 0) return 0;
  const batch = writeBatch(schoolDb);
  docs.forEach((item) => batch.delete(item.ref));
  await batch.commit();
  return docs.length;
}

async function deleteCollectionPath(
  schoolDb: Firestore,
  path: string,
  onProgress?: (progress: SchoolTermProgress) => void,
): Promise<number> {
  let total = 0;
  while (true) {
    const snap = await getDocs(
      query(collection(schoolDb, path), limit(DELETE_BATCH_SIZE)),
    );
    if (snap.empty) break;
    const deleted = await deleteQueryBatch(schoolDb, snap.docs);
    total += deleted;
    onProgress?.({ stage: path, deleted: total });
  }
  return total;
}

async function purgeRootCollections(
  schoolDb: Firestore,
  counts: SchoolTermPurgeCounts,
  onProgress?: (progress: SchoolTermProgress) => void,
): Promise<void> {
  for (const name of SCHOOL_TERM_ROOT_COLLECTIONS) {
    const deleted = await deleteCollectionPath(schoolDb, name, onProgress);
    const key = purgeCountKeyForRootCollection(name);
    if (key === "announcements" && name === "messages") {
      counts.announcements += deleted;
    } else if (key === "legacyRoot") {
      counts.legacyRoot += deleted;
    } else {
      counts[key] += deleted;
    }
  }
}

async function purgeClassSubcollections(
  schoolDb: Firestore,
  counts: SchoolTermPurgeCounts,
  onProgress?: (progress: SchoolTermProgress) => void,
): Promise<void> {
  const classesSnap = await getDocs(collection(schoolDb, "classes"));
  for (const classDoc of classesSnap.docs) {
    const classId = classDoc.id;
    for (const sub of SCHOOL_TERM_CLASS_SUBCOLLECTIONS) {
      const path = `classes/${classId}/${sub}`;
      const deleted = await deleteCollectionPath(schoolDb, path, onProgress);
      switch (sub) {
        case "homework":
          counts.homework += deleted;
          break;
        case "exams":
          counts.exams += deleted;
          break;
        case "remarks":
          counts.remarks += deleted;
          break;
        case "announcements":
          counts.announcements += deleted;
          break;
        case "schedules":
          counts.schedules += deleted;
          break;
        default:
          break;
      }
    }
  }
}

export async function startSchoolTerm(
  adminUid: string,
  label?: string,
): Promise<SchoolTermRecord> {
  const schoolDb = schoolDbOrThrow();
  const existing = await getSchoolTermRecord();
  if (existing?.status === "active") {
    throw new Error("SCHOOL_TERM_ALREADY_ACTIVE");
  }

  const now = new Date().toISOString();
  const record: SchoolTermRecord = {
    status: "active",
    label: label?.trim() || defaultSchoolTermLabel(),
    startedAt: now,
    startedBy: adminUid,
    endedAt: null,
    endedBy: null,
  };

  await setDoc(doc(schoolDb, SCHOOL_TERM_DOC), record, { merge: true });
  return record;
}

export async function finishSchoolTerm(
  adminUid: string,
  onProgress?: (progress: SchoolTermProgress) => void,
): Promise<FinishSchoolTermResult> {
  const schoolDb = schoolDbOrThrow();
  const existing = resolveSchoolTerm(await getSchoolTermRecord());
  if (existing.status === "between") {
    throw new Error("SCHOOL_TERM_ALREADY_BETWEEN");
  }

  const counts = emptySchoolTermPurgeCounts();
  await purgeRootCollections(schoolDb, counts, onProgress);
  await purgeClassSubcollections(schoolDb, counts, onProgress);

  const now = new Date().toISOString();
  const term: SchoolTermRecord = {
    ...existing,
    status: "between",
    endedAt: now,
    endedBy: adminUid,
  };

  await setDoc(doc(schoolDb, SCHOOL_TERM_DOC), term, { merge: true });
  return { term, deleted: counts };
}
