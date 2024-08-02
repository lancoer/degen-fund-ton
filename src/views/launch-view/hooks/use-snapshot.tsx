import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { useConnection } from "@solana/wallet-adapter-react";
import { Connection, ParsedAccountData } from "@solana/web3.js";

import useSWR from "swr";

const fetcher = async ({
  connection,
  mint,
}: {
  connection: Connection;
  mint?: string;
}) => {
  if (!mint) throw new Error("No owner or mint provided");
  const snapshot: string[][] = [["address", "balance"]];
  const accounts = await connection.getParsedProgramAccounts(TOKEN_PROGRAM_ID, {
    filters: [
      {
        dataSize: 165,
      },
      {
        memcmp: {
          offset: 0,
          bytes: mint,
        },
      },
    ],
  });

  for (const { account } of accounts) {
    const data = account?.data as ParsedAccountData;
    const accountInfo = data?.parsed?.info;
    const address = accountInfo?.owner;
    const amount = accountInfo?.tokenAmount?.uiAmount;
    if (address && amount) snapshot.push([address, amount]);
  }

  return snapshot;
};

export const useTokenHolders = (mint?: string) => {
  const { connection } = useConnection();

  const { data, error, isValidating, mutate } = useSWR(
    () => mint && ["holders", mint, connection.rpcEndpoint],
    () => fetcher({ connection, mint }),
    {
      errorRetryCount: 1,
      onError: (err) => {
        console.error(`useTokenHolders: ${err}`);
      },
    }
  );

  const loading = !data && !error;

  return {
    holders: data,
    loading,
    error,
    isValidating,
    mutate,
  };
};
