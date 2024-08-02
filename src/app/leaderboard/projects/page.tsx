import { getTopTokens } from "@/lib/data/tokens";
import { getTopReferrers } from "@/lib/data/referral";
import ProjectsLeaderboard from "@/views/leaderboard/projects";
import { cookies } from "next/headers";

type Props = { searchParams: any };
export default async function Page(props: Props) {
  const _cookies = cookies();
  const topTokens = await getTopTokens();

  return <ProjectsLeaderboard topTokens={topTokens} />;
}
