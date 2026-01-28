import { useParams } from 'react-router';

import { useBodemData } from './useBodemData.hook';

export function useBodemDetailData() {
  const { themaId, items, isLoading, isError, breadcrumbs, themaConfig } =
    useBodemData();
  const { id } = useParams<{ id: string }>();

  const meting = items.find((meting) => meting.identifier === id) ?? null;

  return {
    themaId,
    title: themaConfig.detailPage.title,
    meting,
    isLoading,
    isError,
    breadcrumbs,
    routeConfig: themaConfig.detailPage.route, // TO DO YACINE > moet dit zo blijven
  };
}
