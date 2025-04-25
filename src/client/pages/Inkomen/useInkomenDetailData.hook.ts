import { useParams } from 'react-router';

import { themaId } from './Inkomen-thema-config';
import { isError, isLoading } from '../../../universal/helpers/api';
import { useAppStateGetter } from '../../hooks/useAppState';
import { useThemaBreadcrumbs } from '../../hooks/useThemaMenuItems';

export function useInkomenDetailData(
  stateKey: 'WPI_TOZO' | 'WPI_BBZ' | 'WPI_AANVRAGEN' | 'WPI_TONK'
) {
  const appState = useAppStateGetter();
  const STATE = appState[stateKey];
  const zaken = Array.isArray(STATE.content) ? STATE.content : [];
  const breadcrumbs = useThemaBreadcrumbs(themaId.INKOMEN);
  const { id } = useParams<{ id: string }>();
  const zaak = zaken.find((item) => item.id === id);

  return {
    zaak,
    zaken,
    isLoading: isLoading(STATE),
    isError: isError(STATE),
    breadcrumbs,
  };
}
