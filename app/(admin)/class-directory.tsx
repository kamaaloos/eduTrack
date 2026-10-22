import { Redirect } from "expo-router";

/** Legacy route — class rename/delete now lives on Classes. */
export default function ClassDirectoryScreen() {
  return <Redirect href="/(admin)/classes" />;
}
