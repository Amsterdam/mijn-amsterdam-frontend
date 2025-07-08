import {
  routeConfig,
  tableConfig,
  themaId,
  themaTitle,
} from './Jeugd-thema-config.ts';
import { listPageParamKind, listPageTitle } from './Jeugd-thema-config.ts';
import { isError, isLoading } from '../../../../universal/helpers/api.ts';
import { addLinkElementToProperty } from '../../../components/Table/TableV2.tsx';
import { useAppStateGetter } from '../../../hooks/useAppState.ts';
import { useThemaBreadcrumbs } from '../../../hooks/useThemaMenuItems.ts';

export function useJeugdThemaData() {
  const { JEUGD } = useAppStateGetter();

  const voorzieningen = addLinkElementToProperty(
    JEUGD.content ?? [],
    'title',
    true
  );

  return {
    voorzieningen,
    title: themaTitle,
    breadcrumbs: useThemaBreadcrumbs(themaId),
    isLoading: isLoading(JEUGD),
    isError: isError(JEUGD),
    tableConfig,
    listPageTitle,
    listPageParamKind,
    routeConfig,
  };
}
