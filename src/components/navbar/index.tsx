'use client';
import Image from 'next/image';
import { WalletButton } from '@/providers/solana-provider';
import { useEffect, useMemo } from 'react';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import styles from './Navbar.module.css';
import useTradeStore from '@/store/use-trade-store';
import { TradeTokenDto } from '@/lib/data/dtos';
import { getRealtimeValue, getUserPfp } from '@/lib/utils/shared';
import { parseIpfsUrl } from '@/lib/utils/ipfs';
import Link from 'next/link';
import { cn } from '@/lib/cn';
import { formatSol, toBn } from '@/lib/utils/decimal';
import { TonConnectButton } from '@tonconnect/ui-react';

interface ActionItem {
  username: string;
  userPfp: string;
  userWallet: string;
  action: string;
  color: string;
  tokenImg: string;
  tokenAddress: string;
}

interface NavbarProps {
  tradeTokenDtos: TradeTokenDto[];
}
// console.log = () => {};

export const Navbar = ({ tradeTokenDtos: tradesProps }: NavbarProps) => {
  const initTradeStore = useTradeStore((state) => state.initStore);
  const tradesStore = useTradeStore((state) => state.trades);

  const trades = getRealtimeValue(tradesProps, tradesStore);

  useEffect(() => initTradeStore(tradesProps), [initTradeStore, tradesProps]);

  const liveActions: ActionItem[] = useMemo(() => {
    if (!trades?.length) return [];
    return trades
      .sort((a, b) => a.trade.timestamp.getTime() - b.trade.timestamp.getTime())
      .filter((trade) => !trade.token.customTag1 || Number(formatSol(trade.token.solReserve)) > 100)
      .map(({ token, trade }) => {
        const solAmount = (Number(trade.tradeType === 'buy' ? trade.amountIn : trade.amountOut) * 0.000000001).toFixed(4);
        const color = trade.tradeType === 'buy' ? 'text-success decoration-success' : 'text-destructive decoration-destructive';
        const sign = trade.tradeType === 'buy' ? '+' : '-';

        return {
          username: trade.user.username,
          userPfp: getUserPfp(trade.user),
          userWallet: trade.user.wallet,
          action: `${sign}${solAmount} SOL of ${token?.symbol}`,
          color,
          tokenImg: parseIpfsUrl(token?.imageUri),
          tokenAddress: trade.tokenAddress,
        };
      });
  }, [trades]);

  return (
    <header className=" absolute bg-card flex flex-col-reverse gap-4 md:gap-0 md:flex-row px-[1rem] justify-between items-center pt-3 pb-2 z-1 border-b border-[#262626] w-full md:w-[calc(100%-72px)]">
      <div className="flex overflow-hidden whitespace-nowrap w-full md:w-fit relative">
        <div className="h-full top-0 absolute w-64 right-0 bg-gradient-to-r from-transparent via-transparent to-card"></div>
        {/* <div className="flex gap-2 items-center">
          <Circle color="#de7aa1" className="w-4 h-4" size={28} />
          <span className="text-xl">Live</span>
          <ArrowRight color="#de7aa1" className="w-6 h-6" size={28} />
        </div> */}
        <TransitionGroup style={{ display: 'flex', flexDirection: 'row-reverse' }}>
          {liveActions.map((action, index) => (
            <CSSTransition
              key={index}
              timeout={300}
              classNames={{
                enter: styles['slide-in-enter'],
                enterActive: styles['slide-in-enter-active'],
                exit: styles['slide-in-exit'],
                exitActive: styles['slide-in-exit-active'],
              }}
              unmountOnExit
            >
              <div className={`flex items-center gap-2 px-6 ${index !== 0 ? 'border-r' : ''}`}>
                <div className="flex flex-col items-start">
                  <Link href={`/profile/${action.userWallet}`}>
                    <div className="flex gap-2 items-center group">
                      <div className="rounded-full overflow-hidden h-5 w-5 bg-slate-100  group-hover:underline">
                        <Image
                          className="overflow-hidden rounded-full object-cover h-5 w-5"
                          src={action.userPfp}
                          alt={`${action.username}.png`}
                          height={20}
                          width={20}
                        />
                      </div>
                      <div className="text-sm font-bold">{action.username}</div>
                    </div>
                  </Link>
                  <Link href={`/launch/${action.tokenAddress}`}>
                    <div className="flex gap-2 items-center group">
                      <div className={cn('text-sm group-hover:underline', action.color)}>{action.action}</div>
                      <div className="rounded-full overflow-hidden w-5 h-5">
                        <Image className="overflow-hidden rounded-full object-cover h-5 w-5" src={action.tokenImg} alt="" height={20} width={20} />
                      </div>
                    </div>
                  </Link>
                </div>
              </div>
            </CSSTransition>
          ))}
        </TransitionGroup>
      </div>

      <div className="gap-2 justify-end w-full md:w-auto flex pb-1">
        <TonConnectButton />
      </div>
    </header>
  );
};
