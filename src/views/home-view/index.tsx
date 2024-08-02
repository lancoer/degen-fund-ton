'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { TokenDto, UserDto } from '@/lib/data/dtos';
import useTokenStore from '@/store/use-token-store';
import { TokenCard, KothCard } from './components/token-card';
import { getRealtimeValue } from '@/lib/utils/shared';
import { useSavedReferrer } from '@/hooks/use-saved-referrer';
import SearchFilterBar from './components/search-filter-bar';
import { useSearchParams } from 'next/navigation';
import Pagination from './components/pagination';
import { Disclaimer } from './components/disclaimer';
import { formatSol, toBn } from '@/lib/utils/decimal';

interface HomeViewProps {
  initialTokens: TokenDto[];
  initialKoth?: TokenDto;
  referrer?: UserDto;
}

export const HomeView: React.FC<HomeViewProps> = ({ initialTokens, initialKoth, referrer }) => {
  const { setTokens, tokens: tokensStore, koth: kothStore } = useTokenStore();
  const [searchQuery, setSearchQuery] = useState('');
  const searchParams = useSearchParams();
  const koth = getRealtimeValue(initialKoth, kothStore) || undefined;
  useSavedReferrer(referrer);

  useEffect(() => {
    setTokens(initialTokens, initialKoth);
  }, [initialTokens, initialKoth, setTokens]);

  useEffect(() => {
    const fetchTokens = async () => {
      try {
        const response = await fetch(`/api/tokens?search=${searchQuery}`);
        const data = (await response.json()) as any;
        if (data.tokens) setTokens(data.tokens, koth);
      } catch (error) {
        console.error('Error fetching tokens:', error);
      }
    };

    if (searchQuery) {
      fetchTokens();
    }
  }, [searchQuery, setTokens]);

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  const sortedTokens = useMemo(() => {
    let allTokens = getRealtimeValue(initialTokens, tokensStore) || [];
    allTokens = allTokens.filter((token) => token.address !== koth?.address && (!token.customTag1 || Number(formatSol(token.solReserve)) > 100));
    const isBumpOrdered = searchParams.get('sort') === 'bump_order' || searchParams.get('sort') === null;
    if (isBumpOrdered) {
      return allTokens.sort((a, b) => {
        if (b.lastBuyAt == undefined && a.lastBuyAt == undefined) return 0;
        if (b.lastBuyAt == undefined) return -1;
        if (a.lastBuyAt == undefined) return 1;

        return b.lastBuyAt.getTime() - a.lastBuyAt.getTime();
      });
    } else {
      return allTokens;
    }
  }, [initialTokens, tokensStore, searchParams, koth?.address]);

  return (
    <>
      <div className="px-4 md:px-0">
        <div className="text-center text-4xl font-bold my-10">The Top Hat</div>
        <div className="flex justify-center">{koth && (!koth.customTag1 || Number(formatSol(koth.solReserve)) > 100) && <KothCard token={koth} />}</div>
        <SearchFilterBar search={searchQuery} onSearchChange={handleSearchChange} />
        <div className="w-full gap-4 grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] md:grid-cols-[repeat(auto-fill,minmax(400px,1fr))]">
          {sortedTokens.map((token, index) => (
            <TokenCard key={index} token={token} index={index} />
          ))}
        </div>
      </div>
      <Pagination />
      <Disclaimer />
    </>
  );
};

export default HomeView;
