import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import useSWR from "swr";
import { TokenDto } from "@/lib/data/dtos";
import { useLaunchStore } from "../hooks/use-launch-store";
import { useEffect, useState } from "react";

const fetcher = (url: string) => fetch(url).then((res) => res.json() as any);

const TokenHolders = (props: { token: TokenDto }) => {
  const { token } = props;
  const {
    data: holders,
    isLoading,
    mutate,
  } = useSWR<string[][]>(
    `/api/holders?tokenAddress=${props.token.address}`,
    fetcher
  );
  const [cachedHolders, setCachedHolders] = useState<string[][]>([]);

  const lastTrade = useLaunchStore((state) => state.lastTrade);

  useEffect(() => {
    if (holders) {
      setCachedHolders(holders);
    }
  }, [holders]);

  useEffect(() => {
    mutate(undefined, true);
  }, [lastTrade, mutate]);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Holder</TableHead>
          <TableHead className="text-right">Percentage</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {cachedHolders ? (
          cachedHolders?.slice(0, 20).map((holder, index) => (
            <TableRow key={index} className="h-2">
              <TableCell className="p-2">
                <a
                  href={`https://solscan.io/account/${holder[0]}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-[#c5688e]"
                >
                  {holder[0].slice(0, 6)}{" "}
                  {holder[0] === token.bondingCurve ? "🏦 (Bonding Curve)" : ""}
                  {holder[0] === token.creator.wallet ? "🤵 (Creator)" : ""}
                </a>
              </TableCell>
              <TableCell className="text-right p-0">{holder[1]}%</TableCell>
            </TableRow>
          ))
        ) : (
          <>
            {Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={index} className="h-8">
                <TableCell colSpan={2}>
                  <Skeleton className="h-4 w-full" />
                </TableCell>
              </TableRow>
            ))}
          </>
        )}
      </TableBody>
    </Table>
  );
};

export default TokenHolders;
