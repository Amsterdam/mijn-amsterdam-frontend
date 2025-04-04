import { isError } from 'lodash';

import { tableConfig, LinkListItems, routes } from './Bezwaren-thema-config';
import { Bezwaar } from '../../../server/services/bezwaren/types';
import { Themas } from '../../../universal/config/thema';
import { isLoading } from '../../../universal/helpers/api';
import { addLinkElementToProperty } from '../../components/Table/TableV2';
import { ThemaTitles } from '../../config/thema';
import { useAppStateGetter } from '../../hooks/useAppState';
import { useThemaBreadcrumbs } from '../../hooks/useThemaMenuItems';

export function useBezwarenThemaData() {
  const { BEZWAREN } = useAppStateGetter();

  const bezwaren = addLinkElementToProperty<Bezwaar>(
    BEZWAREN.content ?? [],
    'identificatie',
    true
  );

  const breadcrumbs = useThemaBreadcrumbs(Themas.BEZWAREN);

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
