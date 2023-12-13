import { Alert, Grid, Paragraph, Screen } from '@amsterdam/design-system-react';
import { useParams } from 'react-router-dom';
import type { ErfpachtV2DossiersDetail } from '../../../../server/services/simple-connect/erfpacht';
import {
  AppRoutes,
  BagChapters,
  ChapterTitles,
} from '../../../../universal/config';
import {
  ChapterIcon,
  DetailPage,
  LoadingContent,
  PageHeading,
} from '../../../components';
import { CollapsiblePanel } from '../../../components/CollapsiblePanel/CollapsiblePanel';
import { DesignSystemStyleAdjust } from '../../../components/DesignSystemStyleAdjust/DesignSystemStyleAdjust';
import { BarConfig } from '../../../components/LoadingContent/LoadingContent';
import { BFFApiUrls } from '../../../config/api';
import { useAppStateBagApi } from '../../../hooks/useAppState';
import styles from './ErfpachtDossierDetail.module.scss';
import { DataListGeneral } from './DataListGeneral';
import { DataListJuridisch } from './DataListJuridisch';
import { DataTableBijzondereBepalingen } from './DataListBijzondereBepalingen';
import { DataListsFinancieel } from './DataListsFinancieel';
import { DataTableFacturen } from './DataTableFacturen';

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
        <DesignSystemStyleAdjust />
        <Grid className={styles.Grid}>
          {api.isLoading && (
            <LoadingContent barConfig={loadingContentBarConfig} />
          )}
          {(api.isError || noContent) && (
            <Grid.Cell fullWidth>
              <Alert title="Foutmelding" icon severity="error">
                <Paragraph>
                  We kunnen op dit moment geen erfpacht dossiers tonen.
                </Paragraph>
              </Alert>
            </Grid.Cell>
          )}

          {!!dossier && (
            <>
              <Grid.Cell fullWidth>
                <DataListGeneral dossier={dossier} />
              </Grid.Cell>

              <Grid.Cell fullWidth>
                <CollapsiblePanel title={dossier.titelKopJuridisch}>
                  <DataListJuridisch dossier={dossier} />
                </CollapsiblePanel>
              </Grid.Cell>

              <Grid.Cell fullWidth>
                <CollapsiblePanel title={dossier.titelKopBijzondereBepalingen}>
                  <DataTableBijzondereBepalingen dossier={dossier} />
                </CollapsiblePanel>
              </Grid.Cell>

              <Grid.Cell fullWidth>
                <CollapsiblePanel title={dossier.titelKopFinancieel}>
                  <DataListsFinancieel dossier={dossier} />
                </CollapsiblePanel>
              </Grid.Cell>

              <Grid.Cell className={styles.Section} fullWidth>
                <CollapsiblePanel title="Facturen">
                  <DataTableFacturen dossier={dossier} />
                </CollapsiblePanel>
              </Grid.Cell>
            </>
          )}
        </Grid>
      </Screen>
    </DetailPage>
  );
}
