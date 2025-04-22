import { isError } from 'lodash';

import {
  tableConfig,
  LinkListItems,
  routeConfig,
  themaId,
  themaTitle,
} from './Bezwaren-thema-config';
import { BezwaarFrontend } from '../../../../server/services/bezwaren/types';
import { isLoading } from '../../../../universal/helpers/api';
import { addLinkElementToProperty } from '../../../components/Table/TableV2';
import { useAppStateGetter } from '../../../hooks/useAppState';
import { useThemaBreadcrumbs } from '../../../hooks/useThemaMenuItems';

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
