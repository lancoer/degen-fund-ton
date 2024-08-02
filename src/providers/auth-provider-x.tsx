"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useToast } from "@/components/ui/use-toast";
// wallet sign
import { Header, Payload, SIWS } from "@web3auth/sign-in-with-solana";
import useAuthStore from "@/store/use-auth-store";
import { UserDto } from "@/lib/data/dtos";
import { getRealtimeValue } from "@/lib/utils/shared";

const domain = "localhost";
const origin = "https://localhost/login";

function createSolanaMessage(
  address: string,
  statement: string,
  nonce: string
) {
  const header = new Header();
  header.t = "sip99";

  const payload = new Payload();
  payload.domain = domain;
  payload.address = address;
  payload.uri = origin;
  payload.nonce = nonce;
  payload.statement = statement;
  payload.version = "1";
  payload.chainId = 1;

  const message = new SIWS({
    header,
    payload,
  });

  return { message: message.prepareMessage(), header, payload };
}

export const AuthProvider = (props: {
  user: UserDto | undefined;
  children: React.ReactNode;
}) => {
  const { user: userProps, children } = props;

  const { toast } = useToast();
  const { publicKey, signMessage, disconnect } = useWallet();
  const { user: userStore, setUser } = useAuthStore();

  const user = getRealtimeValue(userProps, userStore);

  const signin = useMemo(() => {
    return async (address: string) => {
      if (!signMessage || !publicKey) return;
      const { nonce } = await fetch("/api/auth/nonce").then(
        (res) => res.json() as any
      );
      const { message } = createSolanaMessage(
        address,
        "Signin with SIWS",
        nonce
      );
      const encodedMessage = new TextEncoder().encode(message);
      try {
        const signedMessage = await signMessage(encodedMessage);

        const { user } = await fetch("/api/auth/signin", {
          method: "POST",
          body: JSON.stringify({
            wallet: publicKey.toString(),
            publicKey: publicKey.toBytes(),
            signedMessage: signedMessage,
            encodedMessage: encodedMessage,
          }),
        }).then((res) => res.json() as any);

        if (user) {
          setUser(user);
          toast({
            title: "Success",
            description: "You have signed in successfully.",
            variant: "default",
          });
        } else {
          toast({
            title: "Failed",
            description: "Invalid sign.",
            variant: "destructive",
          });
        }
      } catch (e) {
        console.log("sign rejected => ", e);
        disconnect();
      }
    };
  }, [disconnect, publicKey, signMessage, toast]);

  useEffect(() => {
    if (!publicKey) {
      setUser(undefined);
      return;
    }
    if (user) {
      setUser(user);
    } else {
      signin(publicKey.toBase58());
    }
  }, [publicKey, setUser, signin, user]);

  return children;
};