import { useMemo } from 'react';

import { formatKvkProfileData } from './ProfileCommercial.transform.tsx';
import { isError, isLoading } from '../../../../../universal/helpers/api.ts';
import { useAppStateGetter } from '../../../../hooks/useAppStateStore.ts';
import { themaConfig } from '../Profile-thema-config.ts';

export function useProfileData() {
  const { KVK } = useAppStateGetter();
  const profileData = useMemo(() => {
    return KVK.content !== null
      ? formatKvkProfileData(KVK.content)
      : KVK.content;
  }, [KVK.content]);

  return {
    KVK,
    id: themaConfig.KVK.id,
    title: themaConfig.KVK.title,
    profileData,
    isLoading: isLoading(KVK),
    isError: isError(KVK),
    pageLinks: themaConfig.KVK.pageLinks,
    themaConfig,
  };
}
