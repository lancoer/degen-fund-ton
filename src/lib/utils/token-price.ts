import { BN } from "@coral-xyz/anchor";
import { BPS_DENOMINATOR, FEE_BPS, SOL_DELTA, TOKEN_DELTA } from "../constants";

export const calculateOutputTokens = (
  inputSol: BN,
  solReserve: BN,
  tokenReserve: BN
) => {
  const virtualSolReserve = solReserve.add(SOL_DELTA);
  const virtualTokenReserve = tokenReserve.add(TOKEN_DELTA);
  const invariant = virtualSolReserve.mul(virtualTokenReserve);

  const inputSolAfterFee = inputSol.sub(
    inputSol.mul(FEE_BPS).div(new BN(BPS_DENOMINATOR))
  );

  const newVirtualSolReserves = virtualSolReserve.add(inputSolAfterFee);

  const newVirtualTokenReserves = invariant
    .div(newVirtualSolReserves)
    .add(new BN(1));

  const outputTokens = virtualTokenReserve.sub(newVirtualTokenReserves);

  return BN.min(outputTokens, tokenReserve);
};

export const calculateInputSol = (
  outputTokens: BN,
  solReserve: BN,
  tokenReserve: BN
) => {
  const virtualSolReserve = solReserve.add(SOL_DELTA);
  const virtualTokenReserve = tokenReserve.add(TOKEN_DELTA);

  const invariant = virtualSolReserve.mul(virtualTokenReserve);

  const newVirtualTokenReserves = virtualTokenReserve.sub(outputTokens);

  const newVirtualSolReserves = invariant
    .div(newVirtualTokenReserves)
    .add(new BN(1));

  // const inputSol = newVirtualSolReserves.sub(virtualSolReserve);
  const inputSolWithoutFee = newVirtualSolReserves.sub(virtualSolReserve);

  const inputSol = inputSolWithoutFee
    .mul(new BN(BPS_DENOMINATOR))
    .div(new BN(BPS_DENOMINATOR).sub(FEE_BPS));

  return inputSol;
};

export const calculateOutputSol = (
  inputTokens: BN,
  solReserve: BN,
  tokenReserve: BN
) => {
  const virtualSolReserve = solReserve.add(SOL_DELTA);
  const virtualTokenReserve = tokenReserve.add(TOKEN_DELTA);

  const invariant = virtualSolReserve.mul(virtualTokenReserve);

  const newVirtualTokenReserves = virtualTokenReserve.add(inputTokens);

  const newVirtualSolReserves = invariant
    .div(newVirtualTokenReserves)
    .add(new BN(1));

  const outputSol = virtualSolReserve.sub(newVirtualSolReserves);

  const outputSolAfterFee = outputSol.sub(
    outputSol.mul(FEE_BPS).div(new BN(BPS_DENOMINATOR))
  );

  return outputSolAfterFee;
};

export const calculateSlippage = (amountOut: string, slippageBps: number) => {
  const amount = Number(amountOut);

  return (amount - amount * (slippageBps / 100)).toString();
};
