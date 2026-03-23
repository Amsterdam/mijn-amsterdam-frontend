import { tableConfig, themaConfig } from './Horeca-thema-config.ts';
import type { HorecaVergunningFrontend } from '../../../../server/services/horeca/decos-zaken.ts';
import { isError, isLoading } from '../../../../universal/helpers/api.ts';
import { addLinkElementToProperty } from '../../../components/Table/TableV2.tsx';
import { useAppStateGetter } from '../../../hooks/useAppStateStore.ts';
import { useThemaBreadcrumbs } from '../../../hooks/useThemaMenuItems.ts';

export function useHorecaThemaData() {
  const { HORECA } = useAppStateGetter();
  const breadcrumbs = useThemaBreadcrumbs(themaConfig.id);
  const vergunningen = addLinkElementToProperty<HorecaVergunningFrontend>(
    HORECA.content ?? [],
    'identifier',
    true
  );

  return {
    vergunningen,
    isLoading: isLoading(HORECA),
    isError: isError(HORECA),
    tableConfig,
    themaId: themaConfig.id,
    themaTitle: themaConfig.title,
    breadcrumbs,
    listPageRoute: themaConfig.listPage.route.path,
    themaConfig,
  };
}
