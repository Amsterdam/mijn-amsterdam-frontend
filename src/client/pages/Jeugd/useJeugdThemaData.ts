import { WMOVoorzieningFrontend } from '../../../server/services/wmo/wmo-config-and-types';
import { addLinkElementToProperty } from '../../components/Table/TableV2';
import { ThemaTitles } from '../../config/thema';
import { useAppStateGetter } from '../../hooks/useAppState';
import { tableConfig } from './thema-config';

export function useJeugdThemaData() {
  const { JEUGD } = useAppStateGetter();

  const voorzieningen = addLinkElementToProperty<WMOVoorzieningFrontend>(
    JEUGD.content.voorzieningen ?? [],
    'title',
    true
  );

  const title = ThemaTitles.JEUGD;

  return {
    regelingen: voorzieningen,
    title,
    isLoading: isLoading(JEUGD),
    isError: isError(JEUGD),
    routes,
    tableConfig,
    listPageTitle,
    listPageParamKind,
  };
}
