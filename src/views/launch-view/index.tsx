import { getToken } from "@/lib/data/mint";
import { getCandles, getLatestTokenTrades } from "@/lib/data/trade";
import React from "react";
import LaunchViewClient from "./components/launch-view-client";
import { getComments } from "@/lib/data/reactions";
import { getUserWithId } from "@/lib/data/user";
import { urlToId } from "@/lib/utils/base64url";
import { safeCall } from "@/lib/utils/shared";
import { TokenDto } from "@/lib/data/dtos";
import { formatSol, toBn } from "@/lib/utils/decimal";
import Spinner from "@/components/ui/spinner";

interface LaunchViewProps {
  mint: string;
  refUrlId?: string;
  auth?: string;
}

const showStealth = (
  tokenData: TokenDto | undefined,
  auth: string | undefined
) => {
  if (!tokenData) return true;
  const isStealth = tokenData.customTag1;
  const isFilled = Number(formatSol(toBn(tokenData.solReserve))) > 100;

  const hasPws = auth && auth === "9x84LXEe4E45";

  console.log({ isStealth, isFilled, hasPws });

  return !isStealth || (isStealth && hasPws) || isFilled;
};

const LaunchView = async ({ mint, refUrlId, auth }: LaunchViewProps) => {
  const [tokenData, latestTrades, candles, comments, referrer] =
    await Promise.all([
      getToken(mint),
      getLatestTokenTrades(mint),
      getCandles(mint),
      getComments(mint),
      safeCall(getUserWithId, safeCall(urlToId, refUrlId)),
    ]);

  const show = showStealth(tokenData, auth);

  if (!show) {
    return (
      <div className="flex w-full justify-center gap-4 mt-3">
        <div className="border rounded-md p-4">
          <div className="flex gap-2">
            <Spinner className="fill-primary" size={6} />
            <span className="text-muted-foreground">
              The token has not been indexed yet. Please wait for a few seconds.
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <LaunchViewClient
      tokenAddress={mint}
      tokenData={tokenData}
      latestTrades={latestTrades}
      candles={candles}
      comments={comments}
      referrer={referrer}
    />
  );
};

export default LaunchView;
