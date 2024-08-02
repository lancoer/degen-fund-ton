// TODO: implement actual nonce generation

import { JWT_COOKIE_NAME } from "@/lib/auth";
import { cookies } from "next/headers";

export async function POST() {
  cookies().delete(JWT_COOKIE_NAME);
  return Response.json({ status: "ok" });
}
