import { useParams } from 'react-router-dom';

import { ErfpachtV2DossiersDetail } from '../../../../server/services/simple-connect/erfpacht';
import { Themas } from '../../../../universal/config/thema';
import { isError, isLoading } from '../../../../universal/helpers/api';
import { BFFApiUrls } from '../../../config/api';
import { BagThemas } from '../../../config/thema';
import { useAppStateBagApi } from '../../../hooks/useAppState';
import { useThemaMenuItemByThemaID } from '../../../hooks/useThemaMenuItems';
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

  const themaLink = useThemaMenuItemByThemaID(Themas.ERFPACHTv2);

  return {
    dossier,
    isLoading: isLoading(dossierApiResponse),
    isError: isError(dossierApiResponse),
    isLoadingThemaData,
    isErrorThemaData,
    routes,
    relatieCode,
    displayPropsDossierFacturen:
      tableConfig?.[listPageParamKind.alleFacturen]?.displayProps ?? {},
    themaPaginaBreadcrumb: themaLink,
  };
}
