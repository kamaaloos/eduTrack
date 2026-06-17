import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { requireSchoolDb } from "./firebase";
import {
  notifyAdminsParentComplaint,
  notifyParentComplaintResolved,
} from "./notificationEvents";

export type ParentComplaintStatus = "open" | "resolved";

export type ParentComplaint = {
  id: string;
  parentId: string;
  parentName: string;
  subject: string;
  message: string;
  status: ParentComplaintStatus;
  createdAt: Date | null;
  resolvedAt: Date | null;
  resolvedBy: string | null;
};

function toDate(value: unknown): Date | null {
  if (!value) return null;
  if (typeof value === "object" && value !== null && "toDate" in value) {
    return (value as { toDate: () => Date }).toDate();
  }
  if (typeof value === "object" && value !== null && "seconds" in value) {
    return new Date((value as { seconds: number }).seconds * 1000);
  }
  const parsed = new Date(String(value));
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export async function submitParentComplaint(input: {
  parentId: string;
  parentName: string;
  subject: string;
  message: string;
}): Promise<string> {
  const db = requireSchoolDb();
  const ref = await addDoc(collection(db, "parentComplaints"), {
    parentId: input.parentId,
    parentName: input.parentName,
    subject: input.subject,
    message: input.message,
    status: "open" as ParentComplaintStatus,
    createdAt: serverTimestamp(),
    resolvedAt: null,
    resolvedBy: null,
  });

  await notifyAdminsParentComplaint({
    parentId: input.parentId,
    parentName: input.parentName,
    subject: input.subject,
    message: input.message,
  });

  return ref.id;
}

export async function listParentComplaints(): Promise<ParentComplaint[]> {
  const db = requireSchoolDb();
  const snap = await getDocs(collection(db, "parentComplaints"));
  return snap.docs
    .map((item) => {
      const data = item.data();
      return {
        id: item.id,
        parentId: String(data.parentId ?? ""),
        parentName: String(data.parentName ?? ""),
        subject: String(data.subject ?? ""),
        message: String(data.message ?? ""),
        status:
          data.status === "resolved"
            ? ("resolved" as ParentComplaintStatus)
            : ("open" as ParentComplaintStatus),
        createdAt: toDate(data.createdAt),
        resolvedAt: toDate(data.resolvedAt),
        resolvedBy:
          typeof data.resolvedBy === "string" && data.resolvedBy
            ? data.resolvedBy
            : null,
      } satisfies ParentComplaint;
    })
    .sort((a, b) => {
      const ta = a.createdAt?.getTime() ?? 0;
      const tb = b.createdAt?.getTime() ?? 0;
      return tb - ta;
    });
}

export async function setParentComplaintStatus(params: {
  complaintId: string;
  status: ParentComplaintStatus;
  adminId: string;
}): Promise<void> {
  const db = requireSchoolDb();
  const complaintRef = doc(db, "parentComplaints", params.complaintId);
  const snap = await getDoc(complaintRef);
  if (!snap.exists()) {
    throw new Error("Complaint not found");
  }

  const data = snap.data();
  const previousStatus =
    data.status === "resolved"
      ? ("resolved" as ParentComplaintStatus)
      : ("open" as ParentComplaintStatus);
  const parentId = String(data.parentId ?? "");
  const subject = String(data.subject ?? "Your complaint");

  await updateDoc(complaintRef, {
    status: params.status,
    resolvedAt: params.status === "resolved" ? serverTimestamp() : null,
    resolvedBy: params.status === "resolved" ? params.adminId : null,
  });

  if (
    params.status === "resolved" &&
    previousStatus !== "resolved" &&
    parentId
  ) {
    await notifyParentComplaintResolved({
      parentId,
      subject,
      adminId: params.adminId,
    });
  }
}
