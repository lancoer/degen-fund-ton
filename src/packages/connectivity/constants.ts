import { web3 } from "@coral-xyz/anchor";
import {
  ASSOCIATED_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from "@coral-xyz/anchor/dist/cjs/utils/token";
import { TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";

export const Seeds = {
  main: Buffer.from("main"),
  mint: Buffer.from("mint"),
  curve: Buffer.from("curve"),
  referralNode: Buffer.from("referral_node"),
};

const TOKEN_METADATA_PROGRAM_ID = new PublicKey(
  "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
);

export const BPS_DENOMINATOR = 10_000;
export const PROGRAMS = {
  systemProgram: web3.SystemProgram.programId,
  tokenProgram: TOKEN_PROGRAM_ID,
  token2022Program: TOKEN_2022_PROGRAM_ID,
  associatedTokenProgram: ASSOCIATED_PROGRAM_ID,
  tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
};
