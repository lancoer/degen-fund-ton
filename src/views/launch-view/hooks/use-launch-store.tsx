import {
  CandleDto,
  TokenDto,
  TokensRow,
  TradeDto,
  TradesRow,
} from "@/lib/data/dtos";
import { create } from "zustand";

type LaunchStore = {
  mint?: TokenDto;
  trades: TradeDto[];
  candles: CandleDto[];
  lastCandle?: CandleDto;
  lastTrade?: TradeDto;
};

type LaunchStoreActions = {
  initStore: (mint: TokenDto, trades: TradeDto[], candles: CandleDto[]) => void;
  newSwapEvent: (mint: TokenDto, trade: TradeDto, candle: CandleDto) => void;
  ammListingEvent: (tokenAddress: string, ammId: string) => void;
};

export const useLaunchStore = create<LaunchStore & LaunchStoreActions>(
  (set, get) => ({
    mint: undefined,
    trades: [],
    candles: [],
    holders: [],
    lastCandle: undefined,
    lastTrade: undefined,
    initStore: (mint, trades, candles) => {
      set({
        mint,
        trades,
        candles,
        lastCandle: candles[candles.length - 1],
        lastTrade: trades[0],
      });
    },

    newSwapEvent: (token, trade, candle) => {
      const { mint: tokenStore, trades, candles: candlesStore } = get();
      if (tokenStore?.address != token.address) return;

      const candleTimestamp = Math.floor(
        new Date(candle.timestamp).getTime() / 1000
      );

      const existingCandle = candlesStore.findIndex((c) => {
        const cTimestamp = Math.floor(new Date(c.timestamp).getTime() / 1000);
        return cTimestamp === candleTimestamp;
      });

      if (existingCandle !== -1) {
        candlesStore[existingCandle] = candle;
      } else {
        candlesStore.push(candle);
      }

      tokenStore.solReserve = token.solReserve;
      tokenStore.tokenReserve = token.tokenReserve;

      console.log(
        "updating reserves",
        tokenStore.solReserve.toString(),
        tokenStore.tokenReserve.toString()
      );

      set({
        mint: tokenStore,
        trades: [trade, ...trades],
        candles: candlesStore,
        lastCandle: candle,
        lastTrade: trade,
      });
    },
    ammListingEvent: (tokenAddress, ammId) => {
      const { mint: tokenStore } = get();
      if (!tokenStore || tokenStore?.address != tokenAddress) return;

      tokenStore.raydiumAmmId = ammId;
      set({ mint: tokenStore });
    },
  })
);
