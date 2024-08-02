import { web3 } from "@coral-xyz/anchor";
import { Seeds } from "./constants";

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

  getMintAccount({ owner, seed }: { owner: web3.PublicKey; seed: Buffer }) {
    return web3.PublicKey.findProgramAddressSync(
      [Seeds.mint, owner.toBuffer(), seed],
      this.programId
    )[0];
  }

  getCurveStateAccount({ mint }: { mint: web3.PublicKey }) {
    return web3.PublicKey.findProgramAddressSync(
      [Seeds.curve, mint.toBuffer()],
      this.programId
    )[0];
  }
}
