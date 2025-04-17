import { isError } from 'lodash';

import { tableConfig, LinkListItems, routes } from './Bezwaren-thema-config';
import { BezwaarFrontend } from '../../../../server/services/bezwaren/types';
import { ThemaIDs } from '../../../../universal/config/thema';
import { isLoading } from '../../../../universal/helpers/api';
import { addLinkElementToProperty } from '../../../components/Table/TableV2';
import { ThemaTitles } from '../../../config/thema';
import { useAppStateGetter } from '../../../hooks/useAppState';
import { useThemaBreadcrumbs } from '../../../hooks/useThemaMenuItems';

export function useBezwarenThemaData() {
  const { BEZWAREN } = useAppStateGetter();

  const bezwaren = addLinkElementToProperty<BezwaarFrontend>(
    BEZWAREN.content ?? [],
    'identificatie',
    true
  );

  const breadcrumbs = useThemaBreadcrumbs(ThemaIDs.BEZWAREN);

  return {
    bezwaren,
    isLoading: isLoading(BEZWAREN),
    isError: isError(BEZWAREN),
    linkListItems: LinkListItems,
    routes,
    tableConfig,
    themaTitle: ThemaTitles.BEZWAREN,
    breadcrumbs,
  };
}
