// pages/api/upload-metadata.ts
import { authenticate } from "@/lib/auth";
import { getWalletFromJwt } from "@/lib/auth/utils";
import { getRwDb } from "@/lib/db";
import { stealthWallets } from "@/lib/db/schema";
import { NextRequest, NextResponse } from "next/server";

const partnerMap = {
  lz6P4499PR: "gotbit",
  F7E749AA1: "mav",
} as any;

export async function POST(request: NextRequest) {
  const db = await getRwDb();
  const jwt = await authenticate();
  const wallet = getWalletFromJwt(jwt);

  const { s } = (await request.json()) as any;

  if (!s) {
    return NextResponse.json({ message: "Invalid request" }, { status: 400 });
  }

  const partner = partnerMap[s];

  if (!wallet) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    await db
      .insert(stealthWallets)
      .values({
        wallet,
        partner,
      })
      .onConflictDoNothing();
    return NextResponse.json({ message: "Success" });
  } catch (error) {
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}
