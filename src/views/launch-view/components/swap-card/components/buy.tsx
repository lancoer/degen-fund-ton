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
import { useAnchorWallet } from "@solana/wallet-adapter-react";
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

const BuyForm = (props: { token: TokenDto }) => {
  const tokenStore = useLaunchStore((state) => state.mint);

  const token = getRealtimeValue(props.token, tokenStore)!;

  const [buyAmount, setBuyAmount] = useState("");
  const [buyAmountError, setBuyAmountError] = useState("");
  const [calculatedAmount, setCalculatedAmount] = useState("");
  const [isToken, setIsToken] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { swapExactSolForTokens } = usePumpProgram();
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
  const solPreset = [0.1, 0.5, 5];

  const isTradeOnDex = !!token.raydiumAmmId;

  const handleSwitch = () => {
    setIsToken((prev) => !prev);
    setBuyAmount(calculatedAmount);
  };

  useEffect(() => {
    if (!buyAmount || !token) {
      setCalculatedAmount("");
      setBuyAmountError("");
      return;
    }
    const amount = isToken ? parseTokens(buyAmount) : parseSol(buyAmount);

    if (!amount || amount.lte(ZERO_BN)) {
      setBuyAmountError("Invalid amount");
    } else if (isToken && token && amount.gt(toBn(token.tokenReserve))) {
      setBuyAmountError(`Insufficient ${token.symbol} liquidity`);
    } else if (!isToken && solBalance && amount.gt(toBn(solBalance.amount))) {
      setBuyAmountError("Insufficient SOL balance");
    } else {
      setBuyAmountError("");
    }

    if (isToken) {
      const inputSol = calculateInputSol(
        parseTokens(buyAmount)!,
        toBn(token.solReserve),
        toBn(token.tokenReserve)
      );
      setCalculatedAmount(formatSol(inputSol));
    } else {
      const outputTokens = calculateOutputTokens(
        parseSol(buyAmount)!,
        toBn(token.solReserve),
        toBn(token.tokenReserve)
      );
      setCalculatedAmount(formatTokens(outputTokens));
    }
  }, [buyAmount, isToken, token, solBalance]);

  const onSubmit = async () => {
    if (!buyAmount || !token) {
      setBuyAmountError("Please enter an amount");
      return;
    }
    const amount = isToken ? parseTokens(buyAmount) : parseSol(buyAmount);

    if (!amount || amount.lte(ZERO_BN)) {
      setBuyAmountError("Invalid amount");
      return;
    } else if (isToken && token && amount.gt(toBn(token.tokenReserve))) {
      setBuyAmountError(`Insufficient ${token.symbol} liquidity`);
      return;
    } else if (!isToken && solBalance && amount.gt(toBn(solBalance.amount))) {
      setBuyAmountError("Insufficient SOL balance");
      return;
    } else {
      setBuyAmountError("");
    }

    if (token.maxBuyWallet && Number(token.maxBuyWallet) > 0) {
      const remainingLimit = toBn(token.maxBuyWallet).sub(
        tokenBalance?.amount ? toBn(tokenBalance.amount) : ZERO_BN
      );
      const calculatedAmountBn = isToken
        ? parseTokens(buyAmount)
        : parseTokens(calculatedAmount);

      if (calculatedAmountBn && calculatedAmountBn.gt(remainingLimit)) {
        toast({
          title: "Max Buy Limit exceeded",
          description: `Total Max Buy: ${toMil(
            formatTokens(toBn(token.maxBuyWallet))
          )} ${token.symbol}. Remaining Amount: ${toMil(
            formatTokens(remainingLimit)
          )} ${token.symbol}`,
          variant: "destructive",
        });
        return;
      }
    }

    setIsLoading(true);
    swapExactSolForTokens(
      token.address,
      token.bondingCurve,
      isToken ? calculatedAmount : buyAmount,
      calculateSlippage(isToken ? buyAmount : calculatedAmount, slippage)
    )
      .then((result) => {
        if (result.Ok) {
          toast({
            title: "Order placed successfully",
            description: (
              <div className="flex flex-row">
                <span>
                  You have successfully placed an order to buy{" "}
                  {isToken ? buyAmount : calculatedAmount} {token.symbol}
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
        } else if (result.Err) {
          toast({
            title: "Error placing order",
            description: `Blockchain Error: ${result.Err}`,
            variant: "destructive",
          });
        }
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
        Trade
      </LoadingButton>
      {token.maxBuyWallet && Number(token.maxBuyWallet) > 0 && (
        <span className="text-muted-foreground text-xs mt-4">
          Max Buy: {toMil(formatTokens(toBn(token.maxBuyWallet)))}{" "}
          {token.symbol}
        </span>
      )}
      {token.maxBuyWallet &&
        Number(token.maxBuyWallet) > 0 &&
        tokenBalance?.amount &&
        toBn(token.maxBuyWallet).sub(toBn(tokenBalance.amount)) && (
          <span className="text-muted-foreground text-xs mt-4">
            {toBn(token.maxBuyWallet)
              .sub(toBn(tokenBalance.amount))
              .gte(ZERO_BN)
              ? ` (${toMil(
                  formatTokens(
                    toBn(token.maxBuyWallet).sub(toBn(tokenBalance.amount))
                  )
                )} left)`
              : `(limit reached)`}
          </span>
        )}
    </div>
  );
};

export default BuyForm;
