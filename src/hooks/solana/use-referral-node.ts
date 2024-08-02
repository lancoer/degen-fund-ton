import { useConnection } from "@solana/wallet-adapter-react";
import { Connection, PublicKey } from "@solana/web3.js";
import useSWR from "swr";

import ReferralIdl from "@/program/referralRegister/idl.json";
import useAnchorProvider from "../use-anchor-provider";
import { AnchorProvider } from "@coral-xyz/anchor";
import { ReferralRegisterConnectivity } from "@/packages/connectivity/referralRegister";
import { safeValue } from "@/lib/utils/shared";

const REFERRAL_REGISTER_PROGRAM_ID = new PublicKey(
  ReferralIdl.metadata.address
);

const fetcher = async ({
  anchorProvider,
  owner,
}: {
  anchorProvider?: AnchorProvider;
  owner?: PublicKey | null;
}) => {
  if (!owner) throw new Error("No owner  provided");
  if (!anchorProvider) throw new Error("No anchorProvider provided");

  const referralRegisterProgram = new ReferralRegisterConnectivity({
    programId: REFERRAL_REGISTER_PROGRAM_ID,
    anchorProvider,
  });

  const node = await referralRegisterProgram.getReferralNode(owner.toBase58());

  return !!safeValue(node);
};

export const useReferralNode = (owner?: PublicKey | null) => {
  const { connection } = useConnection();
  const anchorProvider = useAnchorProvider();

  const { data, error, isValidating, mutate } = useSWR(
    () => owner && ["referral-node", owner.toBase58(), connection.rpcEndpoint],
    () => fetcher({ anchorProvider, owner }),
    {
      errorRetryCount: 1,
      revalidateOnMount: true,
      onError: (err) => {
        console.error(`useReferralNode: ${err}`);
      },
    }
  );

  const loading = !data && !error;

  return {
    isNodeExist: data,
    loading,
    error,
    isValidating,
    mutate,
  };
};
