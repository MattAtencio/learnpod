"use client";

import { createContext, useContext, useState, useCallback } from "react";

type Direction = "forward" | "back" | "fade";

const NavDirectionContext = createContext<{
  direction: Direction;
  setForward: () => void;
  setBack: () => void;
  setFade: () => void;
}>({ direction: "fade", setForward: () => {}, setBack: () => {}, setFade: () => {} });

export function NavDirectionProvider({ children }: { children: React.ReactNode }) {
  const [direction, setDirection] = useState<Direction>("fade");
  const setForward = useCallback(() => setDirection("forward"), []);
  const setBack = useCallback(() => setDirection("back"), []);
  const setFade = useCallback(() => setDirection("fade"), []);
  return (
    <NavDirectionContext.Provider value={{ direction, setForward, setBack, setFade }}>
      {children}
    </NavDirectionContext.Provider>
  );
}

export function useNavDirection() {
  return useContext(NavDirectionContext);
}
