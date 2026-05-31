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
import { useParentSideMenuItems } from "../../hooks/useParentSideMenuItems";
import { AuthContext } from "./authContext";

type ParentMenuContextValue = {
  openMenu: () => void;
  closeMenu: () => void;
};

const ParentMenuContext = createContext<ParentMenuContextValue | null>(null);

export function ParentMenuProvider({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const { userData } = useContext(AuthContext);
  const [visible, setVisible] = useState(false);
  const menuItems = useParentSideMenuItems();

  const openMenu = useCallback(() => setVisible(true), []);
  const closeMenu = useCallback(() => setVisible(false), []);

  const value = useMemo(() => ({ openMenu, closeMenu }), [openMenu, closeMenu]);

  return (
    <ParentMenuContext.Provider value={value}>
      {children}
      <AdminSideMenu
        visible={visible}
        onClose={closeMenu}
        title={t("tabs.parent.home")}
        subtitle={userData?.name ?? null}
        items={menuItems}
      />
    </ParentMenuContext.Provider>
  );
}

export function useParentMenu() {
  const ctx = useContext(ParentMenuContext);
  if (!ctx) {
    throw new Error("useParentMenu must be used within ParentMenuProvider");
  }
  return ctx;
}
