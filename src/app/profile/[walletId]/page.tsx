import { getTokenBalances } from "@/lib/data/chain";
import { getUserCreatedTokens, getUserTradedTokens } from "@/lib/data/tokens";
import { getReferralsCount, getTopReferrers } from "@/lib/data/referral";
import { getUser } from "@/lib/data/user";
import { getReferralNode } from "@/packages/connectivity/referralRegister";
import ReferralLeaderboard from "@/views/leaderboard/referral";
import ProfileView from "@/views/profile-view";
import { cookies } from "next/headers";

type Props = {
  params: { walletId: string };
};

export default async function Page(props: Props) {
  // disable cache for this server action
  const _cookies = cookies();

  const tradedTokens = await getUserTradedTokens(props.params.walletId);
  const user = await getUser(props.params.walletId);
  const createdTokens = await getUserCreatedTokens(props.params.walletId);

  const tokenBalances = await getTokenBalances(props.params.walletId, [
    ...tradedTokens.map((t) => t.address),
    ...createdTokens.map((t) => t.address),
  ]);
  const node = getReferralNode(props.params.walletId);

  const referralCount = node ? await getReferralsCount(node) : 0;

  return (
    <ProfileView
      tradedTokens={tradedTokens}
      createdTokens={createdTokens}
      user={user}
      balances={tokenBalances}
      referralCount={referralCount}
    />
  );
}
