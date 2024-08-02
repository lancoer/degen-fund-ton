import { useConnection } from "@solana/wallet-adapter-react";
import { Connection, PublicKey } from "@solana/web3.js";
import useSWR from "swr";

import ReferralIdl from "@/program/referralRegister/idl.json";
import useAnchorProvider from "../use-anchor-provider";
import { AnchorProvider } from "@coral-xyz/anchor";
import {
  ReferralRegisterConnectivity,
  getReferralNode,
} from "@/packages/connectivity/referralRegister";
import { safeValue } from "@/lib/utils/shared";
import { formatSol } from "@/lib/utils/decimal";
import { BN } from "bn.js";
import { ZERO_BN } from "@/lib/constants";

const REFERRAL_REGISTER_PROGRAM_ID = new PublicKey(
  ReferralIdl.metadata.address
);

const fetcher = async ({
  connection,
  owner,
}: {
  connection?: Connection;
  owner?: PublicKey | null;
}) => {
  if (!owner) throw new Error("No owner  provided");
  if (!connection) throw new Error("No connection provided");

  const node = getReferralNode(owner.toBase58())!;

  const balance = await connection.getBalance(new PublicKey(node));

  const minRent = await connection.getMinimumBalanceForRentExemption(73);

  return formatSol(BN.max(new BN(balance - minRent), ZERO_BN));
};

export const useReferralNodeBalance = (owner?: PublicKey | null) => {
  const { connection } = useConnection();

  const { data, error, isValidating, mutate } = useSWR(
    () =>
      owner && [
        "referral-node-balance",
        owner.toBase58(),
        connection.rpcEndpoint,
      ],
    () => fetcher({ connection, owner }),
    {
      errorRetryCount: 1,
      revalidateOnMount: true,
      onError: (err) => {
        console.error(`useReferralNodeBalance: ${err}`);
      },
    }
  );

  const loading = !data && !error;

  return {
    balance: data,
    loading,
    error,
    isValidating,
    mutate,
  };
};
