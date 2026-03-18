import {
  erfpachtFacturenTableConfig,
  getTableConfig,
  listPageParamKind,
  themaConfig,
} from './Erfpacht-thema-config.ts';
import type { ErfpachtDossiersResponse } from '../../../../server/services/erfpacht/erfpacht-types.ts';
import { isError, isLoading } from '../../../../universal/helpers/api.ts';
import { addLinkElementToProperty } from '../../../components/Table/TableV2.tsx';
import { useAppStateGetter } from '../../../hooks/useAppStateStore.ts';
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

  const breadcrumbs = useThemaBreadcrumbs(themaConfig.id);
  const tableConfig = getTableConfig(erfpachtData);

  return {
    themaId: themaConfig.id,
    title: themaConfig.title,
    erfpachtData,
    relatieCode: erfpachtData?.relatieCode,
    dossiers,
    isLoading: isLoading(ERFPACHT),
    isError: isError(ERFPACHT),
    pageLinks: themaConfig.pageLinks,
    tableConfig,
    listPageParamKind,
    breadcrumbs,
    erfpachtFacturenTableConfig,
    themaConfig,
  };
}
