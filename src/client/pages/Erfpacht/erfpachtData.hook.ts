import {
  getTableConfig,
  linkListItems,
  listPageParamKind,
  routes,
} from './Erfpacht-thema-config';
import { ErfpachtDossiersResponse } from '../../../server/services/erfpacht/erfpacht';
import { Themas } from '../../../universal/config/thema';
import { isError, isLoading } from '../../../universal/helpers/api';
import { addLinkElementToProperty } from '../../components/Table/TableV2';
import { ThemaTitles } from '../../config/thema';
import { useAppStateGetter } from '../../hooks/useAppState';
import { useThemaBreadcrumbs } from '../../hooks/useThemaMenuItems';

export function useErfpachtThemaData() {
  const { ERFPACHT } = useAppStateGetter();
  const erfpachtData = ERFPACHT.content as ErfpachtDossiersResponse | null;

  // Dossiers
  const dossiersBase = erfpachtData?.dossiers ?? null;

  const dossiers = addLinkElementToProperty(
    dossiersBase?.dossiers ?? [],
    'voorkeursadres'
  );

  const breadcrumbs = useThemaBreadcrumbs(Themas.ERFPACHT);

  // Facturen
  const openFacturenBase = erfpachtData?.openstaandeFacturen ?? null;
  const openFacturen = openFacturenBase?.facturen ?? [];
  const tableConfig = getTableConfig({ erfpachtData });

  return {
    title: ThemaTitles.ERFPACHT,
    erfpachtData,
    relatieCode: erfpachtData?.relatieCode,
    openFacturen,
    dossiers,
    isLoading: isLoading(ERFPACHT),
    isError: isError(ERFPACHT),
    linkListItems,
    tableConfig,
    listPageParamKind,
    routes,
    breadcrumbs,
  };
}
