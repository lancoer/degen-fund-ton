import { authenticate } from "@/lib/auth";
import { getWalletFromJwt } from "@/lib/auth/utils";
import { userRowToDto } from "@/lib/data/mint";
import { getDb, getRwDb } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import * as z from "zod";

const schema = z.object({
  username: z.string().min(3).max(12),
  bio: z.string().max(160).optional(),
  profileUrl: z.string().url().optional().or(z.string().max(0)),
});

type FormValues = z.infer<typeof schema>;

export async function POST(request: Request) {
  const db = await getRwDb();
  const jwt = await authenticate();
  const wallet = getWalletFromJwt(jwt);

  if (!wallet) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const json = await request.json();
    const data = schema.parse(json) as FormValues;

    const toUpdate: any = {};

    if (data.username) {
      toUpdate.username = data.username;
    }

    // if (data.bio) {
    //   toUpdate.bio = data.bio;
    // }


    if (data.profileUrl) {
      toUpdate.pfpUrl = data.profileUrl;
    }

    const [user] = await db
      .update(users)
      .set(toUpdate)
      .where(eq(users.wallet, wallet))
      .returning();


    // Return a success response
    return NextResponse.json(
      { message: "Profile updated successfully", user: userRowToDto(user) },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Return validation errors
      return NextResponse.json({ errors: error.errors }, { status: 400 });
    }

    // Handle other errors
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
