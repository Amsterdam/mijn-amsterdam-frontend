import { useMemo } from 'react';

import { formatKvkProfileData } from './ProfileCommercial.transform.tsx';
import { isError, isLoading } from '../../../../../universal/helpers/api.ts';
import { useAppStateGetter } from '../../../../hooks/useAppStateStore.ts';
import { routeConfig, themaTitle, themaIdKVK } from '../Profile-thema-config.ts';

export function useProfileData() {
  const { KVK } = useAppStateGetter();
  const profileData = useMemo(() => {
    return KVK.content !== null
      ? formatKvkProfileData(KVK.content)
      : KVK.content;
  }, [KVK.content]);

  return {
    KVK,
    id: themaIdKVK,
    title: themaTitle.KVK,
    profileData,
    isLoading: isLoading(KVK),
    isError: isError(KVK),
    routeConfig,
    linkListItems: [
      {
        to: 'https://www.kvk.nl/inschrijven-en-wijzigen/wijziging-doorgeven/',
        title: 'Geef wijzigingen door aan de Kamer van Koophandel',
      },
    ],
  };
}
