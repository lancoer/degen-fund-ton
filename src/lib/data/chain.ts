import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import {
  Connection,
  GetProgramAccountsFilter,
  ParsedAccountData,
} from "@solana/web3.js";
import { CONNECTION, TOKEN_TOTAL_SUPPLY } from "../constants";

export const getTokenHolders = async (tokenAddress: string) => {
  const snapshot: string[][] = [];
  const accounts = await CONNECTION.getParsedProgramAccounts(TOKEN_PROGRAM_ID, {
    filters: [
      {
        dataSize: 165,
      },
      {
        memcmp: {
          offset: 0,
          bytes: tokenAddress,
        },
      },
    ],
  });

  const totalBalance = TOKEN_TOTAL_SUPPLY.toNumber() / 10 ** 6;

  for (const { account } of accounts) {
    const data = account?.data as ParsedAccountData;
    const accountInfo = data?.parsed?.info;
    const address = accountInfo?.owner;
    const amount = accountInfo?.tokenAmount?.uiAmount;
    // console.log(address, amount);
    if (address && amount)
      snapshot.push([address, ((amount * 100) / totalBalance).toFixed(2)]);
  }

  snapshot.sort((a, b) => Number(b[1]) - Number(a[1]));

  return snapshot;
};

export const getTokenBalances = async (
  wallet: string,
  tokenMintIds: string[]
) => {
  const filters: GetProgramAccountsFilter[] = [
    {
      dataSize: 165, // size of account (bytes)
    },
    {
      memcmp: {
        offset: 32, // location of our query in the account (bytes)
        bytes: wallet, // our search criteria, a base58 encoded string
      },
    },
  ];

  const accounts = await CONNECTION.getParsedProgramAccounts(
    TOKEN_PROGRAM_ID, // new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA")
    { filters: filters }
  );

  const tokenBalances: { [mintId: string]: number } = {};

  accounts.forEach((account) => {
    const parsedAccountInfo: any = account.account.data;
    const mintAddress: string = parsedAccountInfo["parsed"]["info"]["mint"];
    const tokenBalance: number =
      parsedAccountInfo["parsed"]["info"]["tokenAmount"]["uiAmount"];

    if (tokenMintIds.includes(mintAddress)) {
      tokenBalances[mintAddress] = tokenBalance;
    }
  });

  return tokenBalances;
};
