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
import { useAdminSideMenuItems } from "../../hooks/useAdminSideMenuItems";
import { useSchoolContext } from "./schoolContext";

type AdminMenuContextValue = {
  openMenu: () => void;
  closeMenu: () => void;
};

const AdminMenuContext = createContext<AdminMenuContextValue | null>(null);

export function AdminMenuProvider({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const { selectedSchool } = useSchoolContext();
  const [visible, setVisible] = useState(false);
  const menuItems = useAdminSideMenuItems();

  const openMenu = useCallback(() => setVisible(true), []);
  const closeMenu = useCallback(() => setVisible(false), []);

  const value = useMemo(() => ({ openMenu, closeMenu }), [openMenu, closeMenu]);

  return (
    <AdminMenuContext.Provider value={value}>
      <WebDesktopRoleNav
        title={t("admin.management")}
        subtitle={selectedSchool?.name ?? null}
        items={menuItems}
      >
        {children}
      </WebDesktopRoleNav>
      {visible ? (
        <AdminSideMenu
          visible
          onClose={closeMenu}
          title={t("admin.management")}
          subtitle={selectedSchool?.name ?? null}
          subtitleTone="accent"
          items={menuItems}
        />
      ) : null}
    </AdminMenuContext.Provider>
  );
}

export function useAdminMenu() {
  const ctx = useContext(AdminMenuContext);
  if (!ctx) {
    throw new Error("useAdminMenu must be used within AdminMenuProvider");
  }
  return ctx;
}
