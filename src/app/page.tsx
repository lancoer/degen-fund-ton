import { Suspense } from 'react';

import { getKoth, getTokens, getTokensWithSearchParams } from '@/lib/data/tokens';
import { HomeView } from '@/views/home-view';
import { cookies } from 'next/headers';
import { safeCall } from '@/lib/utils/shared';
import { urlToId } from '@/lib/utils/base64url';
import { getUser, getUserWithId } from '@/lib/data/user';
type Props = { searchParams: any };
export default async function Page(props: Props) {
  const { searchParams } = props;
  const _cookies = cookies();
  const refUrlId = searchParams['r'];
  if (refUrlId) {
    const refId = safeCall(urlToId, refUrlId);
  }
  const [tokens, koth, referrer] = await Promise.all([
    getTokensWithSearchParams(searchParams),
    getKoth(),
    safeCall(getUserWithId, safeCall(urlToId, refUrlId)),
  ]);
  return <HomeView initialTokens={tokens.tokens} initialKoth={koth} referrer={referrer} />;
}
