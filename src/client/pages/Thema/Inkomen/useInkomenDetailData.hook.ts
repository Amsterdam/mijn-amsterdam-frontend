import { useParams } from 'react-router';

import { routeConfig, themaConfig } from './Inkomen-thema-config'; // TO DO YACINE > deze uit de useInkomenThemaData.hookhalen
import { isError, isLoading } from '../../../../universal/helpers/api';
import { useAppStateGetter } from '../../../hooks/useAppStateStore';
import { useThemaBreadcrumbs } from '../../../hooks/useThemaMenuItems';

export function useInkomenDetailData(
  stateKey: 'WPI_TOZO' | 'WPI_BBZ' | 'WPI_AANVRAGEN' | 'WPI_TONK'
) {
  const appState = useAppStateGetter();
  const STATE = appState[stateKey];
  const zaken = Array.isArray(STATE.content) ? STATE.content : [];
  const breadcrumbs = useThemaBreadcrumbs(themaConfig.id);
  const { id } = useParams<{ id: string }>();
  const zaak = zaken.find((item) => item.id === id);

  return {
    themaid: themaConfig.id,
    zaak,
    zaken,
    isLoading: isLoading(STATE),
    isError: isError(STATE),
    breadcrumbs,
    routeConfig,
    themaConfig,
  };
}
