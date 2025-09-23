import { useParams } from 'react-router';

import { routeConfig, themaId } from './Inkomen-thema-config';
import { isError, isLoading } from '../../../../universal/helpers/api';
import { useAppStateGetter } from '../../../hooks/useAppStateRemote';
import { useThemaBreadcrumbs } from '../../../hooks/useThemaMenuItems';

export function useInkomenDetailData(
  stateKey: 'WPI_TOZO' | 'WPI_BBZ' | 'WPI_AANVRAGEN' | 'WPI_TONK'
) {
  const appState = useAppStateGetter();
  const STATE = appState[stateKey];
  const zaken = Array.isArray(STATE.content) ? STATE.content : [];
  const breadcrumbs = useThemaBreadcrumbs(themaId);
  const { id } = useParams<{ id: string }>();
  const zaak = zaken.find((item) => item.id === id);

  return {
    themaId,
    zaak,
    zaken,
    isLoading: isLoading(STATE),
    isError: isError(STATE),
    breadcrumbs,
    routeConfig,
  };
}
