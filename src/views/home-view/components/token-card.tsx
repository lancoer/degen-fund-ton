"use client";

import { TokenDto } from "@/lib/data/dtos";
import { parseIpfsUrl } from "@/lib/utils/ipfs";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { formatTokens, toBn } from "@/lib/utils/decimal";
import { Progress } from "@/components/ui/progress";
import { getRealtimeValue, toMil } from "@/lib/utils/shared";
import { SCALE_FACTOR, ZERO_BN } from "@/lib/constants";
import useTokenStore from "@/store/use-token-store";
import { Globe, Twitter, X, Droplets } from "lucide-react";
import { FaTelegram, FaTwitter } from "react-icons/fa";
import "./anim.css";
import { cn } from "@/lib/cn";
import { useRouter, useSearchParams } from "next/navigation";
import { Ribbon } from "@/components/ui/ribbon";

const useTokenInfo = (tokenProp?: TokenDto) => {
  const tokensStore = useTokenStore((state) => state.tokens);

  const tokenStore = useMemo(() => {
    return tokensStore?.find((token) => token.address === tokenProp?.address);
  }, [tokensStore, tokenProp]);

  const token = getRealtimeValue(tokenProp, tokenStore);

  const boundingCurveProgress = useMemo(() => {
    return token
      ? 100 - (Number(formatTokens(toBn(token.tokenReserve))) * 100) / 794000000
      : 0;
  }, [token]);

  const marketCapString = useMemo(() => {
    return token ? toMil(Number(token.marketCap) / Number(SCALE_FACTOR)) : "--";
  }, [token]);

  return {
    token,
    boundingCurveProgress,
    marketCapString,
  };
};

interface TokenInfoProps {
  token: TokenDto;
}

const socialIcons: any = {
  website: <Globe className="w-4 h-4" />,
  telegram: <FaTelegram className="w-4 h-4" />,
  twitter: <FaTwitter className="w-4 h-4" />,
};

const TokenCard = ({
  token: tokenProp,
  balance,
  index,
}: {
  token?: TokenDto;
  balance?: number;
  index: number;
}) => {
  const { token, boundingCurveProgress, marketCapString } =
    useTokenInfo(tokenProp);
  const [isBlinking, setIsBlinking] = useState(false);
  const initialAddress = useRef(tokenProp?.address);
  const searchParams = useSearchParams();

  const redirectTo = (url: string) => {
    if (window) window.open(url, "_blank", "noopener,noreferrer");
  };

  useEffect(() => {
    if (
      index === 0 &&
      tokenProp?.address &&
      initialAddress.current !== tokenProp.address
    ) {
      const isBumpOrdered =
        searchParams.get("sort") === "bump_order" ||
        searchParams.get("sort") === null;

      const isSearchQueryPresent = searchParams.get("search");

      setIsBlinking(true && isBumpOrdered && !isSearchQueryPresent);
      const timer = setTimeout(() => setIsBlinking(false), 300); // Blink for 1 second
      return () => clearTimeout(timer);
    }
    // Update the initial address after the first render
    if (index === 0 && !initialAddress.current) {
      initialAddress.current = tokenProp?.address;
    }
  }, [tokenProp, index, searchParams]); // Dependency on tokenProp to detect changes in the token

  if (!token) return null;
  const isSeeded = token.isCompleted || toBn(token.tokenReserve).eq(ZERO_BN);
  const isListed = !!token.raydiumAmmId;
  const athMultiplier = token.athMultiplier;
  const backgroundColor = isListed ? "#9ae6b4" : "#17171c";
  const textColor = isListed ? "#9ae6b4" : "#ffffffeb";

  return (
    <Link href={`/launch/${token.address}`} className="w-full">
      <div
        className={cn(
          "bg-card rounded-lg flex flex-col md:flex-row items-stretch hover:border-primary group transition duration-200 border-transparent border relative h-full overflow-hidden",
          isBlinking && "shake"
        )}
      >
        <div
          className={cn(
            "absolute inset-0 bg-primary opacity-0 rounded-lg z-20",
            isBlinking && "blink"
          )}
        ></div>

        {athMultiplier && <Ribbon text={`${athMultiplier}X`} />}

        <div className="relative w-full h-40 md:w-40 md:h-auto flex-shrink-0 group-hover:border-primary border-[#17171c] border-y transition duration-200 rounded-t-lg md:rounded-tl-lg md:rounded-bl-lg md:rounded-tr-none">
          <Image
            fill
            src={parseIpfsUrl(token.imageUri)}
            className="object-cover rounded-t-lg md:rounded-l-lg md:rounded-tr-none"
            alt={`${token.name}.img`}
            priority={index === 0}
          />
        </div>
        <div className="w-full p-4 flex flex-col justify-between flex-grow">
          <div>
            <div className="flex justify-between items-center flex-row items-center">
              <div className="text-primary text-xs lg:text-sm">
                <span>Created by: </span>
                <span className="underline">{token.creator.username}</span>
              </div>
              {balance !== undefined && (
                <div className="text-muted text-xs lg:text-sm">
                  Balance: {toMil(balance)}
                </div>
              )}
            </div>
            <div className="text-xl font-bold whitespace-nowrap">
              {token.name}{" "}
              <span className="text-xs font-normal">({token.symbol})</span>
            </div>
            <div className="text-gray-400 text-sm pt-2.5 text-ellipsis overflow-hidden line-clamp-2">
              {token.description}
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center pt-4 mt-auto">
            <div className="w-full md:w-auto">
              <div className="pt-2.5 pb-1 text-sm text-muted">
                {isListed ? (
                  <span className="inline-flex mt-3 items-center text-[#9ae6b4]">
                    <Droplets className="w-4 h-4 mr-2" color={textColor} />
                    Listed on Raydium
                  </span>
                ) : isSeeded ? (
                  <span className="inline-flex items-center mt-3 text-[#de7aa1]">
                    <svg
                      stroke="currentColor"
                      fill="currentColor"
                      strokeWidth="0"
                      viewBox="0 0 512 512"
                      focusable="false"
                      className="chakra-icon custom-1lqc8qe w-4 h-4 mr-2"
                      height="1em"
                      width="1em"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M64 96H0c0 123.7 100.3 224 224 224v144c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16V320C288 196.3 187.7 96 64 96zm384-64c-84.2 0-157.4 46.5-195.7 115.2 27.7 30.2 48.2 66.9 59 107.6C424 243.1 512 147.9 512 32h-64z"></path>
                    </svg>
                    Seeding soon
                  </span>
                ) : (
                  <div className="w-full">
                    <span className="text-sm">
                      Market Cap: {marketCapString}
                    </span>
                    <Progress
                      value={boundingCurveProgress}
                      className="w-full text-primary h-1"
                    />
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2 pt-4 md:pt-0 z-20">
              {Object.keys(token.socials ?? {}).map((social, index) => {
                return (
                  <div
                    key={index}
                    className="flex items-center justify-center p-1 rounded-lg transition duration-200 text-gray-500 hover:text-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      // redirectTo(
                      //   token.socials && (token.socials as any)[social]
                      // );
                    }}
                  >
                    {socialIcons[social]}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

const KothCard = ({ token: tokenProp }: { token?: TokenDto }) => {
  const { token, boundingCurveProgress, marketCapString } =
    useTokenInfo(tokenProp);
  const router = useRouter();

  const redirectTo = (url: string) => {
    if (window) window.open(url, "_blank", "noopener,noreferrer");
  };

  if (!token) return null;
  const isSeeded = token.isCompleted || toBn(token.tokenReserve).eq(ZERO_BN);
  const isListed = !!token.raydiumAmmId;

  return (
    <Link href={`/launch/${token.address}`} className="w-[400px]">
      <div className="bg-card rounded-lg flex flex-col md:flex-row items-stretch hover:border-primary group transition duration-200 border-primary border relative h-full">
        <div className="relative w-full h-40 md:w-28 md:h-auto flex-shrink-0 group-hover:border-primary border-[#17171c] border-y transition duration-200 rounded-t-lg md:rounded-tl-lg md:rounded-bl-lg md:rounded-tr-none">
          <Image
            fill
            src={parseIpfsUrl(token.imageUri)}
            className="object-cover rounded-t-lg md:rounded-l-lg md:rounded-tr-none"
            alt={`${token.name}.img`}
            priority={true}
          />
        </div>
        <div className="w-full p-4 flex flex-col justify-between flex-grow">
          <div>
            <div className="flex justify-between items-center">
              <div className="text-primary text-xs lg:text-sm">
                <span>Created by: </span>
                <span className="underline">{token.creator.username}</span>
              </div>
            </div>
            <div className="text-xl font-bold whitespace-nowrap">
              {token.name}{" "}
              <span className="text-xs font-normal">({token.symbol})</span>
            </div>
            <div className="text-gray-400 text-sm pt-2.5 text-ellipsis overflow-hidden line-clamp-2">
              {token.description}
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center pt-4 mt-auto">
            <div className="w-full md:w-auto">
              <div className="pt-2.5 pb-1 text-sm text-muted">
                {isListed ? (
                  <span className="inline-flex mt-3 items-center text-[#9ae6b4]">
                    <Droplets className="w-4 h-4 mr-2" color="#9ae6b4" />
                    Listed on Raydium
                  </span>
                ) : isSeeded ? (
                  <span className="inline-flex items-center mt-3 text-[#de7aa1]">
                    <svg
                      stroke="currentColor"
                      fill="currentColor"
                      strokeWidth="0"
                      viewBox="0 0 512 512"
                      focusable="false"
                      className="chakra-icon custom-1lqc8qe w-4 h-4 mr-2"
                      height="1em"
                      width="1em"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M64 96H0c0 123.7 100.3 224 224 224v144c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16V320C288 196.3 187.7 96 64 96zm384-64c-84.2 0-157.4 46.5-195.7 115.2 27.7 30.2 48.2 66.9 59 107.6C424 243.1 512 147.9 512 32h-64z"></path>
                    </svg>
                    Seeding soon
                  </span>
                ) : (
                  <div className="w-full">
                    <span className="text-sm">
                      Market Cap: {marketCapString}
                    </span>
                    <Progress
                      value={boundingCurveProgress}
                      className="w-full text-primary h-1"
                    />
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2 pt-4 md:pt-0">
              {Object.keys(token.socials ?? {}).map((social, index) => {
                return (
                  <div
                    key={index}
                    className="flex items-center justify-center p-1 rounded-lg transition duration-200 text-gray-500 hover:text-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      redirectTo(
                        token.socials && (token.socials as any)[social]
                      );
                    }}
                  >
                    {socialIcons[social]}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div
          className="absolute -left-14 -top-14 w-32 h-32 p-5 z-10"
          style={{ transform: "rotate(-30deg)" }}
        >
          <Image
            src="/assets/thetophat.png"
            alt="Top Hat"
            height={128}
            width={128}
          />
        </div>
      </div>
    </Link>
  );
};
export { TokenCard, KothCard };
