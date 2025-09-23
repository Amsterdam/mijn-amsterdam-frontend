import { useParams } from 'react-router';

import type { ErfpachtDossiersDetail } from '../../../../../server/services/erfpacht/erfpacht-types';
import { BFFApiUrls } from '../../../../config/api';
import { useBffApi } from '../../../../hooks/api/useDataApi-v2';
import { getTableConfig } from '../Erfpacht-thema-config';
import { useErfpachtThemaData } from '../useErfpachtThemaData.hook';

export function useDossierData() {
  const { dossierNummerUrlParam } = useParams<{
    dossierNummerUrlParam: string;
  }>();

  const {
    isLoading: isLoadingThemaData,
    isError: isErrorThemaData,
    relatieCode,
    listPageParamKind,
    erfpachtData,
    breadcrumbs,
    routeConfig,
    id: themaId,
  } = useErfpachtThemaData();
  const url = dossierNummerUrlParam
    ? `${BFFApiUrls.ERFPACHT_DOSSIER_DETAILS}/${dossierNummerUrlParam}`
    : undefined;

  const { data, isLoading, isError } = useBffApi<ErfpachtDossiersDetail>(url);
  const dossier = data?.content ?? null;

  const tableConfig = dossier
    ? getTableConfig({ erfpachtData, dossier })
    : null;

  return {
    themaId,
    title: dossier?.title ?? 'Erfpachtdossier',
    dossier,
    isLoading,
    isError,
    isLoadingThemaData,
    isErrorThemaData,
    relatieCode,
    displayPropsDossierFacturen:
      tableConfig?.[listPageParamKind.alleFacturen]?.displayProps ?? {},
    breadcrumbs,
    routeConfig,
  };
}
