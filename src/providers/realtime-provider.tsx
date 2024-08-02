"use client";

import useRealtime from "@/hooks/use-realtime";

import { createContext } from "react";

type RealtimeContextType = {
  lastJsonMessage: unknown;
};

export const RealtimeContext = createContext<RealtimeContextType>({
  lastJsonMessage: null,
});

type RealtimeProviderProps = {
  children: React.ReactNode;
};

const RealtimeProvider = ({ children }: RealtimeProviderProps) => {
  const realtime = useRealtime();

  return (
    <RealtimeContext.Provider value={realtime}>
      {children}
    </RealtimeContext.Provider>
  );
};

export default RealtimeProvider;
