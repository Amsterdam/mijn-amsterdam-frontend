import { routes, tableConfig } from './thema-config';
import { Themas } from '../../../universal/config/thema';
import { isError, isLoading } from '../../../universal/helpers/api';
import { addLinkElementToProperty } from '../../components/Table/TableV2';
import { ThemaTitles } from '../../config/thema';
import { useAppStateGetter } from '../../hooks/useAppState';
import { useThemaBreadcrumbs } from '../../hooks/useThemaMenuItems';
import { listPageParamKind, listPageTitle } from '../Zorg/Zorg-thema-config';

export function useJeugdThemaData() {
  const { JEUGD } = useAppStateGetter();

  const voorzieningen = addLinkElementToProperty(
    JEUGD.content ?? [],
    'title',
    true
  );

  const title = ThemaTitles.JEUGD;

  return {
    voorzieningen,
    title,
    breadcrumbs: useThemaBreadcrumbs(Themas.JEUGD),
    isLoading: isLoading(JEUGD),
    isError: isError(JEUGD),
    routes,
    tableConfig,
    listPageTitle,
    listPageParamKind,
  };
}
