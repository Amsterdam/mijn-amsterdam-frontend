// src/client/pages/Burgerzaken/useBurgerZakenDetailData.hook.tsx
import { useParams } from 'react-router';

import { routeConfig } from './Burgerzaken-thema-config.ts';
import { useBurgerZakenData } from './useBurgerZakenData.hook.tsx';

export function useBurgerZakenDetailData() {
  const { documents, isLoading, isError, breadcrumbs } = useBurgerZakenData();
  const { id } = useParams<{ id: string }>();
  const document = documents.find((item) => item.id === id) ?? null;

  return {
    document,
    isLoading,
    isError,
    breadcrumbs,
    routeConfig,
  };
}
