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
import { WebDesktopRoleNav } from "../../components/layout/WebDesktopRoleNav";
import { useTeacherSideMenuItems } from "../../hooks/useTeacherSideMenuItems";
import { AuthContext } from "./authContext";

type TeacherMenuContextValue = {
  openMenu: () => void;
  closeMenu: () => void;
};

const TeacherMenuContext = createContext<TeacherMenuContextValue | null>(null);

export function TeacherMenuProvider({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const { userData } = useContext(AuthContext);
  const [visible, setVisible] = useState(false);
  const menuItems = useTeacherSideMenuItems();

  const openMenu = useCallback(() => setVisible(true), []);
  const closeMenu = useCallback(() => setVisible(false), []);

  const value = useMemo(() => ({ openMenu, closeMenu }), [openMenu, closeMenu]);

  const firstName = userData?.name?.split(" ")[0] ?? t("common.teacher");

  return (
    <TeacherMenuContext.Provider value={value}>
      <WebDesktopRoleNav
        title={t("admin.management")}
        subtitle={firstName}
        items={menuItems}
      >
        {children}
      </WebDesktopRoleNav>
      {visible ? (
        <AdminSideMenu
          visible
          onClose={closeMenu}
          title={t("admin.management")}
          subtitle={firstName}
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
