'use client';
import React, { useCallback, useEffect, useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import useAuthStore from '@/store/use-auth-store';
import { UserDto } from '@/lib/data/dtos';
import { getRealtimeValue } from '@/lib/utils/shared';
import { useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';

export const AuthProvider = ({ user: userProps, children }: { user?: UserDto; children: React.ReactNode }) => {
  const { toast } = useToast();
  const [tonconnectUI] = useTonConnectUI();
  const wallet = useTonWallet();
  const { user: userStore, setUser, isSigning, setIsSigning } = useAuthStore();
  const [loadTime, setLoadTime] = useState<number>();

  useEffect(() => {
    setLoadTime(Date.now());
  }, []);

  const user = getRealtimeValue(userProps, userStore);

  useEffect(() => {
    setUser(userProps);
  }, [userProps, setUser]);

  const signin = useCallback(async () => {
    if (!tonconnectUI.connected || !wallet) return;

    try {
      const { nonce } = await fetch('/api/auth/nonce').then((res) => res.json() as any);

      const message = `Sign this message to sign in to the app. Nonce: ${nonce}`;

      const signature = message;

      const { user } = await fetch('/api/auth/signin', {
        method: 'POST',
        body: JSON.stringify({
          message,
          signature,
          address: wallet.account.address,
        }),
      }).then((res) => res.json() as any);

      if (user) {
        setUser(user);
        toast({
          title: 'Success',
          description: 'You have signed in successfully.',
          variant: 'default',
        });
      } else {
        toast({
          title: 'Failed',
          description: 'Invalid sign.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Signing error:', error);
      toast({
        title: 'Failed',
        description: 'Error during signing process.',
        variant: 'destructive',
      });
    }
  }, [tonconnectUI.connected, wallet, setUser, toast]);

  useEffect(() => {
    const isWalletConnected = tonconnectUI.connected;
    const isUserConnected = !!userStore?.wallet;
    const isSynced = wallet?.account.address === userStore?.wallet;

    if (!isWalletConnected && !isUserConnected) {
      return;
    }

    if (isWalletConnected && !isUserConnected) {
      setIsSigning(true);
      signin()
        .catch((e) => console.error('Signin error:', e))
        .finally(() => setIsSigning(false));
    }

    if (isWalletConnected && isUserConnected && !isSynced) {
      setIsSigning(true);
      signin()
        .catch((e) => console.error('Signin error:', e))
        .finally(() => setIsSigning(false));
    }
  }, [tonconnectUI.connected ?? null, wallet, setUser, signin, userStore, setIsSigning]);

  return <>{children}</>;
};
