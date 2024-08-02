import { LoadingButton } from "@/components/ui/loading-button";
import { useToast } from "@/components/ui/use-toast";
import { useReferralNodeBalance } from "@/hooks/solana/use-referral-node-balance";
import usePumpProgram from "@/hooks/use-pump-program";
import useAuthStore from "@/store/use-auth-store";
import { useWallet } from "@solana/wallet-adapter-react";
import React, { useState } from "react";

const ClaimButton = () => {
  const { publicKey } = useWallet();
  const { balance, mutate } = useReferralNodeBalance(publicKey);
  const { claimReferralRewards } = usePumpProgram();

  const { toast } = useToast();
  const [claimingRewards, setClaimingRewards] = useState(false);

  const onClaim = async () => {
    setClaimingRewards(true);
    try {
      await claimReferralRewards();
      toast({ title: "Referral rewards claimed successfully" });
      mutate("0");
    } catch (error) {
      console.error(error);
      toast({ title: "Failed to claim", variant: "destructive" });
    } finally {
      setClaimingRewards(false);
    }
  };

  return (
    <div className="bg-[#17171c] w-full md:w-3/4 p-6 rounded-xl shadow flex flex-row justify-between items-center">
      <div>
        <p className="text-sm font-semibold">Total Earned</p>
        <h2 className="text-3xl font-bold text-success">
          {balance ?? "--"} SOL
        </h2>
      </div>
      <LoadingButton onClick={onClaim} loading={claimingRewards}>
        Claim
      </LoadingButton>
    </div>
  );
};

export default ClaimButton;
