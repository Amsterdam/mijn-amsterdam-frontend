import { useParams } from 'react-router';

import { routeConfig, themaTitleDetail } from './Bodem-thema-config.ts';
import { useBodemData } from './useBodemData.hook.tsx';

export function useBodemDetailData() {
  const { items, isLoading, isError, breadcrumbs } = useBodemData();
  const { id } = useParams<{ id: string }>();

  const meting = items.find((meting) => meting.kenmerk === id) ?? null;

  return {
    title: themaTitleDetail,
    meting,
    isLoading,
    isError,
    breadcrumbs,
    routeConfig,
  };
}
