import { useParams } from 'react-router';

import { useJeugdThemaData } from './useJeugdThemaData.ts';
import type { LeerlingenvervoerVoorzieningFrontend } from '../../../../../../server/services/jzd/jeugd/jeugd.ts';

export function useJeugdDetailData() {
  const {
    voorzieningen,
    isError,
    isLoading,
    breadcrumbs,
    themaId,
    themaConfig,
  } = useJeugdThemaData();
  const { id } = useParams<{
    id: LeerlingenvervoerVoorzieningFrontend['id'];
  }>();
  const voorziening = voorzieningen.find((item) => item.id === id);

  return {
    themaId,
    title: voorziening?.title ?? 'Voorziening',
    voorziening,
    breadcrumbs,
    isError,
    isLoading,
    detailPageConfig: themaConfig.detailPage,
  };
}
