import {
  tableConfig,
  LinkListItems,
  routeConfig,
  themaId,
  themaTitle,
} from './Bezwaren-thema-config.ts';
import { BezwaarFrontend } from '../../../../server/services/bezwaren/types.ts';
import { isError, isLoading } from '../../../../universal/helpers/api.ts';
import { addLinkElementToProperty } from '../../../components/Table/TableV2.tsx';
import { useAppStateGetter } from '../../../hooks/useAppState.ts';
import { useThemaBreadcrumbs } from '../../../hooks/useThemaMenuItems.ts';

export function useBezwarenThemaData() {
  const { BEZWAREN } = useAppStateGetter();

  const bezwaren = addLinkElementToProperty<BezwaarFrontend>(
    BEZWAREN.content ?? [],
    'identificatie',
    true
  );

  const breadcrumbs = useThemaBreadcrumbs(themaId);

  return {
    bezwaren,
    isLoading: isLoading(BEZWAREN),
    isError: isError(BEZWAREN),
    linkListItems: LinkListItems,
    routeConfig,
    tableConfig,
    themaTitle: themaTitle,
    breadcrumbs,
  };
}
