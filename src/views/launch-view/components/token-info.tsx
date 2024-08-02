import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Globe, Twitter, X } from "lucide-react";
import { FaTelegram, FaTwitter } from "react-icons/fa";
import { title } from "process";
import Link from "next/link";
import { parseIpfsUrl } from "@/lib/utils/ipfs";
import { CandleDto, TokenDto, TradeDto } from "@/lib/data/dtos";
import { useLaunchStore } from "../hooks/use-launch-store";
import {
  getRealtimeValue,
  safeCall,
  toMil,
  toReadableDecimal,
} from "@/lib/utils/shared";
import { formatSol, formatTokens, parseSol, toBn } from "@/lib/utils/decimal";
import {
  DECIMAL_FACTOR,
  SCALE_FACTOR,
  TOKEN_DELTA,
  ZERO_BN,
} from "@/lib/constants";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import TokenHolders from "./token-holders";

import { PhotoProvider, PhotoView } from "react-photo-view";
import "react-photo-view/dist/react-photo-view.css";
import { Separator } from "@/components/ui/separator";
import useAuthStore from "@/store/use-auth-store";
import { idToUrl } from "@/lib/utils/base64url";
import CopyButton from "@/components/copy-button";
import { useReferralNode } from "@/hooks/solana/use-referral-node";
import { PublicKey } from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";

interface TokenInfoProps {
  token: TokenDto;
  candles: CandleDto[];
}

const socialIcons: any = {
  website: <Globe className="w-6 h-6" />,
  telegram: <FaTelegram className="w-6 h-6" />,
  twitter: <FaTwitter className="w-6 h-6" />,
};

const TokenInfo = ({ token: tokenProps }: TokenInfoProps) => {
  const user = useAuthStore((state) => state.user);
  const { mint: tokenStore } = useLaunchStore();

  const token = getRealtimeValue(tokenProps, tokenStore)!;

  const { publicKey } = useWallet();
  const { isNodeExist, loading, mutate } = useReferralNode(publicKey);

  const boundingCurveProgress = useMemo(() => {
    return token?.tokenReserve
      ? 100 - (Number(formatTokens(toBn(token.tokenReserve))) * 100) / 794000000
      : 0;
  }, [token.tokenReserve]);

  const referralUrl = useMemo(() => {
    return `https://localhost:3000/launch/${token.address}?r=${safeCall(
      idToUrl,
      user?.id
    )}`;
  }, [user]);

  return (
    <div className="pt-16">
      <div className="w-full bg-radial-grad border rounded-2xl">
        <div className="relative h-2/3 w-full flex justify-center">
          {token.imageUri && (
            // eslint-disable-next-line @next/next/no-img-element
            <div className="rounded-full overflow-hidden w-32 h-32 absolute -top-16">
              <PhotoProvider>
                <PhotoView src={parseIpfsUrl(token.imageUri)}>
                  <Image
                    className="overflow-hidden rounded-full object-cover w-32 h-32 cursor-pointer"
                    src={parseIpfsUrl(token.imageUri)}
                    alt=""
                    height={128}
                    width={128}
                  />
                </PhotoView>
              </PhotoProvider>
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2 items-center mt-16 justify-center">
          <h1 className="text-xl py-2 font-bold">{token.name}</h1>
          <div className="w-[20rem] flex flex-wrap justify-center gap-2">
            {token.socials &&
              Object.keys(token.socials).map((social, index) => {
                return (
                  <Link
                    key={index}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-[#684a5685] p-2 rounded-2xl hover:bg-[#684a56]"
                    href={token.socials ? (token.socials as any)[social] : ""}
                  >
                    {socialIcons[social]}
                  </Link>
                );
              })}
          </div>

          <p className="text-sm text-center w-full my-4 px-2">
            {token.description}
          </p>
          {isNodeExist && <Separator className="mb-4" />}
          {isNodeExist && (
            <div className="text-sm flex flex-col text-center justify-center gap-2 items-center mb-4">
              <span className="text-muted">
                Share this token with your friends using your special referral
                link and earn{" "}
                <span className="text-primary">25% of their trading fees</span>.
              </span>

              <div className="w-1/2">
                <CopyButton
                  className="w-full"
                  size="sm"
                  variant="outline"
                  value={referralUrl}
                  label="Copy Referral Link"
                  copiedLabel="Copied"
                />
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="space-y-4 pt-6">
        <Label>
          Bonding Curve Progress:{" "}
          {token.isCompleted ? 100 : boundingCurveProgress.toFixed(1)}%
        </Label>
        <Progress
          value={boundingCurveProgress}
          className="w-full text-primary"
        />

        <p className="text-sm text-muted">
          There are{" "}
          <span className="text-primary">
            {token.isCompleted
              ? 0
              : Number(
                  formatTokens(toBn(token.tokenReserve))
                ).toLocaleString()}{" "}
            {token.symbol}
          </span>{" "}
          still available for sale in the bonding curve and there is{" "}
          <span className="text-primary">
            {token.isCompleted
              ? 85
              : Number(formatSol(toBn(token.solReserve))).toLocaleString()}{" "}
            SOL
          </span>{" "}
          in the bonding curve.
        </p>

        <p className="text-sm text-muted-foreground">
          When the market cap reaches{" "}
          <span className="font-semibold">$59,598</span> all the liquidity from
          the bonding curve will be deposited into Raydium and burned.
          Progression increases as the price goes up.
        </p>
      </div>

      <TokenHolders token={token} />
    </div>
  );
};

export default TokenInfo;
