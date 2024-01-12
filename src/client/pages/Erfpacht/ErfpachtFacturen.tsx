import { Heading } from '@amsterdam/design-system-react';
import { useParams } from 'react-router-dom';
import { ErfpachtV2DossiersDetail } from '../../../server/services/simple-connect/erfpacht';
import { BagChapters, Chapters } from '../../../universal/config/chapter';
import { AppRoutes } from '../../../universal/config/routes';
import { ListPagePaginated } from '../../components/ListPagePaginated/ListPagePaginated';
import { BFFApiUrls } from '../../config/api';
import { useAppStateBagApi } from '../../hooks/useAppState';
import { useErfpachtV2Data } from './erfpachtData.hook';

export default function ErfpachtFacturen() {
  const { displayPropsAlleFacturen, colStyles } = useErfpachtV2Data();

  const { dossierNummerUrlParam } = useParams<{
    dossierNummerUrlParam: string;
  }>();

  const [dossier, api] = useAppStateBagApi<ErfpachtV2DossiersDetail>({
    url: `${BFFApiUrls.ERFPACHTv2_DOSSIER_DETAILS}/${dossierNummerUrlParam}`,
    bagChapter: BagChapters.ERFPACHTv2,
    key: dossierNummerUrlParam,
  });

  return (
    <ListPagePaginated
      body={
        !!dossier && (
          <Heading level={3} size="level-2">
            {dossier.voorkeursadres}
          </Heading>
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
      appRouteBack={AppRoutes['ERFPACHTv2']}
      displayProps={displayPropsAlleFacturen}
      chapter={Chapters.ERFPACHTv2}
      titleKey="dossieradres"
      isLoading={api.isLoading}
      isError={api.isError}
      tableGridColStyles={colStyles.facturenTable}
    />
  );
}
