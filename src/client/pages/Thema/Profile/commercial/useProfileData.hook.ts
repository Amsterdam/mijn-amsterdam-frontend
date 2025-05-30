import { useMemo } from 'react';

import { formatKvkProfileData } from './ProfileCommercial.transform';
import { isError, isLoading } from '../../../../../universal/helpers/api';
import { useAppStateGetter } from '../../../../hooks/useAppState';
import { routeConfig, themaTitle } from '../Profile-thema-config';

export function useProfileData() {
  const { KVK } = useAppStateGetter();
  const profileData = useMemo(() => {
    return KVK.content !== null
      ? formatKvkProfileData(KVK.content)
      : KVK.content;
  }, [KVK.content]);

  return {
    KVK,
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
