import React, { Suspense } from 'react';
import { useAppStateGetter } from '../../hooks/useAppState';
import { getFullAddress } from '../../../universal/helpers/brp';
import { useProfileTypeValue } from '../../hooks/useProfileType';
import MyArea2 from './MyArea2';

// export const MyArea2Lazy = React.lazy(() => import('./MyArea2'));

export function MyArea2Loader() {
  const { HOME, KVK, BRP } = useAppStateGetter();
  const profileType = useProfileTypeValue();
  const address =
    (profileType === 'private'
      ? BRP.content?.adres
      : KVK.content?.vestigingen[0].bezoekadres) || null;

  const homeAddress = getFullAddress(address);

  return (
    <Suspense fallback={<div>Loading buurt bundle...</div>}>
      <MyArea2 center={HOME.content?.latlng} homeAddress={homeAddress} />
    </Suspense>
  );
}
