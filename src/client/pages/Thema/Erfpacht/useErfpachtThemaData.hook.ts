import {
  getTableConfig,
  linkListItems,
  listPageParamKind,
  routeConfig,
  themaId,
  themaTitle,
} from './Erfpacht-thema-config.ts';
import { ErfpachtDossiersResponse } from '../../../../server/services/erfpacht/erfpacht-types.ts';
import { isError, isLoading } from '../../../../universal/helpers/api.ts';
import { addLinkElementToProperty } from '../../../components/Table/TableV2.tsx';
import { useAppStateGetter } from '../../../hooks/useAppState.ts';
import { useThemaBreadcrumbs } from '../../../hooks/useThemaMenuItems.ts';

export function useErfpachtThemaData() {
  const { ERFPACHT } = useAppStateGetter();
  const erfpachtData = ERFPACHT.content as ErfpachtDossiersResponse | null;

  // Dossiers
  const dossiersBase = erfpachtData?.dossiers ?? null;

  const dossiers = addLinkElementToProperty(
    dossiersBase?.dossiers ?? [],
    'voorkeursadres'
  );

  const breadcrumbs = useThemaBreadcrumbs(themaId);

  // Facturen
  const openFacturenBase = erfpachtData?.openstaandeFacturen ?? null;
  const openFacturen = openFacturenBase?.facturen ?? [];
  const tableConfig = getTableConfig({ erfpachtData });

  return {
    title: themaTitle,
    erfpachtData,
    relatieCode: erfpachtData?.relatieCode,
    openFacturen,
    dossiers,
    isLoading: isLoading(ERFPACHT),
    isError: isError(ERFPACHT),
    linkListItems,
    tableConfig,
    listPageParamKind,
    breadcrumbs,
    routeConfig,
  };
}
