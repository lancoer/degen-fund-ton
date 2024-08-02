import { eq } from "drizzle-orm";
import { tokens, users, seededTokens, tokenAth } from "../db/schema";
import { TokenDto, UserDto } from "./dtos";
import { safeValue } from "../utils/shared";
import { getDb } from "../db";

export const getToken = async (mint: string) => {
  const db = await getDb();
  const [tokenUserRow] = await db
    .select()
    .from(tokens)
    .innerJoin(users, eq(tokens.creator, users.wallet))
    .leftJoin(seededTokens, eq(tokens.address, seededTokens.tokenAddress))
    .leftJoin(tokenAth, eq(tokens.address, tokenAth.tokenAddress))
    .where(eq(tokens.address, mint));
  return tokenRowToDto(tokenUserRow);
};

export const tokenRowToDto = (tokenUserRow: {
  tokens?: typeof tokens.$inferSelect;
  users: typeof users.$inferSelect;
  seeded_tokens?: typeof seededTokens.$inferSelect | null;
  token_ath?: typeof tokenAth.$inferSelect | null;
}): TokenDto | undefined => {
  if (!tokenUserRow?.tokens) return;

  const tokenRow = tokenUserRow.tokens;
  const userRow = tokenUserRow.users;
  const seededTokenRow = tokenUserRow.seeded_tokens;
  const tokenAthRow = tokenUserRow.token_ath;

  return {
    address: tokenRow.address,
    name: tokenRow.name,
    symbol: tokenRow.symbol,
    description: safeValue(tokenRow.description),
    imageUri: tokenRow.imageUri,
    isPremium: tokenRow.isPremium,
    socials: safeValue(tokenRow.socials),
    isNsfw: tokenRow.isNsfw,
    bondingCurve: tokenRow.bondingCurve,
    creator: userRowToDto(userRow),
    tokenReserve: tokenRow.tokenReserve.toString(),
    solReserve: tokenRow.solReserve.toString(),
    marketCap: tokenRow.marketCap.toString(),
    maxBuyWallet: tokenRow.maxBuyWallet.toString(),
    startTimeUnix: tokenRow.startTimeUnix,
    raydiumAmmId: seededTokenRow?.raydiumAmmId,
    isCompleted: tokenRow.isCompleted,
    lastBuyAt: tokenRow.lastBuyAt,
    kothAt: safeValue(tokenRow.kothAt),
    customTag1: tokenRow.customTag1,
    athMultiplier: tokenAthRow?.ath,
    currentMultiplier: tokenAthRow?.current,
    createdAt: tokenRow.createdAt,
    updatedAt: tokenRow.updatedAt,
  };
};

export const userRowToDto = (userRow: typeof users.$inferSelect): UserDto => {
  return {
    id: userRow.id,
    wallet: userRow.wallet,
    username: userRow.username,
    referrer: userRow.referrer,
    pfpUrl: safeValue(userRow.pfpUrl),
    bio: safeValue(userRow.bio),
    isBanned: userRow.isBanned,
    createdAt: userRow.createdAt,
  };
};
