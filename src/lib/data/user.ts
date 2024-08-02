import { eq, sql, and } from "drizzle-orm";
import { users } from "../db/schema";
import { UserDto } from "./dtos";
import { safeCall, safeValue } from "../utils/shared";
import { userRowToDto } from "./mint";
import { getDb } from "../db";

export const getUser = async (wallet: string): Promise<UserDto | undefined> => {
  const db = await getDb();
  const [user] = await db
    .select()
    .from(users)
    .where(and(eq(users.wallet, wallet)))
    .limit(1);

  if (!user) return;

  return safeCall(userRowToDto, user);
};

export const getUserWithId = async (
  id: number
): Promise<UserDto | undefined> => {
  const db = await getDb();
  const [user] = await db
    .select()
    .from(users)
    .where(and(eq(users.id, id)))
    .limit(1);

  if (!user) return;

  return safeCall(userRowToDto, user);
};
