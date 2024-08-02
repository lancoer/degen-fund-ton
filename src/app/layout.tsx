/* eslint-disable react/jsx-no-undef */
import { Inter } from 'next/font/google';
import './globals.css';

import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from 'next-themes';
import NextTopLoader from 'nextjs-toploader';
import { Footer } from '@/components/footer';
import { Navbar } from '@/components/navbar';
import { SideBar } from '@/components/sidebar';
import { getAllLatestTrades } from '@/lib/data/trade';
import { getJwt } from '@/lib/auth';
import { getWalletFromJwt } from '@/lib/auth/utils';
import { safeCall } from '@/lib/utils/shared';
import { getUser } from '@/lib/data/user';
import { Metadata } from 'next';
import zipy from 'zipyai';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/react';
import { GoogleAnalytics } from '@next/third-parties/google';

import { Providers } from './providers';

export const dynamic = 'force-dynamic';
const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Degen Fund',
  description: "A new way of fair launch that's ready for trading right away, no need to seed liquidity",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const initialTrades = await getAllLatestTrades();

  const jwt = await getJwt();
  const jwtWallet = getWalletFromJwt(jwt);
  const user = await safeCall(getUser, jwtWallet);
  zipy.init('9f8e7b84');

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <GoogleAnalytics gaId="G-4XFHPRL18H" />
        <Providers>
          <NextTopLoader color="#de7aa1" showSpinner={false} />
          <SideBar>
            <Navbar tradeTokenDtos={initialTrades} />
            <div className="mt-28 md:my-28 flex flex-col min-h-screen max-w-[1390px] w-full mx-auto md:px-4 ">{children}</div>
            {/* <Footer /> */}
          </SideBar>
          <Toaster />
        </Providers>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}

(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};
