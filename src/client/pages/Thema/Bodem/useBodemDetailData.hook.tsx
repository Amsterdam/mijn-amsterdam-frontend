import { useParams } from 'react-router';

import { routeConfig, themaTitleDetail } from './Bodem-thema-config';
import { useBodemData } from './useBodemData.hook';

export function useBodemDetailData() {
  const { items, isLoading, isError, breadcrumbs, themaId } = useBodemData();
  const { id } = useParams<{ id: string }>();

  const meting = items.find((meting) => meting.identifier === id) ?? null;

  return {
    themaId,
    title: themaTitleDetail,
    meting,
    isLoading,
    isError,
    breadcrumbs,
    routeConfig,
  };
}
