"use client";

import { useToast } from "@/components/ui/use-toast";
import { DECIMAL_FACTOR, ZERO_BN } from "@/lib/constants";
import { formatTokens, parseSol, parseTokens } from "@/lib/utils/decimal";
import assert from "@/lib/utils/errors";
import { PumpProgram } from "@/packages/connectivity";
import { tokenSchema } from "@/views/create-token-view";
import { PublicKey } from "@solana/web3.js";
import { useEffect, useMemo } from "react";
import { z } from "zod";
import useAnchorProvider from "./use-anchor-provider";
import { BN } from "@coral-xyz/anchor";
import LaunchIdl from "@/program/idl.json";
import ReferralIdl from "@/program/referralRegister/idl.json";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import useSendAndConfirmTransaction from "./solana/use-send-and-confirm-transaction";
import { parseIpfsUrl } from "@/lib/utils/ipfs";

const PROGRAM_ID = new PublicKey(LaunchIdl.metadata.address);
const REFERRAL_REGISTER_PROGRAM_ID = new PublicKey(
  ReferralIdl.metadata.address
);

type TokenFormData = z.infer<typeof tokenSchema>;

const usePumpProgram = () => {
  const { toast } = useToast();
  const anchorProvider = useAnchorProvider();
  const sendAndConfirmTransaction = useSendAndConfirmTransaction();

  const program = useMemo(() => {
    if (!anchorProvider) {
      return;
    }
    return new PumpProgram({
      anchorProvider,
      programId: new PublicKey(PROGRAM_ID),
      referralRegisterProgramId: new PublicKey(REFERRAL_REGISTER_PROGRAM_ID),
      sendAndConfirmTransaction,
    });
  }, [anchorProvider, sendAndConfirmTransaction]);

  const createToken = async (
    data: TokenFormData,
    metadataUri: string,
    buyAmount: string
  ) => {
    const tokenParams = {
      name: data.name,
      symbol: data.ticker,
      uri: metadataUri,
    };

    const curveParams = {
      startTime: ZERO_BN,
      maxBuyWallet: ZERO_BN,
      isPremium: false,
    };

    if (data.startTime) {
      curveParams.startTime = new BN(data.startTime);
    }

    if (data.maxBuyPerWallet) {
      curveParams.maxBuyWallet =
        parseTokens(data.maxBuyPerWallet.toString()) ?? ZERO_BN;
    }

    let result;

    if (buyAmount) {
      result = await program.createCurveAndBuy({
        tokenParams,
        curveParams,
        buyParams: {
          minimumAmountOut: "0",
          amountIn: buyAmount,
        },
      });
    } else {
      result = await program.createCurve({ tokenParams, curveParams });
    }

    return result;
  };

  const swapExactSolForTokens = async (
    mint: string,
    curveId: string,
    amountIn: string,
    minimumAmountOut: string
  ) => {
    assert(program, "Wallet not connected");
    const result = await program.swapExactSolForTokens({
      mint,
      curveId,
      amountIn,
      minimumAmountOut,
      tokenProgram: TOKEN_PROGRAM_ID,
    });
    return result;
  };

  const swapExactTokensForSol = async (
    mint: string,
    curveId: string,
    amountIn: string,
    minimumAmountOut: string
  ) => {
    assert(program, "Wallet not connected");
    const result = await program.swapExactTokensForSol({
      mint,
      curveId,
      amountIn,
      minimumAmountOut,
      tokenProgram: TOKEN_PROGRAM_ID,
    });
    return result;
  };

  const initReferralNode = async () => {
    assert(program, "Wallet not connected");
    const result = await program.initReferralNode();
    return result;
  };

  const claimReferralRewards = async () => {
    assert(program, "Wallet not connected");
    const result = await program.claimReferralNode();
    return result;
  };

  return {
    program,
    createToken,
    swapExactSolForTokens,
    swapExactTokensForSol,
    initReferralNode,
    claimReferralRewards,
  };
};

export default usePumpProgram;
