import { useParams } from 'react-router-dom';

import { useBodemData } from './useBodemData.hook';

export function useBodemDetailData() {
  const { items, isLoading, isError, breadcrumbs } = useBodemData();
  const { id } = useParams<{ id: string }>();

  const meting = items.find((meting) => meting.kenmerk === id) ?? null;

  return {
    meting,
    isLoading,
    isError,
    breadcrumbs,
  };
}
