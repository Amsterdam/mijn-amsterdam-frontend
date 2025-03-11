import { useParams } from 'react-router-dom';

import { WMOVoorzieningFrontend } from '../../../server/services/wmo/wmo-config-and-types';
import { Themas } from '../../../universal/config/thema';
import { isLoading, isError } from '../../../universal/helpers/api';
import { useAppStateGetter } from '../../hooks/useAppState';
import { useThemaMenuItemByThemaID } from '../../hooks/useThemaMenuItems';

export function useZorgDetailData() {
  const { WMO } = useAppStateGetter();
  const { id } = useParams<{ id: WMOVoorzieningFrontend['id'] }>();
  const voorziening = WMO.content?.find((item) => item.id === id);
  const themaPaginaBreadcrumb = useThemaMenuItemByThemaID(Themas.ZORG);

  return {
    title: voorziening?.title ?? 'Voorziening',
    voorziening,
    themaPaginaBreadcrumb,
    isError: isError(WMO),
    isLoading: isLoading(WMO),
  };
}
