import { useEffect, useState } from "react";

import {
  calculateInputSol,
  calculateOutputTokens,
  calculateSlippage,
} from "@/lib/utils/token-price";
import {
  formatSol,
  formatTokens,
  parseSol,
  parseTokens,
  toBn,
} from "@/lib/utils/decimal";

import { Input } from "@/components/ui";
import { Badge } from "@/components/ui/Badge";
import { parseIpfsUrl } from "@/lib/utils/ipfs";
import { useTokenBalance } from "@/hooks/solana/use-token-balance";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { WSOLMint, ZERO_BN } from "@/lib/constants";
import { useLaunchStore } from "@/views/launch-view/hooks/use-launch-store";
import { cn } from "@/lib/cn";
import ChainConfig from "@/components/chain-config";
import usePumpProgram from "@/hooks/use-pump-program";
import { useChainConfigStore } from "@/hooks/use-chain-config";
import { LoadingButton } from "@/components/ui/loading-button";
import { useToast } from "@/components/ui/use-toast";
import { TokenDto, TradeDto } from "@/lib/data/dtos";
import { getRealtimeValue, toMil } from "@/lib/utils/shared";
import { ExplorerLink } from "@/components/explorer-url";
import { PublicKey } from "@solana/web3.js";
import Image from "next/image";
import { getQuote, getSwapTransaction } from "@/lib/utils/jupag";
import { BN } from "bn.js";
import useSendAndConfirmTransaction from "@/hooks/solana/use-send-and-confirm-transaction";

const DexBuyForm = (props: { token: TokenDto }) => {
  const tokenStore = useLaunchStore((state) => state.mint);

  const token = getRealtimeValue(props.token, tokenStore)!;

  const [buyAmount, setBuyAmount] = useState("");
  const [buyAmountError, setBuyAmountError] = useState("");
  const [calculatedAmount, setCalculatedAmount] = useState("");
  const [quoteResponse, setQuoteResponse] = useState<any>();
  const [isToken, setIsToken] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { connection } = useConnection();
  const { slippage } = useChainConfigStore();
  const { toast } = useToast();
  const wallet = useAnchorWallet();
  const { tokenAmount: solBalance } = useTokenBalance(
    wallet?.publicKey,
    WSOLMint
  );
  const { tokenAmount: tokenBalance } = useTokenBalance(
    wallet?.publicKey,
    token.address ? new PublicKey(token.address) : undefined
  );
  const sendAndConfirmTransaction = useSendAndConfirmTransaction();
  const solPreset = [0.1, 0.5, 5];

  const isTradeOnDex = !!token.raydiumAmmId;

  const handleSwitch = () => {
    setIsToken((prev) => !prev);
    setBuyAmount(calculatedAmount);
  };

  useEffect(() => {
    const calc = async () => {
      setQuoteResponse(undefined);
      setCalculatedAmount("");
      setBuyAmountError("");

      if (!buyAmount || !token) {
        return;
      }
      let amount = isToken ? parseTokens(buyAmount) : parseSol(buyAmount);

      if (!amount || amount.lte(ZERO_BN)) {
        setBuyAmountError("Invalid amount");
        return;
      } else {
        setBuyAmountError("");
      }

      const onePercent = amount.mul(new BN(1)).div(new BN(100));
      amount = amount.sub(onePercent);

      if (isToken) {
        const quote = await getQuote(
          WSOLMint.toBase58(),
          token.address,
          amount.toString(),
          slippage * 100,
          false
        );
        const inAmount = quote?.inAmount;
        if (inAmount) {
          setQuoteResponse(quote);
          setCalculatedAmount(formatSol(new BN(inAmount)));
          setBuyAmountError("");
        }
      } else {
        const quote = await getQuote(
          WSOLMint.toBase58(),
          token.address,
          amount.toString(),
          slippage * 100,
          true
        );
        const outAmount = quote?.outAmount;
        if (outAmount) {
          setQuoteResponse(quote);
          setCalculatedAmount(formatTokens(new BN(outAmount)));
          setBuyAmountError("");
        }
      }
    };

    calc();
  }, [buyAmount, isToken, token, solBalance, slippage, tokenBalance]);

  const onSubmit = async () => {
    console.log("onSubmit");
    if (!quoteResponse) {
      setBuyAmountError("Invalid Quote");
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
          toast({
            title: "Order placed successfully",
            description: (
              <div className="flex flex-row">
                <span>
                  You have successfully placed an order to buy{" "}
                  {isToken ? buyAmount : calculatedAmount} {token.symbol}
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

  return (
    <div className="bg-card p-4 rounded-md space-y-3">
      <div className="flex justify-between">
        <div>
          <Badge
            variant="secondary"
            className="cursor-pointer"
            onClick={handleSwitch}
          >
            {isToken ? "Switch to SOL" : `Switch to ${token?.symbol}`}
          </Badge>
        </div>
        {/* <Badge variant="secondary" className="cursor-pointer">
          Set slippage
        </Badge> */}
        <ChainConfig />
      </div>
      <div>
        <Input
          type="number"
          placeholder={isToken ? `Amount of ${token?.symbol}` : "Amount of SOL"}
          min={0}
          value={buyAmount}
          onChange={(e) => setBuyAmount(e.target.value)}
          className={cn(buyAmountError && "border-destructive")}
          baseUnit={
            <div className="flex gap-2 items-center">
              <span>{isToken ? token?.symbol : "SOL"}</span>
              {isToken && token ? (
                <Image
                  src={parseIpfsUrl(token.imageUri)}
                  alt={token?.symbol}
                  className="w-6 h-6 rounded-full"
                  height={24}
                  width={24}
                />
              ) : (
                <Image
                  src="/assets/sol.png"
                  alt="SOL"
                  className="w-6 h-6"
                  height={24}
                  width={24}
                />
              )}
            </div>
          }
        />
        <span className="text-destructive text-xs">{buyAmountError}</span>
      </div>
      {calculatedAmount && (
        <div className="text-muted-foreground text-xs">
          {isToken
            ? `Cost: ${calculatedAmount} SOL`
            : `You will receive: ${calculatedAmount} ${token?.symbol}`}
        </div>
      )}
      {!isToken && (
        <div className="flex flex-row justify-between items-center">
          <div className="flex flex-row gap-1">
            {solPreset.map((p) => (
              <Badge
                variant="secondary"
                className="cursor-pointer"
                key={p}
                onClick={() => setBuyAmount(p.toString())}
              >
                {p} SOL
              </Badge>
            ))}
          </div>

          <div>
            {solBalance && (
              <span
                className="text-muted-foreground text-xs cursor-pointer"
                onClick={() => setBuyAmount(solBalance.uiAmountString ?? "")}
              >
                {solBalance.uiAmountString} SOL
              </span>
            )}
          </div>
        </div>
      )}
      <LoadingButton
        onClick={onSubmit}
        loading={isLoading}
        className="w-full hover:bg-[#c5688e] mb-4"
      >
        Buy
      </LoadingButton>
    </div>
  );
};

export default DexBuyForm;
