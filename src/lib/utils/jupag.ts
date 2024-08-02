import {
  AddressLookupTableAccount,
  Connection,
  PublicKey,
  SystemProgram,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";
import BN from "bn.js";
import { WSOLMint } from "../constants";

const feeAccount = new PublicKey(
  "JBXngtnWrrjG2i54LTBYKGqF8JzsDMi3SPK4jws4MMEW"
);

export const getQuote = async (
  input: string,
  output: string,
  amount: string,
  slippageBps: number,
  exactIn: boolean
): Promise<any> => {
  const quoteResponse = await (
    await fetch(
      `https://quote-api.jup.ag/v6/quote?inputMint=${input}&outputMint=${output}&amount=${amount}&slippageBps=${slippageBps}&swapMode=${
        exactIn ? "ExactIn" : "ExactOut"
      }`
    )
  ).json();

  return quoteResponse;
};

export const getSwapTransaction = async (
  quoteResponse: any,
  userPubkey: string,
  connection: Connection
) => {
  const { swapTransaction } = (await (
    await fetch("https://quote-api.jup.ag/v6/swap", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        // quoteResponse from /quote api
        quoteResponse,
        // user public key to be used for the swap
        userPublicKey: userPubkey,
        // auto wrap and unwrap SOL. default is true
        wrapAndUnwrapSol: true,
        // feeAccount is optional. Use if you want to charge a fee.  feeBps must have been passed in /quote API.
        // feeAccount: "fee_account_public_key"
      }),
    })
  ).json()) as any;

  let fee = new BN(0);

  if (quoteResponse.inputMint === WSOLMint.toBase58()) {
    fee = new BN(quoteResponse.inAmount).mul(new BN(1)).div(new BN(100));
  } else if (quoteResponse.outputMint === WSOLMint.toBase58()) {
    fee = new BN(quoteResponse.outAmount).mul(new BN(1)).div(new BN(100));
  }

  const swapTransactionBuf = Buffer.from(swapTransaction, "base64");

  var transaction = VersionedTransaction.deserialize(swapTransactionBuf);

  if (fee.gt(new BN(0))) {
    // Create the transfer instruction for the fee
    const transferInstruction = SystemProgram.transfer({
      fromPubkey: new PublicKey(userPubkey),
      toPubkey: feeAccount,
      lamports: BigInt(fee.toString()),
    });

    const addressLookupTableAccounts = await Promise.all(
      transaction.message.addressTableLookups.map(async (lookup) => {
        return new AddressLookupTableAccount({
          key: lookup.accountKey,
          state: AddressLookupTableAccount.deserialize(
            await connection
              .getAccountInfo(lookup.accountKey)
              .then((res: any) => res.data)
          ),
        });
      })
    );

    var message = TransactionMessage.decompile(transaction.message, {
      addressLookupTableAccounts: addressLookupTableAccounts,
    });
    message.instructions.push(transferInstruction);
    transaction.message = message.compileToV0Message(
      addressLookupTableAccounts
    );
  }

  //   const solAmount = quoteResponse

  console.log(transaction);

  return transaction;
};
