"use client";

import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useState,
} from "react";

import type { BrowseMode } from "../types";

type BrowseModeContextValue = {
  mode: BrowseMode;
  setMode: (mode: BrowseMode) => void;
};

const BrowseModeContext = createContext<BrowseModeContextValue | null>(null);

export function BrowseModeProvider({ children }: PropsWithChildren) {
  const [mode, setModeState] = useState<BrowseMode>("discover");

  const setMode = useCallback((nextMode: BrowseMode) => {
    setModeState(nextMode);
  }, []);

  return (
    <BrowseModeContext.Provider value={{ mode, setMode }}>
      {children}
    </BrowseModeContext.Provider>
  );
}

export function useBrowseMode() {
  const context = useContext(BrowseModeContext);

  if (!context) {
    throw new Error("useBrowseMode must be used within a BrowseModeProvider");
  }

  return context;
}
