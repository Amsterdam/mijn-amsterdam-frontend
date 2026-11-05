import { useMemo } from 'react';

import { isError } from '../../../../../../universal/helpers/api.ts';
import { addLinkElementToProperty } from '../../../../../components/Table/TableV2.tsx';
import { useAppStateGetter } from '../../../../../hooks/useAppStateStore.ts';
import { useIsLoading } from '../../../../../hooks/useIsLoading.ts';
import { useThemaBreadcrumbs } from '../../../../../hooks/useThemaBreadcrumbs.ts';
import { tableConfig, themaConfig } from './Bodem-thema-config.ts';

export function useBodemData() {
  const { BODEM } = useAppStateGetter();
  const items = useMemo(
    () => addLinkElementToProperty(BODEM.content ?? [], 'adres', true),
    [BODEM.content]
  );
  const breadcrumbs = useThemaBreadcrumbs(themaConfig.id);

  return {
    themaId: themaConfig.id,
    title: themaConfig.title,
    tableConfig,
    isLoading: useIsLoading(BODEM),
    isError: isError(BODEM),
    items,
    pageLinks: themaConfig.pageLinks,
    breadcrumbs,
    themaConfig,
  };
}
