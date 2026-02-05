import { useParams } from 'react-router';

import { useAVGData } from './useAVGData.hook';

export function useAVGDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { avgVerzoeken, isLoading, isError, breadcrumbs, themaConfig } =
    useAVGData();
  const verzoek = avgVerzoeken.find((verzoek) => verzoek.id === id) ?? null;

  return {
    verzoek,
    id,
    title: themaConfig.detailPage.title,
    isLoading,
    isError,
    breadcrumbs,
    themaConfig,
  };
}
