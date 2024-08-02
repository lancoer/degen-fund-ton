import { Suspense } from "react";
import {
  getKoth,
  getTokens,
  getTokensWithSearchParams,
} from "@/lib/data/tokens";
import { HomeView } from "@/views/home-view";
import { cookies } from "next/headers";
import { safeCall } from "@/lib/utils/shared";
import { urlToId } from "@/lib/utils/base64url";
import { getUser, getUserWithId } from "@/lib/data/user";
import { getJwt } from "@/lib/auth";
import { getWalletFromJwt } from "@/lib/auth/utils";
import { getTopReferrers } from "@/lib/data/referral";
import ReferralLeaderboard from "@/views/leaderboard/referral";

type Props = { searchParams: any };
export default async function Page(props: Props) {
  const { searchParams } = props;
  const _cookies = cookies();
  const jwt = await getJwt();
  const jwtWallet = getWalletFromJwt(jwt);

  const topReferrers = await getTopReferrers();

  return <ReferralLeaderboard topReferrers={topReferrers} />;
}
