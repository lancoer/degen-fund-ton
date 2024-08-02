"use client";

import { UserDto } from "@/lib/data/dtos";
import useAuthStore from "@/store/use-auth-store";
import { useEffect } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export const PRIORITY_RATE = 1_500_000;

export const SLIPPAGE = 5;

interface ReferrerStore {
  referrer?: UserDto | null;
  setReferrer: (referrer: UserDto | null) => void;
}

export const useReferrerStore = create<ReferrerStore>()(
  persist(
    (set) => ({
      referrer: undefined,
      setReferrer: (referrer) => set({ referrer }),
    }),
    {
      name: "ref.v-0",
    }
  )
);

export const useSavedReferrer = (referrer?: UserDto) => {
  const { referrer: storedReferrer, setReferrer } = useReferrerStore();
  const { user } = useAuthStore();

  useEffect(() => {
    if (
      !!referrer &&
      storedReferrer == undefined &&
      user?.wallet !== referrer.wallet
    ) {
      setReferrer(referrer);
    } else if (storedReferrer == undefined) {
      setReferrer(null);
    }
  }, [referrer, setReferrer, user]);

  return storedReferrer;
};
