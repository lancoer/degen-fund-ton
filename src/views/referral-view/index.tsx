"use client";
import useAuthStore from "@/store/use-auth-store";
import { ReferralTable } from "./components/referral-table";
import { safeCall } from "@/lib/utils/shared";
import { idToUrl } from "@/lib/utils/base64url";
import CopyButton from "@/components/copy-button";
import { useMemo, useState } from "react";
import { useReferralNode } from "@/hooks/solana/use-referral-node";
import { useWallet } from "@solana/wallet-adapter-react";
import { LoadingButton } from "@/components/ui/loading-button";
import usePumpProgram from "@/hooks/use-pump-program";
import { useToast } from "@/components/ui/use-toast";
import ClaimButton from "./components/claim-button";
import { TradeDto } from "@/lib/data/dtos";

export const ReferralView = (props: {
  directReferralCount: string;
  trades: TradeDto[];
}) => {
  const { directReferralCount, trades } = props;
  const { user } = useAuthStore();
  const { publicKey } = useWallet();
  const { isNodeExist, loading, mutate } = useReferralNode(publicKey);
  const { initReferralNode } = usePumpProgram();
  const { toast } = useToast();
  const referralUrl = useMemo(() => {
    return `https://localhost:3000?r=${safeCall(idToUrl, user?.id)}`;
  }, [user]);
  const [enablingReferrals, setEnablingReferrals] = useState(false);

  const onEnableReferrals = async () => {
    setEnablingReferrals(true);
    try {
      await initReferralNode();
      toast({ title: "Referrals enabled successfully" });
      mutate(true);
    } catch (error) {
      console.error(error);
      toast({ title: "Failed to enable referrals", variant: "destructive" });
    } finally {
      setEnablingReferrals(false);
    }
  };

  return (
    <section className="max-w-4xl mx-auto py-5 px-6 relative">
      {!user && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex justify-center items-center z-10">
          <div className="text-white text-center p-4 rounded-lg">
            <h2 className="font-bold text-xl mb-2">
              Connect Wallet to Proceed
            </h2>
            <p>Please connect your wallet to access referrals.</p>
          </div>
        </div>
      )}
      <div
        className={`flex flex-col gap-5 ${
          !user ? "opacity-50 pointer-events-none" : ""
        }`}
      >
        <div className="text-center p-6 rounded-xl shadow-lg">
          <h1 className="text-2xl font-bold">Invite Friends & Earn Rewards!</h1>
          <p className="text-md mt-2">
            Earn <b>25%</b> from each referrals trading fees. Start sharing and
            earning today!
          </p>
        </div>
        {isNodeExist ? (
          <div className="flex flex-col lg:flex-row items-center justify-between gap-5 bg-[#17171c] p-6 rounded-xl shadow">
            <div className="flex-1 w-full">
              <h2 className="text-lg font-semibold">Your Referral Link</h2>
              <div className="mt-1 flex items-center bg-[#0d0d0d] p-2 rounded-lg">
                <p className="text-md ml-2 truncate flex-1">{referralUrl}</p>
                <CopyButton value={referralUrl} />
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row items-center justify-between gap-5 bg-[#17171c] p-6 rounded-xl shadow">
            <div className="flex w-full">
              <div>
                <h2 className="text-lg font-semibold">Enable Referrals</h2>
                <p className="text-md mt-2">
                  Enable referrals to start earning rewards.
                </p>
              </div>
              <LoadingButton
                className="mt-4 ml-auto"
                loading={enablingReferrals}
                onClick={onEnableReferrals}
              >
                Enable Referrals
              </LoadingButton>
            </div>
          </div>
        )}
        <div className="flex md:flex-row flex-col gap-5">
          <div className="bg-[#17171c] p-6 rounded-xl shadow flex flex-row justify-between r md:flex-col items-start w-full md:w-1/4">
            <p className="text-sm font-semibold">Total Referrals</p>
            <h2 className="text-3xl font-bold text-primary">
              {directReferralCount}
            </h2>
          </div>
          <ClaimButton />
        </div>
        <div className="bg-[#1d1d22] p-6 rounded-xl shadow">
          <ReferralTable trades={trades} />
        </div>
      </div>
    </section>
  );
};
