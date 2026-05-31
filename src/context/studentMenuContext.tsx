import { useSegments } from "expo-router";
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
import { MenuOverlayButton } from "../../components/navigation/MenuOverlayButton";
import { useStudentSideMenuItems } from "../../hooks/useStudentSideMenuItems";
import { AuthContext } from "./authContext";

type StudentMenuContextValue = {
  openMenu: () => void;
  closeMenu: () => void;
};

const StudentMenuContext = createContext<StudentMenuContextValue | null>(null);

export function StudentMenuProvider({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const { userData } = useContext(AuthContext);
  const [visible, setVisible] = useState(false);
  const menuItems = useStudentSideMenuItems();
  const segments = useSegments();

  const openMenu = useCallback(() => setVisible(true), []);
  const closeMenu = useCallback(() => setVisible(false), []);

  const value = useMemo(() => ({ openMenu, closeMenu }), [openMenu, closeMenu]);

  const firstName = userData?.name?.split(" ")[0] ?? t("common.student");
  const showMenuOverlay = segments.at(-1) !== "dashboard";

  return (
    <StudentMenuContext.Provider value={value}>
      {children}
      {showMenuOverlay ? (
        <MenuOverlayButton onPress={openMenu} align="right" />
      ) : null}
      <AdminSideMenu
        visible={visible}
        onClose={closeMenu}
        title={t("admin.management")}
        subtitle={firstName}
        items={menuItems}
      />
    </StudentMenuContext.Provider>
  );
}

export function useStudentMenu() {
  const ctx = useContext(StudentMenuContext);
  if (!ctx) {
    throw new Error("useStudentMenu must be used within StudentMenuProvider");
  }
  return ctx;
}
