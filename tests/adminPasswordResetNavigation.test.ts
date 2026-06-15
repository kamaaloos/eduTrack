import {
  isPasswordResetNotification,
  resolvePasswordResetDirectoryTarget,
} from "../src/utils/adminPasswordResetNavigation";
import type { AppNotification } from "../src/services/notifications";

function notification(partial: Partial<AppNotification> & Pick<AppNotification, "id">): AppNotification {
  return {
    id: partial.id,
    title: partial.title ?? "",
    message: partial.message ?? "",
    type: partial.type ?? "announcement",
    targetRole: partial.targetRole ?? "admin",
    targetUserId: partial.targetUserId ?? "admin-1",
    studentId: partial.studentId ?? null,
    classId: partial.classId ?? null,
    actorId: partial.actorId ?? null,
    actorRole: partial.actorRole ?? null,
    read: partial.read ?? false,
    createdAt: partial.createdAt ?? null,
  };
}

describe("adminPasswordResetNavigation", () => {
  const usersByRole = {
    students: [{ id: "s1" }],
    teachers: [{ id: "t1" }],
    parents: [{ id: "p1" }],
  };

  it("resolves role from actorRole on notification", () => {
    const item = notification({
      id: "n1",
      type: "password_reset_request",
      actorId: "s1",
      actorRole: "student",
    });

    expect(isPasswordResetNotification(item)).toBe(true);
    expect(resolvePasswordResetDirectoryTarget(item, usersByRole)).toEqual({
      role: "student",
      userId: "s1",
    });
  });

  it("falls back to loaded user lists when actorRole is missing", () => {
    const item = notification({
      id: "n2",
      type: "password_reset_request",
      actorId: "t1",
    });

    expect(resolvePasswordResetDirectoryTarget(item, usersByRole)).toEqual({
      role: "teacher",
      userId: "t1",
    });
  });

  it("returns null when user cannot be resolved", () => {
    const item = notification({
      id: "n3",
      type: "password_reset_request",
      actorId: "missing",
    });

    expect(resolvePasswordResetDirectoryTarget(item, usersByRole)).toBeNull();
  });
});
