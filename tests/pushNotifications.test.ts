import { notificationsRouteForRole } from "../src/utils/pushNotificationRoutes";

describe("pushNotificationRoutes", () => {
  it("maps roles to notification routes", () => {
    expect(notificationsRouteForRole("student")).toBe("/(students)/notifications");
    expect(notificationsRouteForRole("parent")).toBe("/(parent)/notifications");
    expect(notificationsRouteForRole("teacher")).toBe("/(teachers)/notifications");
    expect(notificationsRouteForRole("admin")).toBe("/(admin)/notifications");
    expect(notificationsRouteForRole(null)).toBeNull();
  });
});
