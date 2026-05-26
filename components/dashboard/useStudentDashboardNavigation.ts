import { router } from "expo-router";
import { useMemo } from "react";
import type { StudentDashboardNavigation } from "./studentDashboardTypes";

type Options = {
  routePrefix: string;
  hideViewAllRoutes: boolean;
};

export function useStudentDashboardNavigation({
  routePrefix,
  hideViewAllRoutes,
}: Options): StudentDashboardNavigation {
  return useMemo(() => {
    const listRoute = (path: string) =>
      hideViewAllRoutes ? undefined : `${routePrefix}${path}`;

    const openStudentDetail = (
      pathname: string,
      params: Record<string, string>,
    ) => {
      router.push({ pathname, params } as never);
    };

    const openParentDetail = (params: Record<string, string>) => {
      router.push({ pathname: "/(parent)/detail", params } as never);
    };

    return {
      routePrefix,
      listRoute,
      openStudentDetail,
      openParentDetail,
    };
  }, [routePrefix, hideViewAllRoutes]);
}
