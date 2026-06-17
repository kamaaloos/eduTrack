import { describe, expect, it } from "vitest";
import type { AppNotification } from "../src/services/notifications";
import { getLocalizedNotificationDisplay } from "../src/utils/notificationDisplay";

const t = (key: string, params?: Record<string, string>) => {
  const translations: Record<string, string> = {
    "notifications.types.parent_complaint": "Vanhemman valitus",
    "notifications.types.parent_complaint_resolved": "Valitus ratkaistu",
    "notifications.parentComplaintTitle": "Uusi vanhemman valitus",
    "notifications.parentComplaintMessage":
      "Tarkista valitukset. {{parentName}} lähetti valituksen: \"{{subject}}\".",
    "notifications.parentComplaintResolvedTitle": "Valitus ratkaistu",
    "notifications.parentComplaintResolvedMessage":
      "Valituksesi \"{{subject}}\" on ratkaistu. Tarkista mahdolliset jatkotoimet.",
  };

  let value = translations[key] ?? key;
  if (params) {
    for (const [name, entry] of Object.entries(params)) {
      value = value.replaceAll(`{{${name}}}`, entry);
    }
  }
  return value;
};

function makeNotification(
  overrides: Partial<AppNotification>,
): AppNotification {
  return {
    id: "n1",
    title: "New parent complaint",
    message:
      'Please check complaints. Jane Parent submitted "Bus delay".',
    type: "parent_complaint",
    targetRole: "admin",
    targetUserId: "admin-1",
    studentId: null,
    classId: null,
    actorId: "parent-1",
    actorRole: "parent",
    localeParams: null,
    read: false,
    createdAt: null,
    ...overrides,
  };
}

describe("getLocalizedNotificationDisplay", () => {
  it("localizes admin parent complaint notifications", () => {
    const display = getLocalizedNotificationDisplay(
      makeNotification({
        localeParams: { parentName: "Jane Parent", subject: "Bus delay" },
      }),
      t,
    );

    expect(display.typeLabel).toBe("Vanhemman valitus");
    expect(display.title).toBe("Uusi vanhemman valitus");
    expect(display.message).toBe(
      'Tarkista valitukset. Jane Parent lähetti valituksen: "Bus delay".',
    );
  });

  it("falls back to parsing legacy English complaint messages", () => {
    const display = getLocalizedNotificationDisplay(
      makeNotification({
        type: "parent_complaint_resolved",
        title: "Complaint resolved",
        message:
          'Your complaint "Bus delay" has been resolved. Please check for any follow-up.',
      }),
      t,
    );

    expect(display.title).toBe("Valitus ratkaistu");
    expect(display.message).toBe(
      'Valituksesi "Bus delay" on ratkaistu. Tarkista mahdolliset jatkotoimet.',
    );
  });
});
