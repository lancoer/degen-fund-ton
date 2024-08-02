import { eq, desc } from "drizzle-orm";
import { comments, users } from "../db/schema";
import { CommentDto } from "./dtos";
import { userRowToDto } from "./mint";
import { getDb } from "../db";

export const commentRowToDto = (commentRow: {
  comments: typeof comments.$inferSelect;
  users: typeof users.$inferSelect;
}): CommentDto => {
  return {
    user: userRowToDto(commentRow.users),
    tokenAddress: commentRow.comments.tokenAddress,
    content: commentRow.comments.content,
    replyCount: commentRow.comments.replyCount,
    createdAt: commentRow.comments.createdAt,
    updatedAt: commentRow.comments.updatedAt,
  };
};

export const getComments = async (tokenAddress: string) => {
  const db = await getDb();
  const rows = await db
    .select()
    .from(comments)
    .innerJoin(users, eq(comments.user, users.wallet))
    .where(eq(comments.tokenAddress, tokenAddress))
    .orderBy(desc(comments.createdAt))
    .limit(60);

  return rows.map(commentRowToDto);
};
