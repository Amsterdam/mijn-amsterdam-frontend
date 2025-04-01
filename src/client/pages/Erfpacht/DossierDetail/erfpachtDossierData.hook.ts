import { useParams } from 'react-router-dom';

import { ErfpachtV2DossiersDetail } from '../../../../server/services/erfpacht/erfpacht';
import { isError, isLoading } from '../../../../universal/helpers/api';
import { BFFApiUrls } from '../../../config/api';
import { BagThemas } from '../../../config/thema';
import { useAppStateBagApi } from '../../../hooks/useAppState';
import { getTableConfig } from '../Erfpacht-thema-config';
import { useErfpachtV2Data } from '../erfpachtData.hook';

export function useDossierDetaiLData() {
  const { dossierNummerUrlParam } = useParams<{
    dossierNummerUrlParam: string;
  }>();

  const {
    isLoading: isLoadingThemaData,
    isError: isErrorThemaData,
    routes,
    relatieCode,
    listPageParamKind,
    erfpachtData,
    breadcrumbs,
  } = useErfpachtV2Data();

  const [dossierApiResponse] = useAppStateBagApi<ErfpachtV2DossiersDetail>({
    url: `${BFFApiUrls.ERFPACHT_DOSSIER_DETAILS}/${dossierNummerUrlParam}`,
    bagThema: BagThemas.ERFPACHT,
    key: dossierNummerUrlParam,
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
    routes,
    relatieCode,
    displayPropsDossierFacturen:
      tableConfig?.[listPageParamKind.alleFacturen]?.displayProps ?? {},
    breadcrumbs,
  };
}
