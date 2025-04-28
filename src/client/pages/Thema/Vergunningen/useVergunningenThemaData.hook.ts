import isError from 'lodash.iserror';

import {
  linkListItems,
  routeConfig,
  tableConfig,
  themaId,
  themaTitle,
} from './Vergunningen-thema-config';
import { VergunningFrontend } from '../../../../server/services/vergunningen/config-and-types';
import { isLoading } from '../../../../universal/helpers/api';
import { addLinkElementToProperty } from '../../../components/Table/TableV2';
import { useAppStateGetter } from '../../../hooks/useAppState';
import { useThemaBreadcrumbs } from '../../../hooks/useThemaMenuItems';

export function useVergunningenThemaData() {
  const { VERGUNNINGEN } = useAppStateGetter();
  const vergunningen = addLinkElementToProperty<VergunningFrontend>(
    VERGUNNINGEN.content ?? [],
    'identifier',
    true
  );
  const breadcrumbs = useThemaBreadcrumbs(themaId);

  return {
    title: themaTitle,
    vergunningen,
    isLoading: isLoading(VERGUNNINGEN),
    isError: isError(VERGUNNINGEN),
    tableConfig,
    linkListItems,
    breadcrumbs,
    routeConfig,
  };
}
