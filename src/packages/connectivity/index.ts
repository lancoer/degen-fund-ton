import { AnchorProvider, Program, Wallet, web3, BN } from "@coral-xyz/anchor";
import { DegenFund, IDL as DegenFundIDL } from "@/program/types";
import { Result, TxPassResult } from "./types";
import { DegenFundError } from "./error";
import { BPS_DENOMINATOR, PROGRAMS } from "./constants";
import { Pdas } from "./pdas";
import {
  calcNonDecimalValue,
  generateRandomSeed,
  getPubkeyFromStr,
} from "./utils";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import { toBufferBE } from "bigint-buffer";
import { PublicKey, Transaction } from "@solana/web3.js";

import {
  ReferralRegister,
  IDL as ReferralRegisterIDL,
} from "@/program/referralRegister/types";
import { ReferralRegisterConnectivity } from "./referralRegister";
import { PRIORITY_RATE } from "@/hooks/use-chain-config";
import { TREASURY } from "@/lib/constants";

const { systemProgram, associatedTokenProgram } = PROGRAMS;

const treasury = TREASURY;

export type MainStateInfo = {
  tradingFee: number;
  owner: string;
};

export type CurveInfo = {
  creator: web3.PublicKey;
  mint: web3.PublicKey;
  tokenReserve: BN;
  solReserve: BN;
  maxBuyWallet: BN;
  startTime: BN;
  isFilled: boolean;
};

export type TokenParams = {
  name: string;
  symbol: string;
  uri: string;
};

export type CurveParams = {
  maxBuyWallet: BN;
  startTime: BN;
  isPremium: boolean;
};

export type TaxedTokenParams = {
  tokenName: string;
  tokenSymbol: string;
  tokenUri: string;
  tokenSupply: BN;
  liquidityTokensBps: number;
};

export class PumpProgram {
  public program: Program<DegenFund>;
  public referrerRegisterConnectivity: ReferralRegisterConnectivity;
  public provider: AnchorProvider;
  public sendAndConfirmTransaction: (
    transaction: Transaction
  ) => Promise<string>;
  pdas: Pdas;
  constructor(input: {
    anchorProvider: AnchorProvider;
    programId: web3.PublicKey;
    referralRegisterProgramId: web3.PublicKey;
    sendAndConfirmTransaction: (transaction: Transaction) => Promise<string>;
  }) {
    const {
      programId,
      anchorProvider,
      referralRegisterProgramId,
      sendAndConfirmTransaction,
    } = input;
    this.provider = anchorProvider;
    this.program = new Program(DegenFundIDL, programId, this.provider);
    this.referrerRegisterConnectivity = new ReferralRegisterConnectivity({
      anchorProvider,
      programId: referralRegisterProgramId,
    });
    this.pdas = new Pdas(this.program.programId);
    this.sendAndConfirmTransaction = sendAndConfirmTransaction;
  }

  async initReferralNode(): Promise<Result<TxPassResult & { node: string }>> {
    const feePayer = this.provider.publicKey;
    if (!feePayer) return { Err: DegenFundError.WALLET_NOT_FOUND };

    const { referrer, inx: createNodeInx } =
      await this.referrerRegisterConnectivity.getReferralAndInitReferralNodeTx();

    const transaction = new Transaction().add(
      web3.ComputeBudgetProgram.setComputeUnitLimit({ units: PRIORITY_RATE }),
      ...createNodeInx
    );

    // const txSignature = await this.provider.sendAndConfirm(transaction);

    const txSignature = await this.sendAndConfirmTransaction(transaction);

    if (!txSignature) return { Err: DegenFundError.TX_FAILED };

    return { Ok: { txSignature, node: "" } };
  }

  async claimReferralNode(): Promise<Result<TxPassResult & { node: string }>> {
    const feePayer = this.provider.publicKey;
    if (!feePayer) return { Err: DegenFundError.WALLET_NOT_FOUND };

    const inx = await this.referrerRegisterConnectivity.claimReferralNode();

    const transaction = new Transaction().add(
      web3.ComputeBudgetProgram.setComputeUnitLimit({ units: PRIORITY_RATE }),
      inx
    );

    const txSignature = await this.sendAndConfirmTransaction(transaction);

    if (!txSignature) return { Err: DegenFundError.TX_FAILED };

    return { Ok: { txSignature, node: "" } };
  }

  async createCurve(input: {
    tokenParams: TokenParams;
    curveParams: CurveParams;
  }): Promise<Result<TxPassResult & { curveId: string; mint: string }>> {
    const feePayer = this.provider.publicKey;
    if (!feePayer) return { Err: DegenFundError.WALLET_NOT_FOUND };

    const seed = generateRandomSeed();

    const { referrer, inx: createNodeInx } =
      await this.referrerRegisterConnectivity.getReferralAndInitReferralNodeTx();

    const mint = this.pdas.getMintAccount({
      owner: feePayer,
      seed: seed.toArrayLike(Buffer, "be", 8),
    });

    const [metadataAddress] = web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("metadata"),
        PROGRAMS.tokenMetadataProgram.toBuffer(),
        mint.toBuffer(),
      ],
      PROGRAMS.tokenMetadataProgram
    );

    const curveState = this.pdas.getCurveStateAccount({ mint });

    const tokenReserve = getAssociatedTokenAddressSync(mint, curveState, true);

    const transaction = await this.program.methods
      .createCurve(input.tokenParams, input.curveParams, seed)
      .accounts({
        metadata: metadataAddress,
        mint,
        creator: feePayer,
        mainState: this.pdas.mainState,
        treasury,
        rent: web3.SYSVAR_RENT_PUBKEY,
        systemProgram: web3.SystemProgram.programId,
        tokenProgram: PROGRAMS.tokenProgram,
        tokenMetadataProgram: PROGRAMS.tokenMetadataProgram,
        curveState,
        tokenReserve,
      })
      .preInstructions([
        web3.ComputeBudgetProgram.setComputeUnitLimit({ units: PRIORITY_RATE }),
        ...createNodeInx,
      ])
      .transaction();

    try {
      const txSignature = await this.sendAndConfirmTransaction(transaction);
      if (!txSignature) return { Err: DegenFundError.TX_FAILED };

      return {
        Ok: {
          txSignature,
          curveId: curveState.toBase58(),
          mint: mint.toBase58(),
        },
      };
    } catch (e: any) {
      try {
        const error = JSON.parse(e.message);
        const [code, { Custom }] = error.InstructionError;
        const errorMessage = this.program.idl.errors.find(
          (err) => err.code === Custom
        )?.msg;

        if (errorMessage) {
          return { Err: errorMessage };
        } else {
          return { Err: "Unknown error" };
        }
      } catch {
        return { Err: e.message };
      }
    }
  }

  async createCurveAndBuy(input: {
    tokenParams: TokenParams;
    curveParams: CurveParams;
    buyParams: {
      amountIn: string;
      minimumAmountOut: string;
    };
  }): Promise<Result<TxPassResult & { curveId: string; mint: string }>> {
    const feePayer = this.provider.publicKey;
    if (!feePayer) return { Err: DegenFundError.WALLET_NOT_FOUND };

    const seed = generateRandomSeed();

    const mint = this.pdas.getMintAccount({
      owner: feePayer,
      seed: seed.toArrayLike(Buffer, "be", 8),
    });

    const [metadataAddress] = web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("metadata"),
        PROGRAMS.tokenMetadataProgram.toBuffer(),
        mint.toBuffer(),
      ],
      PROGRAMS.tokenMetadataProgram
    );

    const curveState = this.pdas.getCurveStateAccount({ mint });

    const tokenReserve = getAssociatedTokenAddressSync(mint, curveState, true);

    const userMintAta = getAssociatedTokenAddressSync(
      mint,
      feePayer,
      true,
      PROGRAMS.tokenProgram
    );

    const amountIn = new BN(
      toBufferBE(
        BigInt(
          calcNonDecimalValue(Number(input.buyParams.amountIn), 9).toString()
        ),
        8
      )
    );
    const minimumAmountOut = new BN(
      toBufferBE(
        BigInt(
          calcNonDecimalValue(
            Number(input.buyParams.minimumAmountOut),
            6
          ).toString()
        ),
        8
      )
    );

    const { referrer, inx: createNodeInx } =
      await this.referrerRegisterConnectivity.getReferralAndInitReferralNodeTx();

    const aSwapCtx = {
      user: feePayer,
      mainState: this.pdas.mainState,
      curveState,
      mint,
      userMintAta,
      curveMintAta: tokenReserve,
      treasury,
      systemProgram,
      tokenProgram: PROGRAMS.tokenProgram,
      associatedTokenProgram,
      referrer,
    };

    const buyInx = await this.program.methods
      .swapExactSolForTokens(amountIn, minimumAmountOut)
      .accounts(aSwapCtx)
      .instruction();

    const transaction = await this.program.methods
      .createCurve(input.tokenParams, input.curveParams, seed)
      .accounts({
        metadata: metadataAddress,
        mint,
        mainState: this.pdas.mainState,
        treasury,
        creator: feePayer,
        rent: web3.SYSVAR_RENT_PUBKEY,
        systemProgram: web3.SystemProgram.programId,
        tokenProgram: PROGRAMS.tokenProgram,
        tokenMetadataProgram: PROGRAMS.tokenMetadataProgram,
        curveState,
        tokenReserve,
      })
      .preInstructions([
        web3.ComputeBudgetProgram.setComputeUnitLimit({ units: PRIORITY_RATE }),
        ...createNodeInx,
      ])
      .postInstructions([buyInx])
      .transaction();

    try {
      const txSignature = await this.sendAndConfirmTransaction(transaction);
      if (!txSignature) return { Err: DegenFundError.TX_FAILED };

      return {
        Ok: {
          txSignature,
          curveId: curveState.toBase58(),
          mint: mint.toBase58(),
        },
      };
    } catch (e: any) {
      try {
        const error = JSON.parse(e.message);
        const [code, { Custom }] = error.InstructionError;
        const errorMessage = this.program.idl.errors.find(
          (err) => err.code === Custom
        )?.msg;

        if (errorMessage) {
          return { Err: errorMessage };
        } else {
          return { Err: "Unknown error" };
        }
      } catch {
        return { Err: e.message };
      }
    }
  }

  async swapExactSolForTokens(input: {
    mint: string;
    curveId: string;
    amountIn: string;
    minimumAmountOut: string;
    tokenProgram: web3.PublicKey;
  }) {
    const buyer = this.provider.publicKey;
    if (!buyer) return { Err: DegenFundError.WALLET_NOT_FOUND };

    const curveState = getPubkeyFromStr(input.curveId);

    if (!curveState) return { Err: DegenFundError.INVALID_INPUT };

    const mint = new PublicKey(input.mint);

    const amountIn = new BN(
      toBufferBE(
        BigInt(calcNonDecimalValue(Number(input.amountIn), 9).toString()),
        8
      )
    );
    const minimumAmountOut = new BN(
      toBufferBE(
        BigInt(
          calcNonDecimalValue(Number(input.minimumAmountOut), 6).toString()
        ),
        8
      )
    );

    const userMintAta = getAssociatedTokenAddressSync(
      mint,
      buyer,
      true,
      input.tokenProgram
    );
    const curveMintAta = getAssociatedTokenAddressSync(
      mint,
      curveState,
      true,
      input.tokenProgram
    );

    const { referrer, inx: createNodeInx } =
      await this.referrerRegisterConnectivity.getReferralAndInitReferralNodeTx();

    const aSwapCtx = {
      user: buyer,
      mainState: this.pdas.mainState,
      curveState,
      mint,
      userMintAta,
      curveMintAta,
      treasury,
      systemProgram,
      tokenProgram: input.tokenProgram,
      associatedTokenProgram,
      referrer,
    };

    const transaction = await this.program.methods
      .swapExactSolForTokens(amountIn, minimumAmountOut)
      .accounts(aSwapCtx)
      .preInstructions([
        web3.ComputeBudgetProgram.setComputeUnitLimit({ units: PRIORITY_RATE }),
        ...createNodeInx,
      ])
      .transaction();
    try {
      const txSignature = await this.sendAndConfirmTransaction(transaction);
      if (!txSignature) return { Err: DegenFundError.TX_FAILED };

      return { Ok: { txSignature } };
    } catch (e: any) {
      try {
        const error = JSON.parse(e.message);
        const [code, { Custom }] = error.InstructionError;
        const errorMessage = this.program.idl.errors.find(
          (err) => err.code === Custom
        )?.msg;

        if (errorMessage) {
          return { Err: errorMessage };
        } else {
          return { Err: "Unknown error" };
        }
      } catch {
        return { Err: e.message };
      }
    }
  }

  async swapExactTokensForSol(input: {
    mint: string;
    curveId: string;
    amountIn: string;
    minimumAmountOut: string;
    tokenProgram: web3.PublicKey;
  }) {
    const seller = this.provider.publicKey;
    if (!seller) return { Err: DegenFundError.WALLET_NOT_FOUND };

    const curveState = getPubkeyFromStr(input.curveId);

    if (!curveState) return { Err: DegenFundError.INVALID_INPUT };

    const mint = new PublicKey(input.mint);

    const amountIn = new BN(
      toBufferBE(
        BigInt(calcNonDecimalValue(Number(input.amountIn), 6).toString()),
        8
      )
    );
    const minimumAmountOut = new BN(
      toBufferBE(
        BigInt(
          calcNonDecimalValue(Number(input.minimumAmountOut), 9).toString()
        ),
        8
      )
    );
    const userMintAta = getAssociatedTokenAddressSync(
      mint,
      seller,
      true,
      input.tokenProgram
    );
    const curveMintAta = getAssociatedTokenAddressSync(
      mint,
      curveState,
      true,
      input.tokenProgram
    );

    const { referrer, inx: createNodeInx } =
      await this.referrerRegisterConnectivity.getReferralAndInitReferralNodeTx();

    const aSwapCtx = {
      user: seller,
      mainState: this.pdas.mainState,
      curveState,
      mint,
      userMintAta,
      curveMintAta,
      associatedTokenProgram,
      tokenProgram: input.tokenProgram,
      systemProgram,
      treasury,
      referrer,
    };

    const transaction = await this.program.methods
      .swapExactTokensForSol(amountIn, minimumAmountOut)
      .accounts(aSwapCtx)
      .preInstructions([
        web3.ComputeBudgetProgram.setComputeUnitLimit({ units: PRIORITY_RATE }),
        ...createNodeInx,
      ])
      .transaction();

    try {
      const txSignature = await this.sendAndConfirmTransaction(transaction);
      if (!txSignature) return { Err: DegenFundError.TX_FAILED };

      return { Ok: { txSignature } };
    } catch (e: any) {
      try {
        const error = JSON.parse(e.message);
        const [code, { Custom }] = error.InstructionError;
        const errorMessage = this.program.idl.errors.find(
          (err) => err.code === Custom
        )?.msg;

        if (errorMessage) {
          return { Err: errorMessage };
        } else {
          return { Err: "Unknown error" };
        }
      } catch {
        return { Err: e.message };
      }
    }
  }

  async getMainStateInfo(): Promise<MainStateInfo | null> {
    const mainState = this.pdas.mainState;
    const mainStateInfo = await this.program.account.mainState.fetch(mainState);

    if (!mainStateInfo) return null;
    const tradingFee = mainStateInfo.tradingFeeBps / BPS_DENOMINATOR;
    return {
      owner: mainStateInfo.owner.toBase58(),
      tradingFee,
    };
  }

  async getCurveInfo(curveIdStr: string): Promise<CurveInfo | null> {
    const curveId = getPubkeyFromStr(curveIdStr);
    if (!curveId) {
      console.debug("Invalid curve key");
      return null;
    }
    const curveInfo = await this.program.account.curveState.fetch(curveId);

    if (!curveInfo) return null;
    const {
      creator,
      mint,
      tokenReserve,
      solReserve,
      isFilled,
      maxBuyWallet,
      startTime,
    } = curveInfo;
    return {
      creator,
      mint,
      tokenReserve,
      solReserve,
      isFilled,
      maxBuyWallet,
      startTime,
    };
  }
}
