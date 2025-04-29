import { useParams } from 'react-router';

import type { ErfpachtDossiersDetail } from '../../../../../server/services/erfpacht/erfpacht-types';
import { isError, isLoading } from '../../../../../universal/helpers/api';
import { BFFApiUrls } from '../../../../config/api';
import { useAppStateBagApi } from '../../../../hooks/useAppState';
import { getTableConfig, themaId } from '../Erfpacht-thema-config';
import { useErfpachtThemaData } from '../useErfpachtThemaData.hook';

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
  } = useErfpachtThemaData();

  const EVER_CHANING_FALLBACK_KEY = `erfpacht-dossier-${new Date().getTime()}`;

  const [dossierApiResponse] = useAppStateBagApi<ErfpachtDossiersDetail>({
    url: `${BFFApiUrls.ERFPACHT_DOSSIER_DETAILS}/${dossierNummerUrlParam}`,
    bagThema: `${themaId}_BAG`,
    key: dossierNummerUrlParam ?? EVER_CHANING_FALLBACK_KEY,
  });
  const dossier = dossierApiResponse.content;
  const tableConfig = dossier
    ? getTableConfig({ erfpachtData, dossier })
    : null;

  return {
    title: dossier?.title ?? 'Erfpachtdossier',
    dossier,
    isLoading: isLoading(dossierApiResponse),
    isError: isError(dossierApiResponse),
    isLoadingThemaData,
    isErrorThemaData,
    relatieCode,
    displayPropsDossierFacturen:
      tableConfig?.[listPageParamKind.alleFacturen]?.displayProps ?? {},
    breadcrumbs,
    routeConfig,
  };
}
