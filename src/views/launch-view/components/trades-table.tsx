/* eslint-disable @next/next/no-img-element */
import React from "react";
import Image from "next/image";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { useLaunchStore } from "../hooks/use-launch-store";
import { timeAgo } from "@/lib/utils/get-time-ago";
import { parseIpfsUrl } from "@/lib/utils/ipfs";
import { formatSol, formatTokens, toBn } from "@/lib/utils/decimal";
import { cn } from "@/lib/cn";
import {
  getRealtimeValue,
  getUserPfp,
  toMil,
  toReadableDecimal,
} from "@/lib/utils/shared";
import { ExplorerLink } from "@/components/explorer-url";
import { TokenDto, TradeDto } from "@/lib/data/dtos";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SCALE_FACTOR } from "@/lib/constants";
import Link from "next/link";
import { Disclaimer } from "@/views/home-view/components/disclaimer";

interface TradesTableProps {
  trades: TradeDto[];
  token: TokenDto;
}

const TradesTable = ({ trades: tradesProps, token }: TradesTableProps) => {
  const { trades: tradesStore } = useLaunchStore();
  const trades = getRealtimeValue(tradesProps, tradesStore);

  const tableHeaderClass = "border font-bold text-xs text-white";
  const tableCellClass = "border text-right font-semibold px-4";

  const renderTradeRow = (trade: TradeDto, index: number) => {
    const isBuy = trade.tradeType === "buy";
    const amountOut = toBn(trade.amountOut);
    const amountIn = toBn(trade.amountIn);
    const usdPerToken = toBn(trade.usdPerToken);
    const usdAmount = toMil(
      formatSol(
        isBuy
          ? amountOut.mul(usdPerToken).div(SCALE_FACTOR)
          : amountIn.mul(usdPerToken).div(SCALE_FACTOR)
      )
    );
    const solAmount = toMil(formatSol(isBuy ? amountIn : amountOut));
    const tokenAmount = toMil(formatTokens(isBuy ? amountOut : amountIn));
    const priceUsd = toReadableDecimal(
      Number(trade.usdPerToken) / SCALE_FACTOR.toNumber()
    );

    return (
      <TableRow
        key={index}
        className={cn(
          "hover:bg-[#28282d]",
          isBuy ? "text-success" : "text-destructive"
        )}
      >
        <TableCell className="border text-left font-bold ml-auto w-48">
          <Link
            href={`/profile/${trade.user.wallet}`}
            className="flex gap-2 justify-start items-start ml-auto"
          >
            <div className="h-6 w-6 bg-slate-100 rounded-full">
              <Avatar className="h-6 w-6">
                <AvatarImage src={getUserPfp(trade.user)} alt="avatar" />
              </Avatar>
            </div>

            <span className="bg-pink-100 text-pink-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-gray-700 dark:text-pink-400 border border-pink-400">
              {trade.user.username}
            </span>
          </Link>
        </TableCell>
        <TableCell className={`${tableCellClass} hidden md:table-cell`}>
          ${usdAmount}
        </TableCell>
        <TableCell className={tableCellClass}>{solAmount}</TableCell>
        <TableCell className={`${tableCellClass} hidden md:table-cell`}>
          {tokenAmount}
        </TableCell>

        <TableCell className="border text-right text-muted-foreground text-nowrap w-32">
          {timeAgo(trade.timestamp)} ago
        </TableCell>
        <TableCell className={`border text-right w-12 hidden md:table-cell`}>
          <ExplorerLink path={`tx/${trade.transactionSignature}`} label={""} />
        </TableCell>
      </TableRow>
    );
  };

  return (
    <div className="max-h-[580px]">
      <Table className="rounded-md table-fixed h-0 text-xs overflow-x-scroll">
        <TableHeader className="bg-[#2e2e33]">
          <TableRow>
            <TableHead className={`${tableHeaderClass} w-48`}>
              ACCOUNT
            </TableHead>
            <TableHead
              className={`${tableHeaderClass} text-right hidden md:table-cell`}
            >
              USD
            </TableHead>
            <TableHead className={`${tableHeaderClass} text-right`}>
              SOL
            </TableHead>
            <TableHead
              className={`${tableHeaderClass} text-right hidden md:table-cell`}
            >
              {token?.symbol}
            </TableHead>

            <TableHead className={`${tableHeaderClass} text-right w-32`}>
              DATE
            </TableHead>
            <TableHead
              colSpan={1}
              className={`${tableHeaderClass} w-12 hidden md:table-cell text-center`}
            >
              TXN
            </TableHead>
          </TableRow>
        </TableHeader>
      </Table>
      <ScrollArea className="flex-grow h-full overflow-hidden rounded-b-lg">
        {trades.length === 0 ? (
          <div className="text-center text-white text-xs p-4 bg-[#1d1d22]">
            No trades found
          </div>
        ) : (
          <Table className="rounded-md table-fixed text-xs">
            <TableBody className="bg-[#1d1d22]">
              {trades.map(renderTradeRow)}
            </TableBody>
          </Table>
        )}
      </ScrollArea>
      <Disclaimer className="mt-4" />
    </div>
  );
};

export default TradesTable;
