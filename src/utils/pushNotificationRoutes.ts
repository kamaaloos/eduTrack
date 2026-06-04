export function notificationsRouteForRole(
  role: string | null | undefined,
): string | null {
  switch (role) {
    case "student":
      return "/(students)/notifications";
    case "parent":
      return "/(parent)/notifications";
    case "teacher":
      return "/(teachers)/notifications";
    case "admin":
      return "/(admin)/notifications";
    default:
      return null;
  }
}
