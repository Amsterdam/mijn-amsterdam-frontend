import { useEffect } from 'react';

import { useParams } from 'react-router';

import type { ErfpachtDossiersDetail } from '../../../../../server/services/erfpacht/erfpacht-types';
import { BFFApiUrls } from '../../../../config/api';
import {
  createGetApiHook,
  createItemStoreHook,
  useItemStoreWithFetch,
} from '../../../../hooks/api/useDataApi-v2';
import { getTableConfig } from '../Erfpacht-thema-config';
import { useErfpachtThemaData } from '../useErfpachtThemaData.hook';

const useErfpachtDossierApi = createGetApiHook<ErfpachtDossiersDetail>();
const useDossierByUrlParamStore = createItemStoreHook<ErfpachtDossiersDetail>(
  'dossierNummerUrlParam'
);

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

  const {
    item: dossier,
    isLoading,
    isError,
    fetch,
  } = useItemStoreWithFetch<ErfpachtDossiersDetail>(
    useErfpachtDossierApi,
    useDossierByUrlParamStore,
    'dossierNummerUrlParam',
    dossierNummerUrlParam
  );

  useEffect(() => {
    fetch(`${BFFApiUrls.ERFPACHT_DOSSIER_DETAILS}/${dossierNummerUrlParam}`);
  }, [fetch]);

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
