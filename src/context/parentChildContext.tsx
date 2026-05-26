import React, { createContext, useContext, useMemo, useState } from "react";

export type SelectedChild = {
  id: string;
  name: string;
  classId?: string;
  className?: string;
};

type ParentChildContextValue = {
  selectedChild: SelectedChild | null;
  setSelectedChild: (child: SelectedChild | null) => void;
};

const ParentChildContext = createContext<ParentChildContextValue | null>(null);

export function ParentChildProvider({ children }: { children: React.ReactNode }) {
  const [selectedChild, setSelectedChild] = useState<SelectedChild | null>(null);

  const value = useMemo(
    () => ({ selectedChild, setSelectedChild }),
    [selectedChild],
  );

  return (
    <ParentChildContext.Provider value={value}>
      {children}
    </ParentChildContext.Provider>
  );
}

export function useParentChild() {
  const ctx = useContext(ParentChildContext);
  if (!ctx) {
    throw new Error("useParentChild must be used within ParentChildProvider");
  }
  return ctx;
}
