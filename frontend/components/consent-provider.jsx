"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { getConsent, initConsent, subscribeConsent } from "@/lib/analytics";

const ConsentCtx = createContext({
  analytics: false,
  marketing: false,
  ready: false,
  decidedAt: null,
});

export function ConsentProvider({ children }) {
  const [snapshot, setSnapshot] = useState(() => getConsent());

  useEffect(() => {
    initConsent();
    setSnapshot(getConsent());
    return subscribeConsent(setSnapshot);
  }, []);

  return <ConsentCtx.Provider value={snapshot}>{children}</ConsentCtx.Provider>;
}

export function useConsent() {
  return useContext(ConsentCtx);
}
