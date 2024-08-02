import { useEffect, useState } from "react";

import { calculateSlippage } from "@/lib/utils/token-price";
import { formatSol, parseTokens, toBn } from "@/lib/utils/decimal";

import { Input } from "@/components/ui";
import { Badge } from "@/components/ui/Badge";
import { parseIpfsUrl } from "@/lib/utils/ipfs";
import { useTokenBalance } from "@/hooks/solana/use-token-balance";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { WSOLMint, ZERO_BN } from "@/lib/constants";
import { useLaunchStore } from "@/views/launch-view/hooks/use-launch-store";
import { cn } from "@/lib/cn";
import ChainConfig from "@/components/chain-config";
import { useChainConfigStore } from "@/hooks/use-chain-config";
import { LoadingButton } from "@/components/ui/loading-button";
import { useToast } from "@/components/ui/use-toast";
import { PublicKey } from "@solana/web3.js";
import { TokenDto } from "@/lib/data/dtos";
import { getRealtimeValue } from "@/lib/utils/shared";
import { ExplorerLink } from "@/components/explorer-url";
import Image from "next/image";
import { getQuote, getSwapTransaction } from "@/lib/utils/jupag";
import { BN } from "bn.js";
import useSendAndConfirmTransaction from "@/hooks/solana/use-send-and-confirm-transaction";

const DexSellForm = (props: { token: TokenDto }) => {
  const tokenStore = useLaunchStore((state) => state.mint);

  const token = getRealtimeValue(props.token, tokenStore)!;

  const [sellAmount, setSellAmount] = useState("");
  const [sellAmountError, setSellAmountError] = useState("");
  const [calculatedAmount, setCalculatedAmount] = useState("");
  const [quoteResponse, setQuoteResponse] = useState<any>();
  const [isLoading, setIsLoading] = useState(false);
  const { slippage } = useChainConfigStore();
  const { connection } = useConnection();
  const { toast } = useToast();
  const wallet = useAnchorWallet();
  const { tokenAmount: tokenBalance, mutate: mutateTokenBalance } =
    useTokenBalance(
      wallet?.publicKey,
      token.address ? new PublicKey(token.address) : undefined
    );
  const sendAndConfirmTransaction = useSendAndConfirmTransaction();

  useEffect(() => {
    const calc = async () => {
      setQuoteResponse(undefined);
      setCalculatedAmount("");
      setSellAmountError("");

      if (!sellAmount || !token) {
        return;
      }
      const amount = parseTokens(sellAmount);

      if (!amount || amount.lte(ZERO_BN)) {
        setSellAmountError("Invalid amount");
        return;
      } else if (tokenBalance && amount.gt(toBn(tokenBalance.amount))) {
        setSellAmountError("Insufficient balance");
        return;
      } else {
        setSellAmountError("");
      }

      const quote = await getQuote(
        token.address,
        WSOLMint.toBase58(),
        amount.toString(),
        slippage * 100,
        true
      );
      const outAmount = quote?.outAmount;
      if (outAmount) {
        setQuoteResponse(quote);
        setCalculatedAmount(formatSol(new BN(outAmount)));
        setSellAmountError("");
      }
    };

    calc();
  }, [sellAmount, token, tokenBalance, slippage]);

  const onSubmit = async () => {
    console.log("onSubmit");
    if (!quoteResponse) {
      setSellAmountError("Invalid Quote");
      return;
    }

    if (!wallet?.publicKey) {
      toast({
        title: "Error placing order",
        description: "Wallet not connected",
        variant: "destructive",
      });
      return;
    }
    setIsLoading(true);

    getSwapTransaction(
      quoteResponse,
      wallet?.publicKey.toBase58(),
      connection
    ).then(async (transaction) => {
      sendAndConfirmTransaction(transaction)
        .then((signature) => {
          mutateTokenBalance();
          setSellAmount("");
          setCalculatedAmount("");
          toast({
            title: "Order placed successfully",
            description: (
              <div className="flex flex-row">
                <span>
                  You have successfully placed an order to sell {sellAmount}{" "}
                  {token.symbol}
                </span>
                <div className="text-nowrap">
                  <ExplorerLink path={`tx/${signature}`} label={"View Tx"} />
                </div>
              </div>
            ),
          });
        })
        .catch((error) => {
          console.error("Transaction error", error);
          const errorMessage =
            error?.message ||
            "An unexpected error occurred during the transaction.";
          toast({
            title: "Error placing order",
            description: errorMessage,
            variant: "destructive",
          });
        })
        .finally(() => {
          setIsLoading(false);
        });
    });
  };

  const tokenPreset = [25, 50, 75, 100];

  return (
    <div className="bg-card p-4 rounded-md space-y-3">
      <div className="flex justify-end">
        <ChainConfig />
      </div>
      <div>
        <Input
          type="number"
          placeholder={`Amount of ${token.symbol}`}
          min={0}
          value={sellAmount}
          onChange={(e) => setSellAmount(e.target.value)}
          className={cn(sellAmountError && "border-destructive")}
          baseUnit={
            <div className="flex gap-2 items-center">
              <span>{token.symbol}</span>
              {token && (
                <Image
                  src={parseIpfsUrl(token.imageUri)}
                  alt={token.symbol}
                  className="w-6 h-6 rounded-full"
                  height={24}
                  width={24}
                />
              )}
            </div>
          }
        />
        <span className="text-destructive text-xs">{sellAmountError}</span>
      </div>
      {calculatedAmount && (
        <div className="text-muted-foreground text-xs">
          {`You will receive: ${calculatedAmount} SOL`}
        </div>
      )}
      {tokenBalance && tokenBalance.uiAmount !== null && (
        <div className="flex flex-row justify-between items-center">
          <div className="flex flex-row gap-1">
            {tokenPreset.map((p) => (
              <Badge
                variant="secondary"
                className="cursor-pointer"
                key={p}
                onClick={() =>
                  setSellAmount((tokenBalance.uiAmount! * (p / 100)).toString())
                }
              >
                {p}%
              </Badge>
            ))}
          </div>

          <div>
            {tokenBalance && (
              <span
                className="text-muted-foreground text-xs cursor-pointer"
                onClick={() => setSellAmount(tokenBalance.uiAmountString ?? "")}
              >
                {tokenBalance.uiAmount.toFixed(2)} {token.symbol}
              </span>
            )}
          </div>
        </div>
      )}
      <LoadingButton
        onClick={onSubmit}
        loading={isLoading}
        className="w-full hover:bg-[#c5688e]"
      >
        Sell
      </LoadingButton>
    </div>
  );
};

export default DexSellForm;
