import { authenticate } from "@/lib/auth";
import { getWalletFromJwt } from "@/lib/auth/utils";
import { getDb, getRwDb } from "@/lib/db";
import { comments, replies, users } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import * as z from "zod";

const commentSchema = z.object({
  comment: z.string().min(1, "Comment is required").max(60),
});

type CommentFormValues = z.infer<typeof commentSchema>;

export async function POST(
  request: Request,
  { params: { tokenAddress } }: { params: { tokenAddress: string } }
) {
  const db = await getRwDb();
  const jwt = await authenticate();
  const wallet = getWalletFromJwt(jwt);
  if (!wallet) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const [user] = await db.select().from(users).where(eq(users.wallet, wallet));

  if (!user) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  if (user.isBanned) {
    return NextResponse.json(
      { message: "You are banned from commenting" },
      { status: 403 }
    );
  }

  try {
    const json = await request.json();

    const [prevComment] = await db
      .select()
      .from(comments)
      .where(eq(comments.user, wallet))
      .orderBy(desc(comments.createdAt))
      .limit(1);

    if (
      prevComment &&
      prevComment.createdAt.getTime() > Date.now() - 1000 * 60
    ) {
      return NextResponse.json(
        { message: "You can only comment once every  minute" },
        { status: 403 }
      );
    }

    // Adding a comment
    const data = commentSchema.parse(json) as CommentFormValues;

    const [comment] = await db
      .insert(comments)
      .values({
        user: wallet,
        tokenAddress: tokenAddress,
        content: data.comment,
      })
      .returning();

    return NextResponse.json(
      { message: "Comment added successfully" },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Return validation errors
      return NextResponse.json({ errors: error.errors }, { status: 400 });
    }
    // Handle other errors
    console.error("Error adding comment:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
