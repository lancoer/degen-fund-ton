import { parseIpfsUrl } from "@/lib/utils/ipfs";
import React, { useEffect, useMemo, useState } from "react";
import { useLaunchStore } from "../../../hooks/use-launch-store";
import { CandleDto, TokenDto, TradeDto } from "@/lib/data/dtos";
import { formatSol, formatTokens, parseSol, toBn } from "@/lib/utils/decimal";
import {
  getRealtimeValue,
  getUserPfp,
  toMil,
  toReadableDecimal,
} from "@/lib/utils/shared";
import {
  DECIMAL_FACTOR,
  SCALE_FACTOR,
  TOKEN_DELTA,
  ZERO_BN,
} from "@/lib/constants";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import Image from "next/image";

interface TokenInfoProps {
  token: TokenDto;
  candles: CandleDto[];
}

const ChartHeader = ({ token, candles }: TokenInfoProps) => {
  const lastTrade = useLaunchStore((state) => state.lastTrade);
  const lastCandle = useLaunchStore((state) => state.lastCandle);

  const userPerTokenString = useMemo(() => {
    return lastTrade
      ? toReadableDecimal(Number(lastTrade.usdPerToken) / Number(SCALE_FACTOR))
      : "--";
  }, [lastTrade]);

  const solPriceString = useMemo(() => {
    return lastCandle
      ? toReadableDecimal(Number(formatSol(toBn(lastCandle.close))))
      : "--";
  }, [lastCandle]);

  const marketCapString = useMemo(() => {
    return token ? toMil(Number(token.marketCap) / Number(SCALE_FACTOR)) : "--";
  }, [token]);

  const liquitidyString = useMemo(() => {
    return token
      ? toMil((Number(token.marketCap) / Number(SCALE_FACTOR)) * 2)
      : "--";
  }, [token]);

  const [volumeBn, setVolumeBn] = useState(ZERO_BN);

  useEffect(() => {
    if (!candles) return;

    const volume = candles.reduce((acc, candle) => {
      return acc.add(toBn(candle.volume));
    }, ZERO_BN);

    setVolumeBn(volume);
  }, [candles]);

  const volumeString = useMemo(() => {
    return Number(formatSol(volumeBn)).toFixed(2);
  }, [volumeBn]);

  const boundingCurveProgress = useMemo(() => {
    return token
      ? 100 - (Number(formatTokens(toBn(token.tokenReserve))) * 100) / 794000000
      : 0;
  }, [token]);

  return (
    <div className="flex p-4 flex-wrap gap-2 bg-card rounded-t-lg">
      <div className="flex justify-start gap-2 mr-2">
        <Image
          src={parseIpfsUrl(token.imageUri)}
          alt={token.name}
          className="w-6 h-6 rounded-full"
          height={24}
          width={24}
        />
        <span className="font-semibold">{token.name}</span>
      </div>
      <div className="flex-1 flex items-center justify-start">
        <span className="dark:bg-secondary text-white text-xs font-medium me-2 px-2.5 py-0.5 rounded ">
          <span className="text-xs mr-1 text-muted text-ellipsis truncate">
            Market Cap
          </span>{" "}
          <span className="text-success font-semibold">${marketCapString}</span>
        </span>
        <span className="dark:bg-secondary text-white text-xs font-medium me-2 px-2.5 py-0.5 rounded">
          <span className="text-xs mr-1 text-muted text-ellipsis whitespace-nowrap truncate">
            Virtual Liquidity
          </span>{" "}
          <span className="text-white font-semibold">${liquitidyString}</span>
        </span>
        <span className="dark:bg-secondary text-white text-xs font-medium me-2 px-2.5 py-0.5 rounded">
          <span className="text-xs mr-1 text-muted ">Volume</span>{" "}
          <span className="text-white font-semibold whitespace-nowrap truncate text-ellipsis">
            {volumeString} SOL
          </span>
        </span>
      </div>
      <div className="flex items-center justify-end">
        <span className="text-xs mr-2">Created by</span>
        <Link
          href={`/profile/${token.creator.wallet}`}
          className="flex items-center"
        >
          <div className="h-6 w-6 mr-1">
            <Avatar className="h-6 w-6 rounded-full bg-slate-100">
              <AvatarImage src={getUserPfp(token.creator)} alt="avatar" />
            </Avatar>
          </div>
          <span className="bg-pink-100 text-pink-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-gray-700 dark:text-pink-400 border border-pink-400">
            {token.creator.username}
          </span>
        </Link>
      </div>
    </div>
  );
};

export default ChartHeader;
