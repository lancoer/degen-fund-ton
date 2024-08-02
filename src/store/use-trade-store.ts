import { create } from "zustand";
import { TokenDto, TradeDto, TradeTokenDto } from "@/lib/data/dtos";

type TradeStoreType = {
  trades: TradeTokenDto[];
  initStore: (tradeTokenDtos: TradeTokenDto[]) => void;
  addAtStart: (tradeTokenDtos: TradeTokenDto) => void;
};

const useTradeStore = create<TradeStoreType>((set) => ({
  // Initial state
  trades: [],

  // Actions
  initStore: (trades) => set({ trades }),
  addAtStart: (tradeTokenDtos) =>
    set((state) => ({
      trades: [tradeTokenDtos, ...state.trades],
    })),
}));

export default useTradeStore;
