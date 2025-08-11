import {
  linkListItems,
  listPageParamKind,
  themaId,
  themaTitle,
} from './Erfpacht-thema-config';
import { VvEData } from '../../../../server/services/wonen/zwd-vve.types';
import { isError, isLoading } from '../../../../universal/helpers/api';
import { useAppStateGetter } from '../../../hooks/useAppState';
import { useThemaBreadcrumbs } from '../../../hooks/useThemaMenuItems';

export function useWonenThemaData() {
  const { WONEN } = useAppStateGetter();
  const wonenData = WONEN.content as VvEData | null;
  console.log('wonenData', wonenData);
  // Dossiers

  const breadcrumbs = useThemaBreadcrumbs(themaId);

  return {
    title: themaTitle,
    wonenData,
    isLoading: isLoading(WONEN),
    isError: isError(WONEN),
    linkListItems,
    // tableConfig,
    listPageParamKind,
    breadcrumbs,
  };
}
