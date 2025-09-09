import { useParams } from 'react-router';

import { routeConfig, themaConfig } from './Bodem-thema-config';
import { useBodemData } from './useBodemData.hook';

export function useBodemDetailData() {
  const { items, isLoading, isError, breadcrumbs, themaId } = useBodemData();
  const { id } = useParams<{ id: string }>();

  const meting = items.find((meting) => meting.kenmerk === id) ?? null;

  return {
    themaId,
    title: themaConfig.titleDetail,
    meting,
    isLoading,
    isError,
    breadcrumbs,
    routeConfig,
  };
}
