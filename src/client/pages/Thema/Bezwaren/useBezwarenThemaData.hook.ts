import {
  tableConfig,
  LinkListItems,
  routeConfig,
  themaConfig,
} from './Bezwaren-thema-config';
import { BezwaarFrontend } from '../../../../server/services/bezwaren/types';
import { isError, isLoading } from '../../../../universal/helpers/api';
import { addLinkElementToProperty } from '../../../components/Table/TableV2';
import { useAppStateGetter } from '../../../hooks/useAppStateStore';
import { useThemaBreadcrumbs } from '../../../hooks/useThemaMenuItems';

export function useBezwarenThemaData() {
  const { BEZWAREN } = useAppStateGetter();

  const bezwaren = addLinkElementToProperty<BezwaarFrontend>(
    BEZWAREN.content ?? [],
    'identificatie',
    true
  );

  const breadcrumbs = useThemaBreadcrumbs(themaConfig.id);

  return {
    bezwaren,
    isLoading: isLoading(BEZWAREN),
    isError: isError(BEZWAREN),
    linkListItems: LinkListItems,
    routeConfig,
    tableConfig,
    themaId: themaConfig.id,
    themaTitle: themaConfig.title,
    breadcrumbs,
    themaConfig,
  };
}
