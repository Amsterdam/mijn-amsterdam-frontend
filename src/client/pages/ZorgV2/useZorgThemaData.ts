import { WMOVoorzieningFrontend } from '../../../server/services/wmo-v2/wmo-config-and-types';
import {
  hasFailedDependency,
  isError,
  isLoading,
} from '../../../universal/helpers/api';
import { addLinkElementToProperty } from '../../components/Table/TableV2';
import { ThemaTitles } from '../../config/thema';
import { useAppStateGetter } from '../../hooks/useAppState';

import {
  listPageParamKind,
  listPageTitle,
  routes,
  tableConfig,
} from './Zorg-thema-config';

export function useZorgThemaData() {
  const { WMO } = useAppStateGetter();

  const regelingen = addLinkElementToProperty<WMOVoorzieningFrontend>(
    WMO.content ?? [],
    'title',
    true
  );

  const title = ThemaTitles.ZORG;

  return {
    regelingen,
    title,
    isLoading: isLoading(WMO),
    isError: isError(WMO),
    routes,
    tableConfig,
    listPageTitle,
    listPageParamKind,
  };
}
