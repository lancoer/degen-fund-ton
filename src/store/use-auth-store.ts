import { UserDto } from "@/lib/data/dtos";
import { create } from "zustand";

type AuthStoreType = {
  user?: UserDto;
  isSigning: boolean;
  setUser: (user?: UserDto) => void;
  setIsSigning: (isSigning: boolean) => void;
};

const useAuthStore = create<AuthStoreType>((set) => ({
  user: undefined,
  isSigning: false,
  setUser: (user) => set({ user }),
  setIsSigning: (isSigning) => set({ isSigning }),
}));

export default useAuthStore;
