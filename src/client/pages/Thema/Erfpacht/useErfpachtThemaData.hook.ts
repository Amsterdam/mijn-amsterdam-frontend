import {
  erfpachtFacturenTableConfig,
  getTableConfig,
  linkListItems,
  listPageParamKind,
  routeConfig,
  themaConfig,
} from './Erfpacht-thema-config';
import { ErfpachtDossiersResponse } from '../../../../server/services/erfpacht/erfpacht-types';
import { isError, isLoading } from '../../../../universal/helpers/api';
import { addLinkElementToProperty } from '../../../components/Table/TableV2';
import { useAppStateGetter } from '../../../hooks/useAppStateStore';
import { useThemaBreadcrumbs } from '../../../hooks/useThemaMenuItems';

export function useErfpachtThemaData() {
  const { ERFPACHT } = useAppStateGetter();
  const erfpachtData = ERFPACHT.content as ErfpachtDossiersResponse | null;
  // Dossiers
  const dossiersBase = erfpachtData?.dossiers ?? null;

  const dossiers = addLinkElementToProperty(
    dossiersBase?.dossiers ?? [],
    'voorkeursadres'
  );

  const breadcrumbs = useThemaBreadcrumbs(themaConfig.id);
  const tableConfig = getTableConfig(erfpachtData);

  return {
    id: themaConfig.id,
    title: themaConfig.title,
    erfpachtData,
    relatieCode: erfpachtData?.relatieCode,
    dossiers,
    isLoading: isLoading(ERFPACHT),
    isError: isError(ERFPACHT),
    linkListItems,
    tableConfig,
    listPageParamKind,
    breadcrumbs,
    routeConfig,
    erfpachtFacturenTableConfig,
  };
}
