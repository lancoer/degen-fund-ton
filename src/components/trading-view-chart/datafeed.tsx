import { useEffect, useMemo, useRef, useState } from "react";

import {
  Bar,
  ErrorCallback,
  HistoryCallback,
  LibrarySymbolInfo,
  PeriodParams,
  ResolutionString,
  ResolveCallback,
  SubscribeBarsCallback,
  Timezone,
} from "./charting_library";
import { CandleDto, TokenDto } from "@/lib/data/dtos";
import { formatSol, toBn } from "@/lib/utils/decimal";
import { useLaunchStore } from "@/views/launch-view/hooks/use-launch-store";

const configurationData = {
  supported_resolutions: ["1", "5"],
  exchanges: [
    {
      value: "DEGEN FUND",
      name: "DEGEN FUND",
      desc: "DEGEN FUND",
    },
  ],
  symbols_types: [
    {
      name: "crypto",
      value: "crypto",
    },
  ],
};

export const useDatafeed = (token: TokenDto, candles: CandleDto[]) => {
  const intervalRef = useRef<any>();

  const onTickRef = useRef<any>();

  const lastCandle = useLaunchStore((state) => state.lastCandle);

  useEffect(() => {
    const onTick = onTickRef.current;
    if (onTick && lastCandle) {
      onTick({
        time: lastCandle.timestamp.getTime(),
        low: Number(formatSol(toBn(lastCandle.low))),
        high: Number(formatSol(toBn(lastCandle.high))),
        open: Number(formatSol(toBn(lastCandle.open))),
        close: Number(formatSol(toBn(lastCandle.close))),
        volume: Number(formatSol(toBn(lastCandle.volume))),
      });
    }
  }, [lastCandle, onTickRef]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return useMemo(() => {
    return {
      onReady: (callback: any) => {
        setTimeout(() => callback(configurationData));
      },
      resolveSymbol: async (
        _symbolName: string,
        onSymbolResolvedCallback: ResolveCallback,
        _onResolveErrorCallback: ErrorCallback
      ) => {
        try {
          const symbolInfo: LibrarySymbolInfo = {
            ticker: token.symbol,
            name: token.name,
            full_name: token.name,
            listed_exchange: "",
            format: "price",
            description: `${token.name} / SOL`,
            type: "crypto",
            session: "24x7",
            timezone: "Etc/UTC" as Timezone,
            exchange: "DEGEN",
            has_intraday: true,
            minmov: 1,
            pricescale: 1000000000,
            supported_resolutions:
              configurationData.supported_resolutions as ResolutionString[],
            data_status: "streaming",
            volume_precision: 2,
            minmove2: 1000000,
          };
          onSymbolResolvedCallback(symbolInfo);
        } catch (error) {
          console.log(error);
        }
      },
      getBars: async (
        // symbolInfo is not used
        _symbolInfo: LibrarySymbolInfo,
        resolution: ResolutionString,
        periodParams: PeriodParams,
        onHistoryCallback: HistoryCallback,
        _onErrorCallback: ErrorCallback
      ) => {
        const { from, to, firstDataRequest } = periodParams;

        const bars: Bar[] = candles
          .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
          .filter(
            (candle) =>
              candle.timestamp.getTime() >= from * 1000 &&
              candle.timestamp.getTime() < to * 1000
          )
          .map((candle) => {
            return {
              time: candle.timestamp.getTime(),
              low: Number(formatSol(toBn(candle.low))),
              high: Number(formatSol(toBn(candle.high))),
              open: Number(formatSol(toBn(candle.open))),
              close: Number(formatSol(toBn(candle.close))),
              volume: Number(formatSol(toBn(candle.volume))),
            };
          });

        if (bars.length === 0) {
          onHistoryCallback([], {
            noData: true,
          });
          return;
        }

        onHistoryCallback(bars, { noData: false });
      },
      searchSymbols: () => {
        //
      },
      subscribeBars: async (
        _symbolInfo: LibrarySymbolInfo,
        resolution: ResolutionString,
        onTick: SubscribeBarsCallback,
        _listenerGuid: string,
        _onResetCacheNeededCallback: () => void
      ) => {
        onTickRef.current = onTick;
      },
      unsubscribeBars: () => {
        // setOnTick(undefined);
      },
    };
  }, [candles, token.name, token.symbol]);
};
