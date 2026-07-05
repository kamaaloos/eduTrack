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
import { useSecretarySideMenuItems } from "../../hooks/useSecretarySideMenuItems";
import { useSchoolContext } from "./schoolContext";

type SecretaryMenuContextValue = {
  openMenu: () => void;
  closeMenu: () => void;
};

const SecretaryMenuContext = createContext<SecretaryMenuContextValue | null>(
  null,
);

export function SecretaryMenuProvider({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const { selectedSchool } = useSchoolContext();
  const [visible, setVisible] = useState(false);
  const menuItems = useSecretarySideMenuItems();

  const openMenu = useCallback(() => setVisible(true), []);
  const closeMenu = useCallback(() => setVisible(false), []);

  const value = useMemo(() => ({ openMenu, closeMenu }), [openMenu, closeMenu]);

  return (
    <SecretaryMenuContext.Provider value={value}>
      <WebDesktopRoleNav
        title={t("secretary.management")}
        subtitle={selectedSchool?.name ?? null}
        items={menuItems}
      >
        {children}
      </WebDesktopRoleNav>
      {visible ? (
        <AdminSideMenu
          visible
          onClose={closeMenu}
          title={t("secretary.management")}
          subtitle={selectedSchool?.name ?? null}
          subtitleTone="accent"
          items={menuItems}
        />
      ) : null}
    </SecretaryMenuContext.Provider>
  );
}

export function useSecretaryMenu() {
  const ctx = useContext(SecretaryMenuContext);
  if (!ctx) {
    throw new Error("useSecretaryMenu must be used within SecretaryMenuProvider");
  }
  return ctx;
}
