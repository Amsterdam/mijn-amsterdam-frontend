import { useParams } from 'react-router';

import { routeConfig } from './AVG-thema-config.ts';
import { useAVGData } from './useAVGData.hook.tsx';

export function useAVGDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { avgVerzoeken, isLoading, isError, breadcrumbs } = useAVGData();
  const verzoek = avgVerzoeken.find((verzoek) => verzoek.id === id) ?? null;

  return {
    verzoek,
    title: 'AVG verzoek',
    isLoading,
    isError,
    breadcrumbs,
    routeConfig,
  };
}
