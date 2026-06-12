import { Redirect } from "expo-router";
import { Platform } from "react-native";
import { WebLandingPage } from "../components/landing/WebLandingPage";

/** Public marketing entry for the web app. Native clients use onboarding instead. */
export default function LandingScreen() {
  if (Platform.OS !== "web") {
    return <Redirect href="/" />;
  }

  return <WebLandingPage />;
}
