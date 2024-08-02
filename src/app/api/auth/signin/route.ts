import { cookies } from "next/headers";
import { getUser } from "@/lib/data/user";
import { users } from "@/lib/db/schema";
import { JWT_COOKIE_NAME, generateJwtPayload, signPayload } from "@/lib/auth";
import { userRowToDto } from "@/lib/data/mint";
import { SigninMessage } from "@/lib/utils/siws-message";
import { getDb, getRwDb } from "@/lib/db";

export async function POST(request: Request) {
  const db = await getRwDb();
  const { message, signature } = (await request.json()) as any;

  const signinMessage = new SigninMessage(JSON.parse(message || "{}"));

  // TODO: verify domain in message
  // TODO: verify nonce in message

  try {
    const validationResult = await signinMessage.validate(signature || "");
    // if (!validationResult) {
    //   throw new Error("Invalid signature");
    // }
    const wallet = signinMessage.publicKey;

    let user = await getUser(wallet);
    if (!user) {
      const [userRow] = await db
        .insert(users)
        .values({
          wallet,
          username: wallet.substring(0, 6),
        })
        .returning();
      user = userRowToDto(userRow);
    }
    const preSignJwtPayload = generateJwtPayload(wallet);
    const signedJwt = await signPayload(preSignJwtPayload);

    cookies().set({
      name: JWT_COOKIE_NAME,
      value: signedJwt,
      secure: true,
      path: "/",
      maxAge: 34560000,
    });

    return Response.json({ user });
  } catch (e) {
    console.log("sign rejected => ", e);
  }

  return new Response("unauthorized", { status: 401 });
}
