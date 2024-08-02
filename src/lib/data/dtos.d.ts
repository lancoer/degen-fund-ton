import { BN } from "@coral-xyz/anchor";
import {
  users,
  tokens,
  seededTokens,
  trades,
  balances,
  candlesticks,
} from "../db/schema";

interface Socials {
  twitter?: string;
  telegram?: string;
  website?: string;
}

interface SocialLinks {
  [key: string]: string | undefined; // Index signature
}

interface UserDto {
  id: number;
  wallet: string;
  username: string;
  referrer: string | null;
  pfpUrl?: string;
  bio?: string;
  isBanned: boolean;
  createdAt: Date;
}

export type TokenDto = typeof tokens.$inferInsert;
// interface TokenDto {
//   address: string;
//   name: string;
//   symbol: string;
//   description?: string;
//   imageUri: string;
//   socials?: Socials;
//   isNsfw: boolean;
//   isPremium: boolean;
//   bondingCurve: string;
//   creator: UserDto;
//   marketCap: string; // bn
//   tokenReserve: string; // bn
//   solReserve: string; // bn
//   maxBuyWallet: string; // bn
//   startTimeUnix: number;
//   raydiumAmmId?: string;
//   isCompleted: boolean;
//   kothAt?: Date;
//   athMultiplier?: number;
//   currentMultiplier?: number;
//   customTag1: boolean;
//   lastBuyAt: Date;
//   createdAt: Date;
//   updatedAt: Date;
// }

interface TradeDto {
  id: bigint;
  user: UserDto;
  tokenAddress: string;
  tradeType: string;
  amountIn: string; // bn
  amountOut: string; // bn
  solReserve: string; // bn
  tokenReserve: string; // bn
  usdPerToken: string; // bn
  transactionSignature: string;
  timestamp: Date;
}

interface CandleDto {
  id: bigint;
  tokenAddress: string;
  open: string; // bn
  high: string; // bn
  low: string; // bn
  close: string; // bn
  volume: string; // bn
  timestamp: Date;
}

type UsersRow = typeof users.$inferSelect;
type TokensRow = typeof tokens.$inferSelect;
type SeededTokensRow = typeof seededTokens.$inferSelect;
type TradesRow = typeof trades.$inferSelect;
type CandlesticksRow = typeof candlesticks.$inferSelect;

interface TradeTokenDto {
  trade: TradeDto;
  token: TokenDto;
}

interface ReferrerDto {
  user: UserDto;
  numReferrals: number;
  solEarned: string;
}

interface CommentDto {
  user: UserDto;
  tokenAddress: string;
  content: string;
  replyCount: number;
  createdAt: Date;
  updatedAt: Date;
}
