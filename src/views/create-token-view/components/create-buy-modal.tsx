'use client';
import React, { useEffect, useState } from 'react';
import { z } from 'zod';

import { tokenSchema } from '..';
import { INITIAL_TOKEN_RESERVE, ZERO_BN } from '@/lib/constants';
import { calculateInputSol, calculateOutputTokens } from '@/lib/utils/token-price';
import { formatSol, formatTokens, parseSol, parseTokens } from '@/lib/utils/decimal';
import { parseIpfsUrl } from '@/lib/utils/ipfs';

import { Button } from '@/components/ui/button';
import { LoadingButton } from '@/components/ui/loading-button';
import { FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui';
import { CredenzaBody, CredenzaContent, CredenzaDescription, CredenzaFooter, CredenzaHeader, CredenzaTitle } from '@/components/ui/credenza';

import useCreateToken from '../hooks/use-token-hook';
import usePumpProgram from '@/hooks/use-pump-program';
import { useToast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { generateBuyMsg } from '@/packages/ton-sdk';
import { useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';

interface CreateBuyModalProps {
  tokenForm: z.infer<typeof tokenSchema>;
  imageUrl: string;
}

const CreateBuyModal = ({ tokenForm, imageUrl }: CreateBuyModalProps) => {
  const [isToken, setIsToken] = useState(false);
  const [buyAmount, setBuyAmount] = useState('');
  const [calculatedAmount, setCalculatedAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [metadataUrl, setMetadataUrl] = useState('');
  const wallet = useTonWallet();
  const [tonConnectUI] = useTonConnectUI();
  const { toast } = useToast();
  const { buildAndUploadMetadata } = useCreateToken();
  const { createToken } = usePumpProgram();
  const router = useRouter();
  useEffect(() => {
    if (!buyAmount || isNaN(parseFloat(buyAmount))) {
      setCalculatedAmount('');
      return;
    }
    if (isToken) {
      // TODO: remove non-null assertion

      const inputSol = calculateInputSol(parseTokens(buyAmount)!, ZERO_BN, INITIAL_TOKEN_RESERVE);
      setCalculatedAmount(formatSol(inputSol));
    } else {
      const outputTokens = calculateOutputTokens(parseSol(buyAmount)!, ZERO_BN, INITIAL_TOKEN_RESERVE);
      setCalculatedAmount(formatTokens(outputTokens));
    }
  }, [buyAmount, isToken]);

  const handleSwitch = () => {
    setIsToken((prev) => !prev);
    setBuyAmount(calculatedAmount);
  };

  const onSubmit = async () => {
    setIsLoading(true);

    // const hasExceededLimit =
    //   Number(calculatedAmount) > Number(tokenForm.maxBuyPerWallet);

    // if (hasExceededLimit) {
    //   toast({
    //     title: "Purchase Error",
    //     description: `Purchase limit exceeded: You can only buy up to ${Number(
    //       tokenForm.maxBuyPerWallet
    //     ).toLocaleString()} ${
    //       tokenForm.ticker
    //     } per wallet. Please adjust your amount.`,
    //     variant: "destructive",
    //   });
    //   setIsLoading(false);
    //   return;
    // }

    try {
      const metadataUrl = await buildAndUploadMetadata(tokenForm, imageUrl);
      setMetadataUrl(metadataUrl);
      const msg = await generateBuyMsg(
        localStorage.getItem('newJettonAddress')!,
        isToken ? Number(BigInt(calculatedAmount) / BigInt(1000000000)) : Number(buyAmount),
        0,
        wallet?.account.address!
      );
      const res = await tonConnectUI.sendTransaction(msg!);

      if (res.boc) {
        router.push(`/launch/${localStorage.getItem('newJettonAddress')}`);
      } else if (res.boc) {
        throw new Error(res.boc);
      }
    } catch (error: any) {
      console.error('Blockchain Error Details:', error);
      const errorMessage = error.message || 'An unexpected error occurred while creating the token.';
      toast({
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <CredenzaContent>
      <CredenzaHeader>
        <CredenzaTitle>Buy {tokenForm.name}</CredenzaTitle>
        <CredenzaDescription>Tip: It is optional but buying a small amount of coins helps protect your coin from snipers.</CredenzaDescription>
      </CredenzaHeader>
      <CredenzaBody>
        <div className="space-y-2">
          <FormLabel>Enter {isToken ? tokenForm.ticker : 'SOL'} amount (optional):</FormLabel>
          <Input
            placeholder="0.0"
            value={buyAmount}
            onChange={(e) => setBuyAmount(e.target.value)}
            autoFocus
            type="number"
            baseUnit={
              <div className="flex gap-2 items-center">
                <span>{isToken ? tokenForm.ticker : 'SOL'}</span>
                <Image
                  src={isToken ? parseIpfsUrl(imageUrl) : '/assets/sol.png'}
                  alt="SOL"
                  className="w-6 h-6 rounded-full overflow-hidden"
                  height={24}
                  width={24}
                />
              </div>
            }
          />
          <div className="flex w-full justify-between h-8 items-center">
            <span className="font-medium text-xs">
              {calculatedAmount && (isToken ? `Cost: ${calculatedAmount} SOL` : `You will receive: ${calculatedAmount} ${tokenForm.ticker}`)}
            </span>
            <Button size="sm" variant="ghost" onClick={handleSwitch}>
              {isToken ? 'Switch to SOL' : `Switch to ${tokenForm.ticker}`}
            </Button>
          </div>
        </div>
      </CredenzaBody>
      <CredenzaFooter>
        <LoadingButton onClick={onSubmit} loading={isLoading}>
          Initial Buy
        </LoadingButton>
      </CredenzaFooter>
    </CredenzaContent>
  );
};

export default CreateBuyModal;
