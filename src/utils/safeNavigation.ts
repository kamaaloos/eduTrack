import { InteractionManager, Platform } from "react-native";

type ReplaceRouter = {
  replace: (href: string) => void;
};

/** Defer route replace on Android so the previous screen unmounts before Fabric mounts the next. */
export function safeRouterReplace(router: ReplaceRouter, href: string): void {
  const go = () => router.replace(href as never);

  if (Platform.OS === "android") {
    InteractionManager.runAfterInteractions(() => {
      requestAnimationFrame(go);
    });
    return;
  }

  go();
}
