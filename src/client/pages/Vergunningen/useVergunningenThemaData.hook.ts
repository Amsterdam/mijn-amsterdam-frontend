import { isError } from 'lodash';

import {
  linkListItems,
  routes,
  tableConfig,
} from './Vergunningen-thema-config';
import {
  DecosVergunning,
  VergunningFrontend,
} from '../../../server/services/vergunningen/config-and-types';
import { ThemaIDs } from '../../../universal/config/thema';
import { isLoading } from '../../../universal/helpers/api';
import { addLinkElementToProperty } from '../../components/Table/TableV2';
import { ThemaTitles } from '../../config/thema';
import { useAppStateGetter } from '../../hooks/useAppState';
import { useThemaBreadcrumbs } from '../../hooks/useThemaMenuItems';

export function useVergunningenThemaData() {
  const { VERGUNNINGEN } = useAppStateGetter();
  const vergunningen = addLinkElementToProperty<
    VergunningFrontend<DecosVergunning>
  >(VERGUNNINGEN.content ?? [], 'identifier', true);
  const breadcrumbs = useThemaBreadcrumbs(ThemaIDs.VERGUNNINGEN);

  return {
    title: ThemaTitles.VERGUNNINGEN,
    vergunningen,
    isLoading: isLoading(VERGUNNINGEN),
    isError: isError(VERGUNNINGEN),
    tableConfig,
    linkListItems,
    routes,
    breadcrumbs,
  };
}
