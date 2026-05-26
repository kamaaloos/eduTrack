import {
  getPostLoginRoute,
  CHANGE_PASSWORD_ROUTE,
} from "../src/utils/authNavigation";
import {
  isBlockedPassword,
  userMustChangePassword,
} from "../src/utils/mustChangePassword";

describe("userMustChangePassword", () => {
  it("is true only when flag is explicitly true", () => {
    expect(userMustChangePassword({ mustChangePassword: true })).toBe(true);
    expect(userMustChangePassword({ mustChangePassword: false })).toBe(false);
    expect(userMustChangePassword({})).toBe(false);
    expect(userMustChangePassword(null)).toBe(false);
  });
});

describe("isBlockedPassword", () => {
  it("rejects common temporary passwords", () => {
    expect(isBlockedPassword("123456")).toBe(true);
    expect(isBlockedPassword("PASSWORD")).toBe(true);
    expect(isBlockedPassword("MySecure7")).toBe(false);
  });
});

describe("getPostLoginRoute", () => {
  it("sends users with mustChangePassword to change-password screen", () => {
    expect(
      getPostLoginRoute("student", { mustChangePassword: true }),
    ).toBe(CHANGE_PASSWORD_ROUTE);
    expect(getPostLoginRoute("teacher", { mustChangePassword: false })).toBe(
      "/(teachers)/dashboard",
    );
  });
});
