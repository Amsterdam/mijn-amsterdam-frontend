import { Heading } from '@amsterdam/design-system-react';
import { useParams } from 'react-router-dom';

import { useErfpachtV2Data } from './erfpachtData.hook';
import { ErfpachtV2DossiersDetail } from '../../../server/services/simple-connect/erfpacht';
import { AppRoutes } from '../../../universal/config/routes';
import { isError, isLoading } from '../../../universal/helpers/api';
import { ListPagePaginated } from '../../components/ListPagePaginated/ListPagePaginated';
import { PageContentCell } from '../../components/Page/Page';
import { BFFApiUrls } from '../../config/api';
import { BagThemas } from '../../config/thema';
import { useAppStateBagApi } from '../../hooks/useAppState';

export function ErfpachtFacturen() {
  const { displayPropsAlleFacturen } = useErfpachtV2Data();

  const { dossierNummerUrlParam } = useParams<{
    dossierNummerUrlParam: string;
  }>();

  const [dossierApiResponse, api] = useAppStateBagApi<ErfpachtV2DossiersDetail>(
    {
      url: `${BFFApiUrls.ERFPACHTv2_DOSSIER_DETAILS}/${dossierNummerUrlParam}`,
      bagThema: BagThemas.ERFPACHTv2,
      key: dossierNummerUrlParam,
    }
  );

  const dossier = dossierApiResponse.content;

  return (
    <ListPagePaginated
      pageContentTop={
        !!dossier && (
          <PageContentCell>
            <Heading level={3} size="level-2">
              {dossier.voorkeursadres}
            </Heading>
          </PageContentCell>
        )
      }
      items={dossier?.facturen?.facturen ?? []}
      title={`Alle ${
        dossier?.facturen.titelFacturen?.toLocaleLowerCase() ?? 'facturen'
      }`}
      errorText="We kunnen op dit moment geen facturen tonen."
      noItemsText="U heeft geen facturen."
      appRoute={AppRoutes['ERFPACHTv2/ALLE_FACTUREN']}
      appRouteParams={{ dossierNummerUrlParam }}
      appRouteBack={AppRoutes.ERFPACHTv2}
      displayProps={displayPropsAlleFacturen}
      isLoading={isLoading(dossierApiResponse)}
      isError={isError(dossierApiResponse)}
    />
  );
}
