import { Grid, Screen } from '@amsterdam/design-system-react';
import { useParams } from 'react-router-dom';
import type { ErfpachtV2DossiersDetail } from '../../../../server/services/simple-connect/erfpacht';
import {
  AppRoutes,
  BagChapters,
  ChapterTitles,
} from '../../../../universal/config';
import {
  ErrorAlert,
  ChapterIcon,
  DetailPage,
  LoadingContent,
  PageHeading,
} from '../../../components';
import { CollapsiblePanel } from '../../../components/CollapsiblePanel/CollapsiblePanel';
import { BarConfig } from '../../../components/LoadingContent/LoadingContent';
import { BFFApiUrls } from '../../../config/api';
import { useAppStateBagApi } from '../../../hooks/useAppState';
import { useErfpachtV2Data } from '../erfpachtData.hook';
import { DataTableFacturen } from './DataTableFacturen';
import { DataTableBijzondereBepalingen } from './DatalistBijzondereBepalingen';
import { DatalistGeneral } from './DatalistGeneral';
import { DatalistJuridisch } from './DatalistJuridisch';
import { DatalistsFinancieel } from './DatalistsFinancieel';
import styles from './ErfpachtDossierDetail.module.scss';

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
  const [dossier, api] = useAppStateBagApi<ErfpachtV2DossiersDetail>({
    url: `${BFFApiUrls.ERFPACHTv2_DOSSIER_DETAILS}/${dossierNummerUrlParam}`,
    bagChapter: BagChapters.ERFPACHTv2,
    key: dossierNummerUrlParam,
  });
  const noContent = !api.isLoading && !dossier;

  return (
    <DetailPage className={styles.ErfpachtDetail}>
      <PageHeading
        backLink={{
          to: AppRoutes.ERFPACHTv2,
          title: ChapterTitles.ERFPACHTv2,
        }}
        icon={<ChapterIcon />}
      >
        {dossier?.title ?? `${ChapterTitles.ERFPACHTv2}dossier`}
      </PageHeading>
      <Screen>
        <Grid className={styles.Grid}>
          {api.isLoading && (
            <LoadingContent barConfig={loadingContentBarConfig} />
          )}
          {(api.isError || noContent) && (
            <Grid.Cell span="all">
              <ErrorAlert>
                We kunnen op dit moment geen erfpacht dossier tonen.
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
        </Grid>
      </Screen>
    </DetailPage>
  );
}
