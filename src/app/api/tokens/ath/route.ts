import { NextRequest, NextResponse } from "next/server";
import { getDb, getRwDb } from "@/lib/db";
import { seededTokens, tokenAth } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
// import { tokenAth } from "@/lib/db/schema";

interface TokenData {
  address: string;
  decimals: number;
  symbol: string;
  name: string;
  _id: string;
}

interface QuoteTokenData {
  address: string;
  decimals: number;
  symbol: string;
  name: string;
  _id: string;
}

interface ApiResponse {
  chainId: string;
  address: string;
  ath: number;
  athPrice: number;
  athPriceUsd: number;
  listingPrice: number;
  listingPriceUsd: number;
  volume24h: number;
  priceChange24h: number;
  totalTransaction24h: number;
  basePrice: number;
  priceUsd: number;
  baseTokenData: TokenData;
  quoteTokenData: QuoteTokenData;
}

export async function GET(req: NextRequest) {
  const chainId = req.nextUrl.searchParams.get("chainId");
  const address = req.nextUrl.searchParams.get("address");
  const secret =
    req.nextUrl.searchParams.get("secret") ??
    "5ff3a258-2700-11ed-a261-0242ac120002";

  if (!address) {
    return NextResponse.json(
      { message: "token address is required" },
      { status: 400 }
    );
  }

  try {
    const db = await getRwDb();
    const seededToken = await db
      .select({
        raydiumAmmId: seededTokens.raydiumAmmId,
      })
      .from(seededTokens)
      .where(eq(seededTokens.tokenAddress, address))
      .execute();

    if (seededToken.length === 0) {
      return NextResponse.json({ message: "Token not found" }, { status: 404 });
    }

    const raydiumAmmId = seededToken[0].raydiumAmmId;
    const apiUrl = `https://api.dexview.com/pair/extra-info?chainId=${chainId}&address=${raydiumAmmId}`;

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        Secret: secret,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const { data }: { data: ApiResponse } = await response.json();

    if (data?.athPrice && data?.priceUsd) {
      const currentPriceMultliplier = Math.round(
        (data?.priceUsd / data?.listingPriceUsd) * 1000
      );
      // console.log({
      //   ath: Math.round(data?.athPrice / 0.000000028),
      //   current: data?.priceUsd / data?.listingPriceUsd,
      //   currentPriceMultliplier,
      // });

      await db
        .insert(tokenAth)
        .values({
          tokenAddress: address,
          ath: Math.round(data?.athPrice / 0.000000028),
          current: currentPriceMultliplier,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: tokenAth.tokenAddress,
          set: {
            ath: Math.round(data?.athPrice / 0.000000028),
            current: currentPriceMultliplier,
            updatedAt: new Date(),
          },
        });
    }

    return NextResponse.json(
      { message: "Ath added successfully", data: data },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to process request:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
