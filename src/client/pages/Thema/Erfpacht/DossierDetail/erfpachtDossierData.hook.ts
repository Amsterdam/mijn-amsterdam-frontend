import { useEffect } from 'react';

import { useParams } from 'react-router';

import type { ErfpachtDossiersDetail } from '../../../../../server/services/erfpacht/erfpacht-types';
import { BFFApiUrls } from '../../../../config/api';
import { createGetApiHook } from '../../../../hooks/api/useDataApi-v2';
import { getTableConfig } from '../Erfpacht-thema-config';
import { useErfpachtThemaData } from '../useErfpachtThemaData.hook';

const useErfpachtDossierApi = createGetApiHook<ErfpachtDossiersDetail>();

export function useDossierDetaiLData() {
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

  const { data, isLoading, isError, isDirty, fetch } = useErfpachtDossierApi();
  const dossier = data?.content;
  const tableConfig = dossier
    ? getTableConfig({ erfpachtData, dossier })
    : null;

  useEffect(() => {
    if (!isDirty) {
      fetch(`${BFFApiUrls.ERFPACHT_DOSSIER_DETAILS}/${dossierNummerUrlParam}`);
    }
  }, [isDirty, fetch]);

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
