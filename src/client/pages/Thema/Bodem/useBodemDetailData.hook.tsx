import { useParams } from 'react-router';

import { useBodemData } from './useBodemData.hook';

export function useBodemDetailData() {
  const { themaId, items, isLoading, isError, breadcrumbs, detailPageConfig } =
    useBodemData();
  const { id } = useParams<{ id: string }>();

  const meting = items.find((meting) => meting.identifier === id) ?? null;

  return {
    themaId,
    title: detailPageConfig.title,
    meting,
    isLoading,
    isError,
    breadcrumbs,
    routeConfig: detailPageConfig.route,
  };
}
