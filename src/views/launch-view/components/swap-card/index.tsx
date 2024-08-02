import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTimer } from "react-timer-hook";
import BuyForm from "./components/buy";
import SellForm from "./components/sell";
import { TokenDto } from "@/lib/data/dtos";
import { toBn } from "@/lib/utils/decimal";
import { ZERO_BN } from "@/lib/constants";
import { cn } from "@/lib/cn";
import { Droplets } from "lucide-react";

function MyTimer(props: { expiryTimestamp: Date; onExpire: () => void }) {
  const { seconds, minutes, hours, days } = useTimer({
    expiryTimestamp: props.expiryTimestamp,
    onExpire: props.onExpire,
  });

  return (
    <div className="text-center text-white">
      <p>This coin launches in</p>
      <div className="flex justify-center items-center space-x-2 mt-2">
        <div className="flex flex-col items-center">
          <div className="bg-[#17171c] text-white font-bold rounded-lg px-4 py-2">
            {days}
          </div>
          <p className="text-xs text-muted mt-1">Days</p>
        </div>
        <div className="flex flex-col items-center">
          <div className="bg-[#17171c] text-white font-bold rounded-lg px-4 py-2">
            {hours}
          </div>
          <p className="text-xs text-muted mt-1">Hours</p>
        </div>
        <div className="flex flex-col items-center">
          <div className="bg-[#17171c] text-white font-bold rounded-lg px-4 py-2">
            {minutes}
          </div>
          <p className="text-xs text-muted mt-1">Minutes</p>
        </div>
        <div className="flex flex-col items-center">
          <div className="bg-[#17171c] text-white font-bold rounded-lg px-4 py-2">
            {seconds}
          </div>
          <p className="text-xs text-muted mt-1">Seconds</p>
        </div>
      </div>
    </div>
  );
}

const Overlay = (props: { expiryTimestamp: Date; onExpire: () => void }) => {
  return (
    <div className="absolute top-0 left-0 w-full rounded-md h-full bg-[#0d0d0d] bg-opacity-95 flex justify-center items-center z-50">
      <MyTimer
        expiryTimestamp={props.expiryTimestamp}
        onExpire={props.onExpire}
      />
    </div>
  );
};

const SeededOverlay = ({ token }: { token: TokenDto }) => {
  const isRaydium = token.raydiumAmmId;
  const backgroundColor = isRaydium ? "#9ae6b4" : "#17171c";
  const textColor = isRaydium ? "#333333" : "#ffffffeb";

  return (
    <div className="absolute top-0 left-0 w-full rounded-md h-full bg-[#0d0d0d] bg-opacity-95 flex justify-center items-center z-50">
      {/* This overlay is intended to block interaction without showing any information */}
      <div className="flex flex-col justify-center gap-4">
        <div
          className="flex items-center justify-center"
          style={{
            backgroundColor,
            padding: "0.5rem",
            borderRadius: "0.375rem",
          }}
        >
          {isRaydium ? (
            <Droplets className="w-4 h-4 mr-2" color={textColor} />
          ) : (
            <svg
              stroke="currentColor"
              fill="#ffffffeb"
              strokeWidth="0"
              viewBox="0 0 512 512"
              focusable="false"
              className="w-4 h-4 mr-2"
              height="1em"
              width="1em"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M64 96H0c0 123.7 100.3 224 224 224v144c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16V320C288 196.3 187.7 96 64 96zm384-64c-84.2 0-157.4 46.5-195.7 115.2 27.7 30.2 48.2 66.9 59 107.6C424 243.1 512 147.9 512 32h-64z"></path>
            </svg>
          )}
          <span
            className={cn(
              isRaydium
                ? "text-sm text-center font-semibold"
                : "text-sm text-primary"
            )}
            style={{ color: textColor }}
          >
            {isRaydium
              ? "The liquidity has been added to Raydium."
              : "The pool has been filled. Please wait for seeding."}
          </span>
        </div>
        {isRaydium && (
          <a
            target="_blank"
            rel="noopener noreferrer"
            className="text-center text-primary text-sm underline flex items-center justify-center gap-1"
            href={`https://jup.ag/swap/SOL-${token.address}`}
          >
            Swap on Jup.ag
          </a>
        )}
      </div>
    </div>
  );
};

const Swap = (props: { token: TokenDto }) => {
  const [showOverlay, setShowOverlay] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);

  const onExpire = () => {
    setShowOverlay(false);
  };

  useEffect(() => {
    if (props.token.startTimeUnix <= 0) {
      setShowOverlay(false);
    } else {
      const expiryTimestamp = new Date(props.token.startTimeUnix * 1000);
      const now = new Date();
      if (expiryTimestamp <= now) {
        setShowOverlay(false);
      }
    }

    if (
      toBn(props.token.tokenReserve).eq(ZERO_BN) &&
      !props.token.raydiumAmmId
    ) {
      setIsCompleted(true);
    }
  }, [
    props.token.startTimeUnix,
    props.token.raydiumAmmId,
    props.token.tokenReserve,
    props.token.isCompleted,
  ]);

  const expiryTimestamp = new Date(props.token.startTimeUnix * 1000);

  return (
    <div className="relative">
      {showOverlay && (
        <Overlay expiryTimestamp={expiryTimestamp} onExpire={onExpire} />
      )}
      {isCompleted && <SeededOverlay token={props.token} />}
      <Tabs defaultValue="buy" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="buy">Buy</TabsTrigger>
          <TabsTrigger value="sell">Sell</TabsTrigger>
        </TabsList>
        <TabsContent value="buy">
          <BuyForm token={props.token} />
        </TabsContent>
        <TabsContent value="sell">
          <SellForm token={props.token} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Swap;
