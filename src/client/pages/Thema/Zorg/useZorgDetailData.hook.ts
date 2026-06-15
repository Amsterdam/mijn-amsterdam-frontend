import { useParams } from 'react-router';

import { useZorgThemaData } from './useZorgThemaData.ts';
import type { JzdVoorzieningFrontend } from '../../../../server/services/jzd/jzd-types.ts';

export function useZorgDetailData() {
  const {
    voorzieningen,
    isLoading,
    isError,
    breadcrumbs,
    themaId,
    themaConfig,
  } = useZorgThemaData();
  const { id } = useParams<{ id: JzdVoorzieningFrontend['id'] }>();
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
