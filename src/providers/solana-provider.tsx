"use client";

import { useCallback, useMemo } from "react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";

import {
  Adapter,
  WalletAdapterNetwork,
  WalletError,
} from "@solana/wallet-adapter-base";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { clusterApiUrl } from "@solana/web3.js";

import {
  SolflareWalletAdapter,
  LedgerWalletAdapter,
  TorusWalletAdapter,
  WalletConnectWalletAdapter,
  PhantomWalletAdapter,
} from "@solana/wallet-adapter-wallets";

import { WalletMultiButton } from "@/packages/wallet-connect";
import "@/packages/wallet-connect/style.css";
import { DEVNET_ENDPOINT, MAINNET_ENDPOINT } from "@/lib/constants";

export const WalletButton = WalletMultiButton;

const wallets: Adapter[] = [
  new PhantomWalletAdapter(),
  new SolflareWalletAdapter(),
  new LedgerWalletAdapter(),
  new TorusWalletAdapter(),
  new WalletConnectWalletAdapter({
    network: WalletAdapterNetwork.Mainnet,
    options: {},
  }),
];

const endpoints = {
  devnet: DEVNET_ENDPOINT,
  mainnet: MAINNET_ENDPOINT,
};

function SolanaProvider({ children }: { children: React.ReactNode }) {
  const endpoint = "";
  const onError = useCallback((error: WalletError) => {
    console.error(error);
  }, []);

  return (
    <ConnectionProvider endpoint={endpoints.mainnet}>
      <WalletProvider wallets={wallets} onError={onError} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

export default SolanaProvider;
