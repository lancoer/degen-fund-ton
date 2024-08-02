import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  Transaction,
  VersionedTransaction,
  Connection,
  TransactionSignature,
} from "@solana/web3.js";
import { useCallback } from "react";

const useSendAndConfirmTransaction = () => {
  const { sendTransaction } = useWallet();
  const { connection } = useConnection();

  const _sendAndConfirmTransaction: (
    transaction: Transaction | VersionedTransaction
  ) => Promise<TransactionSignature> = useCallback(
    async (transaction) => {
      console.log("jereere");
      const signature = await sendTransaction(transaction, connection);
      const latestBlockHash = await connection.getLatestBlockhash();

      const res = await connection.confirmTransaction({
        blockhash: latestBlockHash.blockhash,
        lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
        signature,
      });

      console.log("Onchain response:", res);

      if (res.value.err) {
        console.error("Onchain error:", res.value.err);
        throw new Error(JSON.stringify(res.value.err));
      }

      return signature;
    },
    [connection, sendTransaction]
  );

  return _sendAndConfirmTransaction;
};

export default useSendAndConfirmTransaction;
