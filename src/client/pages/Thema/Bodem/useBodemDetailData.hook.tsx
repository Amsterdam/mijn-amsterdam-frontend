import { useParams } from 'react-router';

import { themaConfig } from './Bodem-thema-config';
import { useBodemData } from './useBodemData.hook';

export function useBodemDetailData() {
  const { items, isLoading, isError, breadcrumbs } = useBodemData();
  const { id } = useParams<{ id: string }>();

  const meting = items.find((meting) => meting.kenmerk === id) ?? null;

  return {
    id: themaConfig.id,
    title: themaConfig.detailPage.title ?? undefined,
    meting,
    isLoading,
    isError,
    breadcrumbs,
    routeConfig: themaConfig.detailPage.route,
  };
}
