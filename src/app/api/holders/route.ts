import { getTokenHolders } from "@/lib/data/chain";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tokenAddress = searchParams.get("tokenAddress");

  if (!tokenAddress) {
    return new Response("Token address is required", { status: 400 });
  }

  try {
    const snapshot = await getTokenHolders(tokenAddress);
    return Response.json(snapshot.slice(0, 15));
  } catch (error) {
    console.error("Error fetching token holders:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
