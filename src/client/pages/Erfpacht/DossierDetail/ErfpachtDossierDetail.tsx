import { Grid } from '@amsterdam/design-system-react';
import { useParams } from 'react-router-dom';

import { DataTableBijzondereBepalingen } from './DatalistBijzondereBepalingen';
import { DatalistGeneral } from './DatalistGeneral';
import { DatalistJuridisch } from './DatalistJuridisch';
import { DatalistsFinancieel } from './DatalistsFinancieel';
import type { ErfpachtV2DossiersDetail } from '../../../../server/services/simple-connect/erfpacht';
import { AppRoutes } from '../../../../universal/config/routes';
import { ErrorAlert, LoadingContent } from '../../../components';
import { CollapsiblePanel } from '../../../components/CollapsiblePanel/CollapsiblePanel';
import { BarConfig } from '../../../components/LoadingContent/LoadingContent';
import { BFFApiUrls } from '../../../config/api';
import { BagThemas, ThemaTitles } from '../../../config/thema';
import { useAppStateBagApi } from '../../../hooks/useAppState';
import { useErfpachtV2Data } from '../erfpachtData.hook';
import { DataTableFacturen } from './DataTableFacturen';
import styles from './ErfpachtDossierDetail.module.scss';
import { isError, isLoading } from '../../../../universal/helpers/api';
import { DetailPageV2, PageContentV2 } from '../../../components/Page/Page';
import { PageHeadingV2 } from '../../../components/PageHeading/PageHeadingV2';

const loadingContentBarConfig: BarConfig = [
  ['12rem', '2rem', '.5rem'],
  ['8rem', '2rem', '4rem'],
  ['5rem', '2rem', '.5rem'],
  ['16rem', '2rem', '4rem'],
  ['20rem', '2rem', '.5rem'],
  ['16rem', '2rem', '4rem'],
  ['20rem', '2rem', '.5rem'],
  ['16rem', '2rem', '4rem'],
  ['8rem', '2rem', '.5rem'],
  ['20rem', '2rem', '.5rem'],
  ['20rem', '2rem', '4rem'],
  ['14rem', '4rem', '4rem'],
  ['14rem', '4rem', '4rem'],
  ['14rem', '4rem', '4rem'],
  ['14rem', '4rem', '4rem'],
];

export default function ErfpachtDossierDetail() {
  const { dossierNummerUrlParam } = useParams<{
    dossierNummerUrlParam: string;
  }>();
  const { ERFPACHTv2 } = useErfpachtV2Data();
  const [dossierApiResponse] = useAppStateBagApi<ErfpachtV2DossiersDetail>({
    url: `${BFFApiUrls.ERFPACHTv2_DOSSIER_DETAILS}/${dossierNummerUrlParam}`,
    bagThema: BagThemas.ERFPACHTv2,
    key: dossierNummerUrlParam,
  });
  const dossier = dossierApiResponse.content;
  const noContent = !isLoading(dossierApiResponse) && !dossier;

  return (
    <DetailPageV2>
      <PageContentV2>
        <PageHeadingV2 backLink={AppRoutes.ERFPACHTv2}>
          {dossier?.title ?? `${ThemaTitles.ERFPACHTv2}dossier`}
        </PageHeadingV2>
        {isLoading(dossierApiResponse) && (
          <LoadingContent barConfig={loadingContentBarConfig} />
        )}
        {(isError(dossierApiResponse) || noContent) && (
          <Grid.Cell span="all">
            <ErrorAlert>
              We kunnen op dit moment geen erfpachtdossier tonen.
            </ErrorAlert>
          </Grid.Cell>
        )}

        {!!dossier && (
          <>
            <Grid.Cell span="all">
              <DatalistGeneral
                dossier={dossier}
                relatieCode={ERFPACHTv2.content?.relatieCode}
              />
            </Grid.Cell>

            <Grid.Cell span="all">
              <CollapsiblePanel title={dossier.titelKopJuridisch}>
                <DatalistJuridisch dossier={dossier} />
              </CollapsiblePanel>
            </Grid.Cell>

            <Grid.Cell span="all">
              <CollapsiblePanel title={dossier.titelKopBijzondereBepalingen}>
                <DataTableBijzondereBepalingen dossier={dossier} />
              </CollapsiblePanel>
            </Grid.Cell>

            <Grid.Cell span="all">
              <CollapsiblePanel title={dossier.titelKopFinancieel}>
                <DatalistsFinancieel dossier={dossier} />
              </CollapsiblePanel>
            </Grid.Cell>

            <Grid.Cell className={styles.Section} span="all">
              <CollapsiblePanel title="Facturen">
                <DataTableFacturen
                  dossier={dossier}
                  relatieCode={ERFPACHTv2.content?.relatieCode}
                />
              </CollapsiblePanel>
            </Grid.Cell>
          </>
        )}
      </PageContentV2>
    </DetailPageV2>
  );
}
