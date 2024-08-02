import { getJwt } from "@/lib/auth";
import { getWalletFromJwt } from "@/lib/auth/utils";
import {
  getReferralsCount,
  getTradesByReferredUser,
} from "@/lib/data/referral";
import { getReferralNode } from "@/packages/connectivity/referralRegister";
import { ReferralView } from "@/views/referral-view";

export default async function Page() {
  const jwt = await getJwt();
  const jwtWallet = getWalletFromJwt(jwt);
  const node = getReferralNode(jwtWallet);

  const directReferralCount = node ? await getReferralsCount(node) : "--";
  const trades = node ? await getTradesByReferredUser(node) : [];

  return (
    <ReferralView
      directReferralCount={directReferralCount.toString()}
      trades={trades}
    />
  );
}
