import {
  routeConfig,
  tableConfig,
  themaId,
  themaTitle,
} from './Jeugd-thema-config';
import { listPageParamKind, listPageTitle } from './Jeugd-thema-config';
import { isError, isLoading } from '../../../../universal/helpers/api';
import { addLinkElementToProperty } from '../../../components/Table/TableV2';
import { useAppStateGetter } from '../../../hooks/useAppStateStore';
import { useThemaBreadcrumbs } from '../../../hooks/useThemaMenuItems';

export function useJeugdThemaData() {
  const { JEUGD } = useAppStateGetter();

  const voorzieningen = addLinkElementToProperty(
    JEUGD.content ?? [],
    'title',
    true
  );

  return {
    voorzieningen,
    id: themaId,
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
