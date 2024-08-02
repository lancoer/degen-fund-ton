'use client';
import dynamicLoader from 'next/dynamic';
import { ThemeProvider } from 'next-themes';
import { TonConnectUIProvider } from '@tonconnect/ui-react';

import { AuthProvider } from '@/providers/auth-provider';
const RealtimeProvider = dynamicLoader(() => import('@/providers/realtime-provider'), {
  ssr: false,
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
      <TonConnectUIProvider manifestUrl="https://ton-connect.github.io/demo-dapp-with-react-ui/tonconnect-manifest.json">
        <RealtimeProvider>{children}</RealtimeProvider>
      </TonConnectUIProvider>
    </ThemeProvider>
  );
}
