import type { ComponentProps } from "react";
import type { Ionicons } from "@expo/vector-icons";

export type TimeGreetingNamespace = "dashboard" | "teacher.dashboard";

type IoniconName = ComponentProps<typeof Ionicons>["name"];

export type TimeGreetingParts = {
  key: `${TimeGreetingNamespace}.goodMorning` | `${TimeGreetingNamespace}.goodAfternoon` | `${TimeGreetingNamespace}.goodEvening`;
  icon: IoniconName;
};

/** Localized greeting key + icon for the current time of day. */
export function getTimeGreetingParts(
  namespace: TimeGreetingNamespace = "dashboard",
): TimeGreetingParts {
  const hour = new Date().getHours();
  if (hour < 12) {
    return { key: `${namespace}.goodMorning`, icon: "sunny-outline" };
  }
  if (hour < 18) {
    return { key: `${namespace}.goodAfternoon`, icon: "partly-sunny-outline" };
  }
  return { key: `${namespace}.goodEvening`, icon: "moon-outline" };
}
