import { AnchorProvider, Program, Wallet, web3, BN } from "@coral-xyz/anchor";

import {
  ReferralRegister,
  IDL as ReferralRegisterIDL,
} from "@/program/referralRegister/types";

import { InxPassResult, Result, TxPassResult } from "./types";
import { DegenFundError } from "./error";
import { BPS_DENOMINATOR, PROGRAMS, Seeds } from "./constants";
import ReferralIdl from "@/program/referralRegister/idl.json";

import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { getPubkeyFromStr } from "./utils";
import assert from "@/lib/utils/errors";
import { useReferrerStore } from "@/hooks/use-saved-referrer";
import { TREASURY, ZERO_BN } from "@/lib/constants";
import { formatSol, parseSol } from "@/lib/utils/decimal";

const { systemProgram, associatedTokenProgram } = PROGRAMS;

const REFERRAL_REGISTER_PROGRAM_ID = new PublicKey(
  ReferralIdl.metadata.address
);

export const getReferralNode = (owner?: string) => {
  if (!owner) return null;
  const ownerPubKey = getPubkeyFromStr(owner);
  if (!ownerPubKey) return null;
  return PublicKey.findProgramAddressSync(
    [Seeds.referralNode, ownerPubKey.toBuffer()],
    REFERRAL_REGISTER_PROGRAM_ID
  )[0].toBase58();
};

export type MainStateInfo = {
  owner: string;
  treasury: string;
  layerFeeBps: BN;
};

export type ReferralNodeInfo = {
  id: web3.PublicKey;
  owner: web3.PublicKey;
  referrer: web3.PublicKey | null;
};

export class Pdas {
  programId: web3.PublicKey;
  mainState: web3.PublicKey;
  constructor(programId: web3.PublicKey) {
    this.programId = programId;
    this.mainState = web3.PublicKey.findProgramAddressSync(
      [Seeds.main],
      this.programId
    )[0];
  }

  getReferralNode({ owner }: { owner: web3.PublicKey }) {
    return web3.PublicKey.findProgramAddressSync(
      [Seeds.referralNode, owner.toBuffer()],
      this.programId
    )[0];
  }
}

export class ReferralRegisterConnectivity {
  public program: Program<ReferralRegister>;
  public provider: AnchorProvider;
  pdas: Pdas;
  constructor(input: {
    anchorProvider: AnchorProvider;
    programId: web3.PublicKey;
  }) {
    const { programId, anchorProvider } = input;
    this.provider = anchorProvider;
    this.program = new Program(ReferralRegisterIDL, programId, this.provider);
    this.pdas = new Pdas(this.program.programId);
  }

  async getReferralNode(userStr: string): Promise<ReferralNodeInfo | null> {
    const userId = getPubkeyFromStr(userStr);
    assert(userId, "Invalid user id");

    const id = this.pdas.getReferralNode({ owner: userId });

    const referralNode = await this.program.account.referralNode
      .fetch(id)
      .catch(() => {});

    if (!referralNode) return null;

    const { owner, referrer } = referralNode;
    return {
      id,
      owner,
      referrer,
    };
  }

  // async initReferralNode(
  //   referrer: PublicKey | null
  // ): Promise<Result<TxPassResult>> {
  //   const owner = this.provider.publicKey;
  //   if (!owner) return { Err: DegenFundError.WALLET_NOT_FOUND };
  //   const referralNode = this.pdas.getReferralNode({ owner });

  //   const txSignature = await this.program.methods
  //     .initReferralNode(referrer)
  //     .accounts({
  //       owner,
  //       referralNode,
  //       systemProgram,
  //     })
  //     .rpc()
  //     .catch((initMainStateError) => {
  //       console.error({ initMainStateError });
  //       return null;
  //     });
  //   if (!txSignature) return { Err: DegenFundError.TX_FAILED };
  //   return { Ok: { txSignature } };
  // }

  async claimReferralNode() {
    const owner = this.provider.publicKey;
    assert(owner, "Wallet not connected");
    const referralNode = await this.getReferralNode(owner.toBase58());
    assert(referralNode && referralNode !== null, "Referral node not found");

    let referrer = TREASURY;
    if (referralNode.referrer) {
      referrer = referralNode.referrer;
    }

    const nodeBalance = await this.provider.connection.getBalance(
      referralNode.id
    );

    const minRent =
      await this.provider.connection.getMinimumBalanceForRentExemption(73);

    const instruction = await this.program.methods
      .claim(new BN(nodeBalance - minRent))
      .accounts({
        user: owner,
        mainState: this.pdas.mainState,
        referralNode: referralNode.id,
        referrer,
        systemProgram,
      })
      .instruction();

    return instruction;
  }

  async getInitReferralNodeTx(referrerId: PublicKey | null) {
    const owner = this.provider.publicKey;
    assert(owner, "Wallet not connected");

    const referralNode = this.pdas.getReferralNode({ owner });

    console.log({
      owner: owner.toBase58(),
      referralNode: referralNode.toBase58(),
    });

    const referrerNode = referrerId
      ? this.pdas.getReferralNode({ owner: referrerId })
      : null;

    return this.program.methods
      .initReferralNode(referrerNode)
      .accounts({
        owner,
        referralNode,
        systemProgram,
      })
      .instruction();
  }

  async getReferralAndInitReferralNodeTx() {
    const referrerFromLocalStorage =
      useReferrerStore.getState().referrer?.wallet;
    const referralNode = await this.getReferralNode(
      this.provider.publicKey.toBase58()
    );

    if (referralNode) {
      console.log(
        "referralNodeFound",
        referralNode.id.toBase58(),
        referralNode.referrer?.toBase58()
      );
      return { referrer: referralNode.referrer, inx: [] };
    }

    let maybeUserWallet = referrerFromLocalStorage
      ? new PublicKey(referrerFromLocalStorage)
      : null;

    if (maybeUserWallet?.toBase58() === this.provider.publicKey.toBase58()) {
      maybeUserWallet = null;
    }

    const maybeReferrerNode = maybeUserWallet
      ? await this.getReferralNode(maybeUserWallet.toBase58())
      : null;

    if (maybeReferrerNode) {
      console.log(
        "maybeReferrerNodeFound, initialising node",
        maybeUserWallet?.toBase58()
      );
      return {
        referrer: maybeReferrerNode.id.toBase58(),
        inx: [await this.getInitReferralNodeTx(maybeReferrerNode.owner)],
      };
    } else {
      console.log("noReferralNodeFound, initialising null node");
      return {
        referrer: null,
        inx: [await this.getInitReferralNodeTx(null)],
      };
    }
  }
}
