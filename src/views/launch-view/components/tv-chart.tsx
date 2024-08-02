import React from "react";

import dynamic from "next/dynamic";
import { CandleDto, TokenDto } from "@/lib/data/dtos";

const TVChartContainer = dynamic(
  () =>
    import("@/components/trading-view-chart").then(
      (mod) => mod.TVChartContainer
    ),
  { ssr: false }
);

interface TvChartProps {
  token: TokenDto;
  candles: CandleDto[];
}

const TvChart = ({ token, candles }: TvChartProps) => {
  return (
    <div className="h-[420px]">
      <TVChartContainer token={token} candles={candles} />
    </div>
  );
};

export default TvChart;
