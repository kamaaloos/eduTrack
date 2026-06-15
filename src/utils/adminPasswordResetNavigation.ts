import type { UserRole } from "../../hooks/useAdminUsers";
import type { AppNotification, NotificationRole } from "../services/notifications";

const DIRECTORY_ROLES: UserRole[] = ["student", "teacher", "parent"];

function isDirectoryRole(value: string | null | undefined): value is UserRole {
  return DIRECTORY_ROLES.includes(value as UserRole);
}

export type PasswordResetDirectoryTarget = {
  role: UserRole;
  userId: string;
};

export function resolvePasswordResetDirectoryTarget(
  notification: AppNotification,
  usersByRole: {
    students: { id: string }[];
    teachers: { id: string }[];
    parents: { id: string }[];
  },
): PasswordResetDirectoryTarget | null {
  const userId = notification.actorId?.trim();
  if (!userId || notification.type !== "password_reset_request") {
    return null;
  }

  const actorRole = notification.actorRole;
  if (isDirectoryRole(actorRole)) {
    return { role: actorRole, userId };
  }

  if (usersByRole.students.some((user) => user.id === userId)) {
    return { role: "student", userId };
  }
  if (usersByRole.teachers.some((user) => user.id === userId)) {
    return { role: "teacher", userId };
  }
  if (usersByRole.parents.some((user) => user.id === userId)) {
    return { role: "parent", userId };
  }

  return null;
}

export function isPasswordResetNotification(
  notification: AppNotification,
): boolean {
  return notification.type === "password_reset_request";
}

export function parseNotificationActorRole(
  value: unknown,
): NotificationRole | null {
  if (typeof value !== "string") return null;
  if (isDirectoryRole(value)) return value;
  return null;
}
