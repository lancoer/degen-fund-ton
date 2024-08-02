import { TransactionInstruction } from "@solana/web3.js";

export type Result<T, E = string> = {
  Ok?: T;
  Err?: E;
};

export type TxPassResult = {
  txSignature: string;
};

export type InxPassResult = {
  instruction: TransactionInstruction;
};
