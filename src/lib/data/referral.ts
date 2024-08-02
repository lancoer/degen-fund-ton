import { count, eq, desc } from "drizzle-orm";
import { referrerStats, trades, userReferralNodes, users } from "../db/schema";
import { ReferrerDto, TradeDto, UserDto } from "./dtos";
import { tradeUserRowToDto } from "./trade";
import { userRowToDto } from "./mint";
import { formatSol, parseSol } from "../utils/decimal";
import { getDb } from "../db";

export const getReferralsCount = async (wallet: string): Promise<number> => {
  const db = await getDb();
  const [_count] = await db
    .select({ count: count() })
    .from(users)
    .where(eq(users.referrer, wallet));

  return _count.count;
};

export const getTradesByReferredUser = async (
  wallet: string
): Promise<TradeDto[]> => {
  const db = await getDb();
  const referredTrades = await db
    .select()
    .from(trades)
    .innerJoin(users, eq(trades.user, users.wallet))
    .where(eq(users.referrer, wallet))
    .orderBy(desc(trades.timestamp))
    .limit(20);

  return referredTrades.map(tradeUserRowToDto);
};

export const getTopReferrers = async (): Promise<ReferrerDto[]> => {
  const db = await getDb();
  const topReferrers = await db
    .select()
    .from(referrerStats)
    .innerJoin(
      userReferralNodes,
      eq(referrerStats.referrer, userReferralNodes.referralNode)
    )
    .innerJoin(users, eq(userReferralNodes.user, users.wallet))
    .orderBy(desc(referrerStats.totalEarnings))
    .limit(10);

  return topReferrers.map((row) => ({
    user: userRowToDto(row.users),
    numReferrals: row.referrer_stats.referredCount,
    solEarned: Number(formatSol(row.referrer_stats.totalEarnings)).toFixed(2),
  }));
};
