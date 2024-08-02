"use client";

import {
  CandleDto,
  CommentDto,
  TokenDto,
  TradeDto,
  UserDto,
} from "@/lib/data/dtos";
import { useLaunchStore } from "../hooks/use-launch-store";
import { useEffect, useMemo, useState } from "react";
import { ChartComponent } from "./chart";
import Swap from "./swap-card";
import TokenInfo from "./token-info";
import Trades from "./trades-table";
import Spinner from "@/components/ui/spinner";
import TvChart from "./tv-chart";
import ChartHeader from "./swap-card/components/chart-header";
import { cn } from "@/lib/cn";
import {
  ShoppingCart,
  MessageSquare,
  Users,
  Info,
  BarChart2,
  DollarSign,
} from "lucide-react";
import useTokenStore from "@/store/use-token-store";
import { useRouter, useSearchParams } from "next/navigation";
import BottomBar from "./bottom-bar";
import Comments from "./comments";
import { useSavedReferrer } from "@/hooks/use-saved-referrer";
import { formatSol, toBn } from "@/lib/utils/decimal";

interface LaunchViewClient {
  tokenAddress: string;
  tokenData?: TokenDto;
  latestTrades: TradeDto[];
  candles: CandleDto[];
  comments: CommentDto[];
  referrer?: UserDto;
}

enum Tabs {
  Thread = "comments",
  Trades = "trades",
}

const TabIcon = {
  [Tabs.Trades]: ShoppingCart,
  [Tabs.Thread]: MessageSquare,
};

export type SectionType = "Info" | "Trade";

const LaunchViewClient = (props: LaunchViewClient) => {
  // checks if the view is mobile or not
  const [width, setWidth] = useState<number>(window.innerWidth);
  useSavedReferrer(props.referrer);

  function handleWindowSizeChange() {
    setWidth(window.innerWidth);
  }
  useEffect(() => {
    window.addEventListener("resize", handleWindowSizeChange);
    return () => {
      window.removeEventListener("resize", handleWindowSizeChange);
    };
  }, []);

  const isMobile = width <= 768;

  const [section, setSection]: [
    SectionType,
    React.Dispatch<React.SetStateAction<SectionType>>
  ] = useState<SectionType>("Trade");

  const initStore = useLaunchStore((state) => state.initStore);
  const lastToken = useTokenStore((state) => state.lastToken);
  const router = useRouter();

  const [currentTab, setCurrentTab] = useState<Tabs>(Tabs.Thread);
  const [chartType, setChartType] = useState<"degen" | "raydiym">(
    props.tokenData?.raydiumAmmId ? "raydiym" : "degen"
  );

  useEffect(() => {
    if (!props.tokenData) return;
    initStore(props.tokenData, props.latestTrades, props.candles);
  }, [props, initStore]);

  useEffect(() => {
    if (!props.tokenData && lastToken?.address === props.tokenAddress) {
      router.refresh();
    }
  }, [props.tokenAddress, lastToken, router, props.tokenData]);

  useEffect(() => {
    async function fetchData(address: string) {
      await fetch(`/api/tokens/ath?chainId=501424&address=${address}`);
    }

    if (props.tokenData && props.tokenData.raydiumAmmId) {
      fetchData(props.tokenData.address);
    }
  }, [props.tokenData]);

  if (!props.tokenData)
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

  if (isMobile) {
    return (
      <>
        <div className="mt-6 relative h-full px-2 pb-16">
          {section === "Trade" && (
            <div className="flex flex-col w-full bg-card rounded-lg pb-4">
              <Swap token={props.tokenData} />
              <ChartHeader token={props.tokenData} candles={props.candles} />
              <TvChart token={props.tokenData} candles={props.candles} />
              <TabsComponent
                chartType={chartType}
                setChartType={setChartType}
                token={props.tokenData}
                currentTab={currentTab}
                setCurrentTab={setCurrentTab}
              />
              {currentTab === Tabs.Trades && (
                <Trades token={props.tokenData} trades={props.latestTrades} />
              )}
              {currentTab === Tabs.Thread && (
                <Comments token={props.tokenData} comments={props.comments} />
              )}
            </div>
          )}
          {section === "Info" && (
            <TokenInfo token={props.tokenData} candles={props.candles} />
          )}
        </div>
        <div className="fixed inset-x-0 bottom-0 z-50 w-full">
          <div className="flex w-full bg-[#060606]" style={{ height: "50px" }}>
            {" "}
            {/* Adjusted height here */}
            <button
              onClick={() => setSection("Trade")}
              className={`flex-grow text-center py-2 border-r border-[#343439] ${
                section === "Trade" ? "bg-[#de7aa1]" : "bg-[#17171c]"
              } text-white`}
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <BarChart2 className="mr-2 h-5 w-5" />
              Trade
            </button>
            <button
              onClick={() => setSection("Info")}
              className={`flex-grow text-center py-2 border-r border-[#343439] ${
                section === "Info" ? "bg-[#de7aa1]" : "bg-[#17171c]"
              } text-white`}
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Info className="mr-2 h-5 w-5" />
              Info
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="flex flex-row gap-4 mt-3">
        <div className="flex flex-col w-2/3 rounded-lg pb-4">
          <ChartHeader token={props.tokenData} candles={props.candles} />
          {chartType === "degen" ? (
            <TvChart token={props.tokenData} candles={props.candles} />
          ) : (
            <DexScreenerChart token={props.tokenData} />
          )}
          <TabsComponent
            chartType={chartType}
            setChartType={setChartType}
            token={props.tokenData}
            currentTab={currentTab}
            setCurrentTab={setCurrentTab}
          />
          {currentTab === Tabs.Trades && (
            <Trades token={props.tokenData} trades={props.latestTrades} />
          )}
          {currentTab === Tabs.Thread && (
            <Comments token={props.tokenData} comments={props.comments} />
          )}
        </div>
        <div className="w-1/3 space-y-4">
          <Swap token={props.tokenData} />
          <TokenInfo token={props.tokenData} candles={props.candles} />
        </div>
      </div>
    </>
  );
};

export const DexScreenerChart = ({ token }: { token: TokenDto }) => {
  return (
    <div className="h-[420px]">
      <div
        id="dexscreener-embed"
        style={{ position: "relative", width: "100%", height: "100%" }}
      >
        <iframe
          id="tv-chart"
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            top: 0,
            left: 0,
            border: 0,
          }}
          src={`https://dexscreener.com/solana/${token.address}?embed=1&theme=dark&trades=0&info=0`}
        ></iframe>
      </div>
    </div>
  );
};

const TabsComponent = (props: {
  chartType: "degen" | "raydiym";
  setChartType: (type: "degen" | "raydiym") => void;
  token: TokenDto;
  currentTab: Tabs;
  setCurrentTab: (tab: Tabs) => void;
  disabledTabs?: Tabs[];
}) => {
  const {
    token,
    chartType,
    setChartType,
    currentTab,
    setCurrentTab,
    disabledTabs = [],
  } = props;
  return (
    <div className="flex flex-row justify-between bg-card">
      <div className="flex space-x-8 border-b px-4">
        {Object.values(Tabs).map((tab) => {
          const Icon = TabIcon[tab];
          const isDisabled = disabledTabs.includes(tab);
          return (
            <div
              key={tab}
              className={cn(
                "flex items-center space-x-2 py-4 cursor-pointer text-muted text-sm",
                {
                  "border-b-2 border-primary": currentTab === tab,
                  "cursor-not-allowed text-gray-400": isDisabled,
                }
              )}
              onClick={() => !isDisabled && setCurrentTab(tab)}
            >
              <Icon
                className={cn("w-4 h-4", {
                  "text-primary": currentTab === tab,
                  "text-gray-400": isDisabled,
                })}
              />
              <span
                className={cn({
                  "text-primary": currentTab === tab,
                  "text-gray-400": isDisabled,
                })}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </span>
            </div>
          );
        })}
      </div>
      {token.raydiumAmmId && (
        <div
          className={cn(
            "flex items-center p-4 cursor-pointer text-muted text-sm"
          )}
          onClick={() =>
            chartType == "raydiym"
              ? setChartType("degen")
              : setChartType("raydiym")
          }
        >
          {/* <Icon
           className={cn("w-4 h-4", {
             "text-primary": currentTab === tab,
             "text-gray-400": isDisabled,
           })}
         /> */}
          <span className="text-gray-400 hover:underline">
            {chartType == "raydiym"
              ? "Switch to Degen Chart"
              : "Switch to DexScreener Chart"}
          </span>
        </div>
      )}
    </div>
  );
};

export default LaunchViewClient;
