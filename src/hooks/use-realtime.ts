"use client";

import { useToast } from "@/components/ui/use-toast";
import { CandleDto, TokenDto, TradeDto } from "@/lib/data/dtos";
import useTokenStore from "@/store/use-token-store";
import useTradeStore from "@/store/use-trade-store";
import { useLaunchStore } from "@/views/launch-view/hooks/use-launch-store";
import { useEffect, useRef, useState } from "react";
import useWebSocket from "react-use-websocket";
import Pusher, { Channel } from "pusher-js";
import { formatSol, toBn } from "@/lib/utils/decimal";

enum EventTypes {
  CurveCreated = "CurveCreated",
  Swap = "Swap",
  CurveFilled = "CurveFilled",
  AmmListed = "AmmListed",
}

export const useRealtime = () => {
  const { toast } = useToast();
  const ammListingLaunchStore = useLaunchStore(
    (state) => state.ammListingEvent
  );
  const newSwapEventLaunchStore = useLaunchStore((state) => state.newSwapEvent);
  const addAtStartTokenStore = useTokenStore((state) => state.addAtStart);
  const updateTokenTokenStore = useTokenStore((state) => state.updateToken);
  const addAtStartTradeStore = useTradeStore((state) => state.addAtStart);
  const [lastJsonMessage, setLastJsonMessage] = useState<any>(null);

  useEffect(() => {
    const pusher = new Pusher("9a7be52f712966d3e07e", {
      cluster: "eu",
    });
    const channel1 = pusher.subscribe("global");
    channel1.bind("global", function (data: any) {
      setLastJsonMessage(data);
    });

    return () => {
      pusher.unsubscribe("global");
    };
  }, []);

  useEffect(() => {
    if (!lastJsonMessage) return;
    const message = lastJsonMessage as any;
    switch (message.name) {
      case EventTypes.Swap:
        // console.log("Swap", message.data);

        const tradeDto = parseTradeDto(message.data.tradeDto);

        const solAmount =
          tradeDto.tradeType == "buy"
            ? formatSol(toBn(tradeDto.amountIn))
            : formatSol(toBn(tradeDto.amountOut));

        newSwapEventLaunchStore(
          parseTokenDto(message.data.tokenDto),
          parseTradeDto(message.data.tradeDto),
          parseCandleDto(message.data.candleDto)
        );

        if (Number(solAmount) > 0.01) {
          updateTokenTokenStore(parseTokenDto(message.data.tokenDto));
          addAtStartTradeStore({
            trade: parseTradeDto(message.data.tradeDto),
            token: parseTokenDto(message.data.tokenDto),
          });
        }

        break;
      case EventTypes.CurveCreated:
        addAtStartTokenStore(parseTokenDto(message.data));
        break;
      case EventTypes.AmmListed:
        const seededTokenRow = message.data;
        ammListingLaunchStore(
          seededTokenRow.tokenAddress,
          seededTokenRow.raydiumAmmId
        );
        break;
    }
  }, [lastJsonMessage]);

  return { lastJsonMessage };
};

const parseTokenDto = (data: any): TokenDto => {
  return {
    ...data,
    creator: { ...data.creator, createdAt: new Date(data.creator.createdAt) },
    kothAt: new Date(data.kothAt),
    createdAt: new Date(data.createdAt),
    lastBuyAt: new Date(data.lastBuyAt),
  };
};

const parseTradeDto = (data: any): TradeDto => {
  return {
    ...data,
    user: { ...data.user, createdAt: new Date(data.user.createdAt) },
    timestamp: new Date(data.timestamp),
  };
};

const parseCandleDto = (data: any): CandleDto => {
  return {
    ...data,
    timestamp: new Date(data.timestamp),
  };
};

export default useRealtime;
