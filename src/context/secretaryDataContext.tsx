import React, { createContext, useContext, useMemo } from "react";
import { useSecretaryParents } from "../../hooks/useSecretaryParents";
import type { UserData } from "../../hooks/useAdminUsers";

type SecretaryDataContextValue = {
  parents: UserData[];
  usersLoading: boolean;
  loadUsers: () => Promise<void>;
};

const SecretaryDataContext = createContext<SecretaryDataContextValue | null>(
  null,
);

export function SecretaryDataProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { parents, loading, loadParents } = useSecretaryParents();

  const value = useMemo(
    () => ({
      parents,
      usersLoading: loading,
      loadUsers: loadParents,
    }),
    [parents, loading, loadParents],
  );

  return (
    <SecretaryDataContext.Provider value={value}>
      {children}
    </SecretaryDataContext.Provider>
  );
}

export function useSecretaryData() {
  const ctx = useContext(SecretaryDataContext);
  if (!ctx) {
    throw new Error("useSecretaryData must be used within SecretaryDataProvider");
  }
  return ctx;
}
