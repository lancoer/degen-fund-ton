import { tokens, users, seededTokens, trades, tokenAth } from "../db/schema";
import {
  eq,
  desc,
  isNotNull,
  like,
  and,
  count,
  asc,
  ilike,
  or,
} from "drizzle-orm";
import { tokenRowToDto } from "./mint";
import { TokenDto } from "./dtos";
import { getDb, getRwDb } from "../db";

export const createToken = async (
  ...newTokens: TokenDto[]
): Promise<TokenDto[]> => {
  const db = await getDb();
  return await db.insert(tokens).values(newTokens).returning();
};

export const getTokens = async () => {
  const db = await getDb();
  const tokenRows = await db
    .select()
    .from(tokens)
    .innerJoin(users, eq(tokens.creator, users.wallet))
    .leftJoin(seededTokens, eq(tokens.address, seededTokens.tokenAddress))
    .leftJoin(tokenAth, eq(tokens.address, tokenAth.tokenAddress))
    .orderBy(desc(tokens.createdAt)) // Order by createdAt in descending order
    .limit(20);

  const tokenDtos = tokenRows.map(tokenRowToDto) as TokenDto[];
  return tokenDtos;
};

export const getTopTokens = async () => {
  const db = await getDb();
  const topTokens = await db
    .select()
    .from(tokens)
    .innerJoin(users, eq(tokens.creator, users.wallet))
    .leftJoin(seededTokens, eq(tokens.address, seededTokens.tokenAddress))
    .innerJoin(tokenAth, eq(tokens.address, tokenAth.tokenAddress))
    .orderBy(desc(tokenAth.ath))
    .where(isNotNull(tokenAth.ath))
    .limit(10);

  return topTokens.map(tokenRowToDto) as TokenDto[];
};

export const getUserTradedTokens = async (
  wallet: string
): Promise<TokenDto[]> => {
  const db = await getDb();
  const tradedTokens = await db
    .select()
    .from(trades)
    .innerJoin(tokens, eq(trades.tokenAddress, tokens.address))
    .innerJoin(users, eq(tokens.creator, users.wallet))
    .leftJoin(seededTokens, eq(tokens.address, seededTokens.tokenAddress))
    .leftJoin(tokenAth, eq(tokens.address, tokenAth.tokenAddress))
    .where(eq(trades.user, wallet))
    .orderBy(desc(trades.id));

  const duplicated = tradedTokens.map((token) => tokenRowToDto(token)!);
  // return traded tokens without duplicates
  return duplicated.filter(
    (token, index, self) =>
      index === self.findIndex((t) => t.address === token.address)
  );
};

export const getUserCreatedTokens = async (wallet: string) => {
  const db = await getDb();
  const createdTokens = await db
    .select()
    .from(tokens)
    .innerJoin(users, eq(tokens.creator, users.wallet))
    .leftJoin(seededTokens, eq(tokens.address, seededTokens.tokenAddress))
    .leftJoin(tokenAth, eq(tokens.address, tokenAth.tokenAddress))
    .where(eq(tokens.creator, wallet))
    .orderBy(desc(tokens.lastBuyAt));

  return createdTokens.map(tokenRowToDto) as TokenDto[];
};

export const getKoth = async () => {
  const db = await getDb();
  const [kothToken] = await db
    .select()
    .from(tokens)
    .innerJoin(users, eq(tokens.creator, users.wallet))
    .leftJoin(seededTokens, eq(tokens.address, seededTokens.tokenAddress))
    .leftJoin(tokenAth, eq(tokens.address, tokenAth.tokenAddress))
    .where(and(isNotNull(tokens.kothAt), eq(tokens.isCompleted, false)))
    .orderBy(desc(tokens.kothAt))
    .limit(1);

  return tokenRowToDto(kothToken);
};

export const getTokensWithSearchParams = async (searchParams?: any) => {
  const db = await getDb();
  const sortOrderFn = searchParams?.order === "asc" ? asc : desc;
  const filter = [];
  let orderBy = desc(tokens.lastBuyAt);

  const page = searchParams?.page ? parseInt(searchParams.page, 10) : 1;
  const limit = 60;
  const offset = (page - 1) * limit;

  if (searchParams) {
    for (const key in searchParams) {
      if (key === "search") {
        if (searchParams[key]) {
          filter.push(
            or(
              ilike(tokens.name, `%${searchParams[key]}%`),
              ilike(tokens.address, `%${searchParams[key]}%`),
              ilike(tokens.creator, `%${searchParams[key]}%`)
            )
          );
        }
      } else if (key === "sort") {
        if (searchParams[key] === "creation_date") {
          orderBy = sortOrderFn(tokens.createdAt);
        } else if (searchParams[key] === "market_cap") {
          orderBy = sortOrderFn(tokens.marketCap);
        } else {
          orderBy = sortOrderFn(tokens.lastBuyAt);
        }
      }
    }
  }

  const [[totalTokensQuery], tokenRows] = await Promise.all([
    db
      .select({ count: count() })
      .from(tokens)
      .innerJoin(users, eq(tokens.creator, users.wallet))
      .leftJoin(seededTokens, eq(tokens.address, seededTokens.tokenAddress))
      .where(and(...filter)),
    db
      .select()
      .from(tokens)
      .innerJoin(users, eq(tokens.creator, users.wallet))
      .leftJoin(seededTokens, eq(tokens.address, seededTokens.tokenAddress))
      .leftJoin(tokenAth, eq(tokens.address, tokenAth.tokenAddress))
      .where(and(...filter))
      .orderBy(orderBy)
      .offset(offset)
      .limit(limit),
  ]);

  const totalTokens = totalTokensQuery?.count as number;
  const totalPages = Math.ceil(totalTokens / limit);

  const tokenDtos = tokenRows.map(tokenRowToDto) as TokenDto[];

  const paginationInfo = {
    currentPage: page,
    totalPages,
    totalTokens,
    limit,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };

  return { tokens: tokenDtos, paginationInfo };
};
