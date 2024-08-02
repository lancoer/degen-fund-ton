import { desc, eq, ne } from "drizzle-orm";
import { candlesticks, tokens, trades, users } from "../db/schema";
import { CandleDto, TokenDto, TradeDto, TradeTokenDto } from "./dtos";
import { tokenRowToDto, userRowToDto } from "./mint";
import { getDb } from "../db";

export const getLatestTokenTrades = async (
  mint: string
): Promise<TradeDto[]> => {
  const db = await getDb();
  const tradesUsersRow = await db
    .select()
    .from(trades)
    .innerJoin(users, eq(trades.user, users.wallet))
    .where(eq(trades.tokenAddress, mint))
    .orderBy(desc(trades.id));

  return tradesUsersRow.map((tradeUserRow) => tradeUserRowToDto(tradeUserRow));
};

export const getAllLatestTrades = async (): Promise<TradeTokenDto[]> => {
  const db = await getDb();
  const tradesUsersRow = await db
    .select()
    .from(trades)
    .innerJoin(users, eq(trades.user, users.wallet))
    .innerJoin(tokens, eq(trades.tokenAddress, tokens.address))

    .orderBy(desc(trades.id))
    .limit(300);

  return tradesUsersRow.map((tradeUserRow) => ({
    trade: tradeUserRowToDto(tradeUserRow),
    token: tokenRowToDto(tradeUserRow)!,
  }));
};

export const tradeUserRowToDto = (row: {
  trades: typeof trades.$inferSelect;
  users: typeof users.$inferSelect;
}): TradeDto => {
  const tradeRow = row.trades;
  const userRow = row.users;
  return {
    id: tradeRow.id,
    user: userRowToDto(userRow),
    tokenAddress: tradeRow.tokenAddress,
    tradeType: tradeRow.tradeType,
    amountIn: tradeRow.amountIn.toString(),
    amountOut: tradeRow.amountOut.toString(),
    solReserve: tradeRow.solReserve.toString(),
    tokenReserve: tradeRow.tokenReserve.toString(),
    usdPerToken: tradeRow.usdPerToken.toString(),
    transactionSignature: tradeRow.transactionSignature,
    timestamp: tradeRow.timestamp,
  };
};

export const getCandles = async (mint: string): Promise<CandleDto[]> => {
  const db = await getDb();
  const candles = await db
    .select()
    .from(candlesticks)
    .where(eq(candlesticks.tokenAddress, mint));

  return candles.map((candle) => ({
    id: candle.id,
    tokenAddress: candle.tokenAddress,
    open: candle.open.toString(),
    close: candle.close.toString(),
    high: candle.high.toString(),
    low: candle.low.toString(),
    volume: candle.volume.toString(),
    timestamp: candle.timestamp,
  }));
};
