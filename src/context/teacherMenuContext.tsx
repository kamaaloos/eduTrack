import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useTranslation } from "react-i18next";
import { AdminSideMenu } from "../../components/admin/AdminSideMenu";
import {
  TEACHER_WEB_NAV_GROUPS,
  WebAdminDesktopNav,
  resolveTeacherActiveKey,
} from "../../components/admin/web/WebAdminDesktopNav";
import { usePlatformLayout } from "../../hooks/usePlatformLayout";
import { useTeacherSideMenuItems } from "../../hooks/useTeacherSideMenuItems";
import { AuthContext } from "./authContext";
import { useSchoolContext } from "./schoolContext";

type TeacherMenuContextValue = {
  openMenu: () => void;
  closeMenu: () => void;
};

const TeacherMenuContext = createContext<TeacherMenuContextValue | null>(null);

export function TeacherMenuProvider({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const layout = usePlatformLayout();
  const { selectedSchool } = useSchoolContext();
  const { userData } = useContext(AuthContext);
  const [visible, setVisible] = useState(false);
  const menuItems = useTeacherSideMenuItems();

  const openMenu = useCallback(() => setVisible(true), []);
  const closeMenu = useCallback(() => setVisible(false), []);

  const value = useMemo(() => ({ openMenu, closeMenu }), [openMenu, closeMenu]);

  const firstName = userData?.name?.split(" ")[0] ?? t("common.teacher");

  const shell = layout.showWebSidebar ? (
    <WebAdminDesktopNav
      items={menuItems}
      groups={TEACHER_WEB_NAV_GROUPS}
      resolveActiveKey={resolveTeacherActiveKey}
      roleLabelKey="common.teacher"
    >
      {children}
    </WebAdminDesktopNav>
  ) : (
    children
  );

  return (
    <TeacherMenuContext.Provider value={value}>
      {shell}
      {visible ? (
        <AdminSideMenu
          visible
          onClose={closeMenu}
          title={t("admin.management")}
          subtitle={selectedSchool?.name ?? firstName}
          subtitleTone="accent"
          items={menuItems}
        />
      ) : null}
    </TeacherMenuContext.Provider>
  );
}

export function useTeacherMenu() {
  const ctx = useContext(TeacherMenuContext);
  if (!ctx) {
    throw new Error("useTeacherMenu must be used within TeacherMenuProvider");
  }
  return ctx;
}
