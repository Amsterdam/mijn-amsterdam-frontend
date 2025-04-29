import { useParams } from 'react-router';

import { useZorgThemaData } from './useZorgThemaData';
import { WMOVoorzieningFrontend } from '../../../../server/services/wmo/wmo-config-and-types';

export function useZorgDetailData() {
  const { voorzieningen, isLoading, isError, breadcrumbs, routeConfig } =
    useZorgThemaData();
  const { id } = useParams<{ id: WMOVoorzieningFrontend['id'] }>();
  const voorziening = voorzieningen.find((item) => item.id === id);

  return {
    title: voorziening?.title ?? 'Voorziening',
    voorziening,
    breadcrumbs,
    isError,
    isLoading,
    routeConfig,
  };
}
