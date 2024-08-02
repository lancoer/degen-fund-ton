import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TradeDto } from "@/lib/data/dtos";
import { formatSol, toBn } from "@/lib/utils/decimal";
import { timeAgo } from "@/lib/utils/get-time-ago";
import { useMemo } from "react";

interface Transaction {
  date: string;
  username: string;
  earned: number;
  transaction: string;
}

export const ReferralTable = ({ trades }: { trades: TradeDto[] }) => {
  const parsedTrades = useMemo(() => {
    return trades.map((trade) => ({
      date: timeAgo(trade.timestamp),
      username: trade.user.username,
      earned: formatSol(
        (trade.tradeType == "buy"
          ? toBn(trade.amountIn)
          : toBn(trade.amountOut)
        )
          .mul(toBn("100"))
          .div(toBn("10000"))
          .mul(toBn("2500"))
          .div(toBn("10000"))
      ),
      transaction: trade.transactionSignature,
    }));
  }, [trades]);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Username</TableHead>
          <TableHead>Earned</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {parsedTrades.map((trade, index) => (
          <TableRow key={index}>
            <TableCell>{trade.date}</TableCell>
            <TableCell>{trade.username}</TableCell>
            <TableCell>{trade.earned} SOL</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
