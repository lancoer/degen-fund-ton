import { create } from "zustand";
import { TokenDto } from "@/lib/data/dtos";

type TokenStoreType = {
  tokens?: TokenDto[];
  lastToken?: TokenDto;
  koth?: TokenDto;
  setTokens: (tokens: TokenDto[], koth?: TokenDto) => void;
  addAtStart: (token: TokenDto) => void;
  updateToken: (token: TokenDto) => void;
};

const useTokenStore = create<TokenStoreType>((set) => ({
  // Initial state
  tokens: undefined,
  lastToken: undefined,
  koth: undefined,

  // Actions
  setTokens: (tokens, koth) => {
    set({
      tokens,
      lastToken: tokens.length > 0 ? tokens[tokens.length - 1] : undefined,
      koth,
    });
  },
  addAtStart: (token) => {
    set((state) => {
      return {
        tokens: [token, ...(state.tokens || [])],
        lastToken: token,
      };
    });
  },
  updateToken: (token) => {
    set((state) => {
      const tokens = state.tokens?.map((t) =>
        t.address === token.address ? token : t
      );
      let currentKoth = state.koth;
      if (
        token.kothAt &&
        currentKoth?.kothAt &&
        token.kothAt > currentKoth.kothAt
      ) {
        currentKoth = token;
      }
      return {
        tokens,
        lastToken: token,
        koth: currentKoth,
      };
    });
  },
}));

export default useTokenStore;
