import { Redirect } from "expo-router";

/** Remarks live under Academic → Remarks tab (single flow). */
export default function TeacherRemarksRedirect() {
  return <Redirect href="/(teachers)/academic?tab=remarks" />;
}
