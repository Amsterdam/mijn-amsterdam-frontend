import { useParams } from 'react-router';

import { routeConfig } from './AVG-thema-config';
import { useAVGData } from './useAVGData.hook';

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
