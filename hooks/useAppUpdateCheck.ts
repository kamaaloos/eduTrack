import { useCallback, useEffect, useState } from "react";
import {
  checkForAppUpdate,
  type AppUpdateStatus,
} from "../src/services/appUpdateCheck";

export function useAppUpdateCheck() {
  const [status, setStatus] = useState<AppUpdateStatus>({ state: "checking" });

  const refresh = useCallback(async () => {
    setStatus({ state: "checking" });
    setStatus(await checkForAppUpdate());
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { status, refresh };
}
