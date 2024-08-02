import { createChart, ColorType, CrosshairMode } from "lightweight-charts";
import React, { use, useEffect, useMemo, useRef, useState } from "react";
import { useLaunchStore } from "../hooks/use-launch-store";
import { SCALE_FACTOR } from "@/lib/constants";
import { useTheme } from "next-themes";

export const ChartComponent = () => {
  const chartContainerRef = useRef();
  const [chartState, setChart] = useState<any>();
  const [candleSeries, setCandleSeries] = useState<any>();
  const [isChartInitialised, setIsChartInitialised] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const launchStore = useLaunchStore();

  const priceData = useMemo(
    () =>
      launchStore.candles
        .toSorted((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
        .map((candle) => ({
          time: Math.floor(candle.timestamp.getTime() / 1000),
          open: parseInt(candle.open) / SCALE_FACTOR.toNumber(),
          high: parseInt(candle.high) / SCALE_FACTOR.toNumber(),
          low: parseInt(candle.low) / SCALE_FACTOR.toNumber(),
          close: parseInt(candle.close) / SCALE_FACTOR.toNumber(),
        })),
    [launchStore]
  );

  const currentPrice = priceData[priceData.length - 1]?.close;

  useEffect(() => {
    if (
      !chartContainerRef.current ||
      !priceData ||
      priceData.length == 0 ||
      isChartInitialised
    ) {
      return;
    }

    const handleResize = () => {
      chart.applyOptions({
        width: (chartContainerRef.current! as any).clientWidth || 0,
      });
    };

    const chart = createChart(chartContainerRef.current, {
      width: 0,
      height: 500, //"300px", //chartContainerRef.current.clientHeight,
      layout: {
        background: { color: "#171b26" },
        textColor: "#DDD",
      },
      grid: {
        vertLines: { color: "#242733" },
        horzLines: { color: "#242733" },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
      },

      timeScale: {
        borderColor: "#242733",
        timeVisible: true,
        secondsVisible: false,
      },
    });

    setChart(chart);

    const candleSeries = chart.addCandlestickSeries({
      upColor: "#26a69a",
      downColor: "#ef5350",
      borderVisible: false,
      wickUpColor: "#26a69a",
      wickDownColor: "#ef5350",
    });

    candleSeries.applyOptions({
      priceFormat: {
        type: "price",
        precision: 9,
        minMove: 0.000000001,
      },
    });

    candleSeries.setData(priceData as any);

    setCandleSeries(candleSeries);

    window.addEventListener("resize", handleResize);
    // setIsChartInitialised(true);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
      // setIsChartInitialised(false);
    };
  }, [priceData]);

  // useEffect(() => {
  //   if (candleSeries) {
  //     const latestBar = priceData[priceData.length - 1];
  //     candleSeries.update(latestBar);
  //   }
  // }, [candleSeries, currentPrice]);

  return (
    <div className="h-[500px] min-w-full lg:w-3/4 flex flex-col flex-1 rounded-xl border">
      <div
        ref={chartContainerRef as any}
        className="flex-1 rounded-xl overflow-hidden"
      />
    </div>
  );
};
