import { getTokensWithSearchParams } from "@/lib/data/tokens";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";
  const sort = searchParams.get("sort") || "";
  const order = searchParams.get("order") || "desc";
  const page = searchParams.get("page") || "1";

  const searchParamsParsed = {
    search,
    sort,
    order: order as "asc" | "desc",
    page,
  };

  try {
    const { tokens, paginationInfo } = await getTokensWithSearchParams(
      searchParamsParsed
    );
    return Response.json({ tokens, paginationInfo });
  } catch (error) {
    console.error("Error fetching tokens:", error);
    return Response.json({ error: "Failed to fetch tokens" }, { status: 500 });
  }
}
