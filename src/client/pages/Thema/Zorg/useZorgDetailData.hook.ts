import { useParams } from 'react-router';

import { useZorgThemaData } from './useZorgThemaData';
import { WMOVoorzieningFrontend } from '../../../../server/services/wmo/wmo-types';

export function useZorgDetailData() {
  const {
    voorzieningen,
    isLoading,
    isError,
    breadcrumbs,
    themaId,
    themaConfig,
  } = useZorgThemaData();
  const { id } = useParams<{ id: WMOVoorzieningFrontend['id'] }>();
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
