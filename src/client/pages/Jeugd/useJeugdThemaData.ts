import { routes, tableConfig } from './thema-config';
import { isError, isLoading } from '../../../universal/helpers/api';
import { addLinkElementToProperty } from '../../components/Table/TableV2';
import { ThemaTitles } from '../../config/thema';
import { useAppStateGetter } from '../../hooks/useAppState';
import { listPageParamKind, listPageTitle } from '../Zorg/Zorg-thema-config';

export function useJeugdThemaData() {
  const { JEUGD } = useAppStateGetter();

  const voorzieningen = addLinkElementToProperty(
    JEUGD.content?.voorzieningen ?? [],
    'title',
    true
  );

  const title = ThemaTitles.JEUGD;

  return {
    voorzieningen,
    title,
    isLoading: isLoading(JEUGD),
    isError: isError(JEUGD),
    routes,
    tableConfig,
    listPageTitle,
    listPageParamKind,
  };
}
