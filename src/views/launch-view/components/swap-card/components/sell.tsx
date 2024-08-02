import { useEffect, useState } from "react";

import { calculateOutputSol, calculateSlippage } from "@/lib/utils/token-price";
import { formatSol, parseTokens, toBn } from "@/lib/utils/decimal";

import { Input } from "@/components/ui";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/button";
import { parseIpfsUrl } from "@/lib/utils/ipfs";
import { useTokenBalance } from "@/hooks/solana/use-token-balance";
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { WSOLMint, ZERO_BN } from "@/lib/constants";
import { useLaunchStore } from "@/views/launch-view/hooks/use-launch-store";
import { cn } from "@/lib/cn";
import ChainConfig from "@/components/chain-config";
import usePumpProgram from "@/hooks/use-pump-program";
import { useChainConfigStore } from "@/hooks/use-chain-config";
import { LoadingButton } from "@/components/ui/loading-button";
import { useToast } from "@/components/ui/use-toast";
import { PublicKey } from "@solana/web3.js";
import { TokenDto } from "@/lib/data/dtos";
import { getRealtimeValue } from "@/lib/utils/shared";
import { ExplorerLink } from "@/components/explorer-url";
import Image from "next/image";

const SellForm = (props: { token: TokenDto }) => {
  const tokenStore = useLaunchStore((state) => state.mint);

  const token = getRealtimeValue(props.token, tokenStore)!;

  const [buyAmount, setBuyAmount] = useState("");
  const [buyAmountError, setBuyAmountError] = useState("");
  const [calculatedAmount, setCalculatedAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { swapExactTokensForSol } = usePumpProgram();
  const { slippage } = useChainConfigStore();
  const { toast } = useToast();
  const wallet = useAnchorWallet();
  const { tokenAmount: tokenBalance, mutate: mutateTokenBalance } =
    useTokenBalance(
      wallet?.publicKey,
      token.address ? new PublicKey(token.address) : undefined
    );

  useEffect(() => {
    if (!buyAmount || !token) {
      setCalculatedAmount("");
      setBuyAmountError("");
      return;
    }
    const amount = parseTokens(buyAmount);

    if (!amount || amount.lte(ZERO_BN)) {
      setBuyAmountError("Invalid amount");
    } else if (tokenBalance && amount.gt(toBn(tokenBalance.amount))) {
      setBuyAmountError("Insufficient balance");
    } else {
      setBuyAmountError("");
    }

    const outputSol = calculateOutputSol(
      parseTokens(buyAmount)!,
      toBn(token.solReserve),
      toBn(token.tokenReserve)
    );
    setCalculatedAmount(formatSol(outputSol));
  }, [buyAmount, token, tokenBalance]);

  const onSubmit = async () => {
    if (!buyAmount || !token) {
      setBuyAmountError("Please enter an amount");
      return;
    }
    const amount = parseTokens(buyAmount);

    if (!amount || amount.lte(ZERO_BN)) {
      setBuyAmountError("Invalid amount");
      return;
    } else if (tokenBalance && amount.gt(toBn(tokenBalance.amount))) {
      setBuyAmountError("Insufficient balance");
    } else {
      setBuyAmountError("");
    }

    setIsLoading(true);
    swapExactTokensForSol(
      token.address,
      token.bondingCurve,
      buyAmount,
      calculateSlippage(calculatedAmount, slippage)
    )
      .then((result) => {
        mutateTokenBalance();
        setBuyAmount("");
        setCalculatedAmount("");
        toast({
          title: "Order placed successfully",
          description: (
            <div className="flex flex-row">
              <span>
                You have successfully placed an order to sell {buyAmount}{" "}
                {token.symbol}
              </span>
              <div className="text-nowrap">
                <ExplorerLink
                  path={`tx/${result.Ok?.txSignature}`}
                  label={"View Tx"}
                />
              </div>
            </div>
          ),
        });
      })
      .catch((error) => {
        console.error(error);
        const anchorError = error?.error?.errorMessage;
        toast({
          title: "Error placing order",
          description: anchorError ?? error.message,
          variant: "destructive",
        });
      })
      .finally(() => {
        setIsLoading(false);
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
          value={buyAmount}
          onChange={(e) => setBuyAmount(e.target.value)}
          className={cn(buyAmountError && "border-destructive")}
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
        <span className="text-destructive text-xs">{buyAmountError}</span>
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
                  setBuyAmount((tokenBalance.uiAmount! * (p / 100)).toString())
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
                onClick={() => setBuyAmount(tokenBalance.uiAmountString ?? "")}
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
        Trade
      </LoadingButton>
    </div>
  );
};

export default SellForm;
