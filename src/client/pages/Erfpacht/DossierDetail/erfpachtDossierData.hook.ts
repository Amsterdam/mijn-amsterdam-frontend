import { useParams } from 'react-router-dom';

import { ErfpachtV2DossiersDetail } from '../../../../server/services/simple-connect/erfpacht';
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
  } = useErfpachtV2Data();

  const [dossierApiResponse] = useAppStateBagApi<ErfpachtV2DossiersDetail>({
    url: `${BFFApiUrls.ERFPACHTv2_DOSSIER_DETAILS}/${dossierNummerUrlParam}`,
    bagThema: BagThemas.ERFPACHTv2,
    key: dossierNummerUrlParam,
  });
  const dossier = dossierApiResponse.content;
  const tableConfig = dossier
    ? getTableConfig({ erfpachtData, dossier })
    : null;

  return {
    dossier,
    isLoading: isLoading(dossierApiResponse),
    isError: isError(dossierApiResponse),
    backLink: routes.themaPage,
    isLoadingThemaData,
    isErrorThemaData,
    routes,
    relatieCode,
    displayPropsDossierFacturen:
      tableConfig?.[listPageParamKind.alleFacturen]?.displayProps ?? {},
  };
}
