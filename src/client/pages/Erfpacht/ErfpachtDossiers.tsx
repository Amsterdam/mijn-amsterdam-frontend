import { listPageParamKind } from './Erfpacht-thema-config';
import { useErfpachtV2Data } from './erfpachtData.hook';
import { AppRoutes } from '../../../universal/config/routes';
import { isError, isLoading } from '../../../universal/helpers/api';
import { ListPagePaginated } from '../../components/ListPagePaginated/ListPagePaginated';

export function ErfpachtDossiers() {
  const { ERFPACHTv2, dossiers, tableConfig } = useErfpachtV2Data();

  const tableConfigDossiers = tableConfig?.[listPageParamKind.dossiers];
  const displayPropsDossiers = tableConfigDossiers?.displayProps ?? {};

  return (
    <ListPagePaginated
      items={dossiers}
      title={`Alle ${titleDossiers?.toLowerCase()}`}
      appRoute={AppRoutes['ERFPACHTv2/DOSSIERS']}
      appRouteBack={AppRoutes.ERFPACHTv2}
      displayProps={displayPropsDossiers}
      isLoading={isLoading(ERFPACHTv2)}
      isError={isError(ERFPACHTv2)}
    />
  );
}
