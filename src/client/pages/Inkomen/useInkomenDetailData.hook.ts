import { useParams } from 'react-router-dom';

import { Themas } from '../../../universal/config/thema';
import { isError, isLoading } from '../../../universal/helpers/api';
import { useAppStateGetter } from '../../hooks/useAppState';
import { useThemaMenuItemByThemaID } from '../../hooks/useThemaMenuItems';

export function useInkomenDetailData(
  stateKey: 'WPI_TOZO' | 'WPI_BBZ' | 'WPI_AANVRAGEN' | 'WPI_TONK'
) {
  const appState = useAppStateGetter();
  const STATE = appState[stateKey];
  const zaken = Array.isArray(STATE.content) ? STATE.content : [];
  const themaLink = useThemaMenuItemByThemaID(Themas.INKOMEN);
  const { id } = useParams<{ id: string }>();
  const zaak = zaken.find((item) => item.id === id);

  return {
    zaak,
    zaken,
    isLoading: isLoading(STATE),
    isError: isError(STATE),
    themaPaginaBreadcrumb: themaLink,
  };
}
