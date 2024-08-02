import { BN, web3 } from "@coral-xyz/anchor";

export async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function getPubkeyFromStr(key: string) {
  try {
    return new web3.PublicKey(key);
  } catch (pubkeyParseError) {
    return null;
  }
}

export async function getMultipleAccountsInfo(
  connection: web3.Connection,
  pubkeys: web3.PublicKey[],
  opt?: { retry?: boolean; duration?: number }
) {
  opt = opt ?? {};
  opt.retry = opt.retry ?? true;
  opt.duration = opt.duration ?? 2000;
  const { duration, retry } = opt;
  const res = await connection
    .getMultipleAccountsInfo(pubkeys)
    .catch(async () => {
      if (retry) {
        await sleep(duration);
        return await connection
          .getMultipleAccountsInfo(pubkeys)
          .catch((getMultipleAccountsInfoError) => {
            return null;
          });
      }
      return null;
    });
  return res;
}

export const generateRandomSeed = () => {
  const timestamp = Date.now();
  const timestampBigInt = BigInt(timestamp);
  const timestampU64 = timestampBigInt.toString();
  return new BN(timestampU64);
};

export function calcNonDecimalValue(value: number, decimals: number): number {
  return Math.trunc(value * Math.pow(10, decimals));
}

export function calcDecimalValue(value: number, decimals: number): number {
  return value / Math.pow(10, decimals);
}
