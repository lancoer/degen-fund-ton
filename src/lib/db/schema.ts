import { BN } from "@coral-xyz/anchor";
import {
  customType,
  pgTable,
  timestamp,
  varchar,
  bigint,
  boolean,
  jsonb,
  pgEnum,
  integer,
  text,
  primaryKey,
  bigserial,
} from "drizzle-orm/pg-core";

const bn = customType<{
  data: BN;
  driverData: bigint;
  notNull: true;
}>({
  dataType() {
    return "bigint";
  },
  toDriver(value: BN): bigint {
    return BigInt(value.toString());
  },
  fromDriver(value: bigint): BN {
    return new BN(value.toString());
  },
});

interface Socials {
  twitter?: string;
  telegram?: string;
  website?: string;
}

export const users = pgTable("users", {
  id: bigserial("id", { mode: "number" }).primaryKey().notNull(),
  wallet: text("wallet").unique().notNull(),
  username: varchar("username", { length: 20 }).unique().notNull(),
  pfpUrl: varchar("pfp_url", { length: 256 }),
  bio: varchar("bio", { length: 256 }),
  isBanned: boolean("is_banned").default(false).notNull(),
  referrer: text("referrer"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const tokens = pgTable("tokens", {
  address: text("address").primaryKey(),
  name: varchar("name", { length: 20 }).notNull(),
  symbol: varchar("symbol", { length: 10 }).notNull(),
  description: varchar("description", { length: 256 }),
  imageUri: varchar("image_uri", { length: 256 }).notNull(),
  // metadataUri: varchar("metadata_uri", { length: 256 }),
  socials: jsonb("socials").$type<Socials>().default({}),
  isNsfw: boolean("is_nsfw").default(false).notNull(),
  isPremium: boolean("is_premium").default(false).notNull(),
  bondingCurve: text("bonding_curve").notNull(),
  creator: text("creator")
    .references(() => users.wallet, {
      onDelete: "set null",
    })
    .notNull(),
  tokenReserve: bn("token_reserve", { mode: "bigint" }).notNull(),
  solReserve: bn("sol_reserve", { mode: "bigint" }).notNull(),
  marketCap: bn("market_cap", { mode: "bigint" }).notNull(),
  kothAt: timestamp("koth_at", { withTimezone: true }),
  maxBuyWallet: bn("max_buy_wallet", { mode: "bigint" }).notNull(),
  startTimeUnix: integer("start_time_unix").notNull(),
  isCompleted: boolean("is_completed").default(false).notNull(),
  customTag1: boolean("custom_tag_1").default(false).notNull(),
  lastBuyAt: timestamp("last_buy_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const seededTokens = pgTable("seeded_tokens", {
  tokenAddress: text("token_address")
    .primaryKey()
    .references(() => tokens.address, {
      onDelete: "cascade",
    }),
  raydiumAmmId: text("raydium_amm_id").notNull(),
  createdTimestamp: timestamp("created_timestamp", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const tradeTypeEnum = pgEnum("trade_type", ["buy", "sell"]);

export const trades = pgTable("trades", {
  id: bigint("id", { mode: "bigint" }).primaryKey().notNull(),
  user: text("user").notNull(),
  tokenAddress: text("token_address")
    .references(() => tokens.address, {
      onDelete: "cascade",
    })
    .notNull(),
  tradeType: tradeTypeEnum("trade_type").notNull(),
  amountIn: bn("amount_in", { mode: "bigint" }).notNull(),
  amountOut: bn("amount_out", { mode: "bigint" }).notNull(),
  solReserve: bn("sol_reserve", { mode: "bigint" }).notNull(),
  tokenReserve: bn("token_reserve", { mode: "bigint" }).notNull(),
  usdPerToken: bn("tokens_per_sol", { mode: "bigint" }).notNull(),
  transactionSignature: varchar("transaction_signature", {
    length: 256,
  }).notNull(),
  timestamp: timestamp("timestamp", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const referralRewardClaims = pgTable("referral_reward_claims", {
  id: bigserial("id", { mode: "bigint" }).primaryKey().notNull(),
  user: text("user")
    .references(() => users.wallet, {
      onDelete: "cascade",
    })
    .notNull(),
  referrer: text("referrer"),
  amount: bn("amount", { mode: "bigint" }).notNull(),
  timestamp: timestamp("timestamp", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const candlesticks = pgTable("candlesticks", {
  id: bigint("id", { mode: "bigint" }).primaryKey().notNull(),
  tokenAddress: text("token_address")
    .references(() => tokens.address, {
      onDelete: "cascade",
    })
    .notNull(),
  open: bn("open", { mode: "bigint" }).notNull(),
  high: bn("high", { mode: "bigint" }).notNull(),
  low: bn("low", { mode: "bigint" }).notNull(),
  close: bn("close", { mode: "bigint" }).notNull(),
  volume: bn("volume", { mode: "bigint" }).notNull(),
  timestamp: timestamp("timestamp", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const referrerStats = pgTable("referrer_stats", {
  referrer: text("referrer").primaryKey(),
  referredCount: integer("referred_count").notNull(),
  totalEarnings: bn("total_earnings", { mode: "bigint" }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const userReferralNodes = pgTable("user_referral_nodes", {
  user: text("user")
    .references(() => users.wallet, {
      onDelete: "cascade",
    })
    .unique()
    .notNull(),
  referralNode: text("referral_node"),
});

export const comments = pgTable("comments", {
  id: bigserial("id", { mode: "bigint" }).primaryKey().notNull(),
  user: text("user")
    .references(() => users.wallet, {
      onDelete: "cascade",
    })
    .notNull(),
  tokenAddress: text("token_address")
    .references(() => tokens.address, {
      onDelete: "cascade",
    })
    .notNull(),
  content: text("content").notNull(),
  replyCount: integer("reply_count").default(0).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const replies = pgTable("replies", {
  id: bigserial("id", { mode: "bigint" }).primaryKey().notNull(),
  user: text("user")
    .references(() => users.wallet, {
      onDelete: "cascade",
    })
    .notNull(),
  commentId: bigint("comment_id", { mode: "bigint" })
    .references(() => comments.id, {
      onDelete: "cascade",
    })
    .notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const commentEmojiReactions = pgTable("comment_emoji_reactions", {
  id: bigserial("id", { mode: "bigint" }).primaryKey().notNull(),
  user: text("user")
    .references(() => users.wallet, {
      onDelete: "cascade",
    })
    .notNull(),
  targetCommentId: bigint("target_comment_id", { mode: "bigint" })
    .references(() => comments.id, {
      onDelete: "cascade",
    })
    .notNull(),
  emoji: varchar("emoji", { length: 8 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const tokenAth = pgTable("token_ath", {
  tokenAddress: text("token_address")
    .references(() => tokens.address, {
      onDelete: "cascade",
    })
    .unique()
    .notNull(),
  ath: integer("ath").notNull(),
  current: integer("current").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const stealthWallets = pgTable("stealth_wallets", {
  wallet: text("wallet").unique().notNull(),
  partner: text("partner").notNull(),
});
