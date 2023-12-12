import {
  Alert,
  Heading,
  Grid,
  Screen,
  Link,
  UnorderedList,
  Paragraph,
} from '@amsterdam/design-system-react';
import { AppRoutes, ChapterTitles } from '../../../universal/config';
import { isError, isLoading } from '../../../universal/helpers';
import {
  ChapterIcon,
  LoadingContent,
  OverviewPage,
  PageHeading,
} from '../../components';
import { useAppStateGetter } from '../../hooks';
import { TableV2 } from '../../components/Table/TableV2';
import { MaParagraph } from '../../components/Paragraph/Paragraph';
import { MAX_TABLE_ROWS_ON_THEMA_PAGINA } from '../../config/app';
import { LinkToListPage } from '../../components/LinkToListPage/LinkToListPage';
import { addLinkElementToProperty } from '../../components/Table/Table';
import { DesignSystemStyleAdjust } from '../../components/DesignSystemStyleAdjust/DesignSystemStyleAdjust';
import styles from './Erfpacht.module.scss';

interface DisplayPropsDossiers {
  voorkeursadres: string;
  dossierNummer: string;
  zaaknummer?: string;
  wijzigingsAanvragen?: string;
}

interface DisplayPropsFacturen {
  dossierAdres: string;
  factuurNummer: string;
  formattedFactuurBedrag: string;
  status: string;
  vervalDatum: string;
}

export function useErfpachtV2Data() {
  const { ERFPACHTv2 } = useAppStateGetter();
  const dossiersBase = ERFPACHTv2.content?.dossiers;
  const dossiers_ = addLinkElementToProperty(
    dossiersBase?.dossiers ?? [],
    'voorkeursadres'
  );
  const dossiers = Array.from({ length: 20 }, () => dossiers_)
    .flat()
    .map((d, index) => {
      return Object.assign({}, d, {
        dossierNummer: `${index} - ${d.dossierNummer}`,
        id: d.id,
      });
    });
  const openFacturen_ = ERFPACHTv2.content?.openstaandeFacturen?.facturen ?? [];
  const openFacturen = Array.from({ length: 20 }, () => openFacturen_)
    .flat()
    .map((f, index) => {
      return Object.assign({}, f, {
        dossierAdres: `${index} - ${f.dossierAdres}`,
      });
    });

  let displayPropsDossiers: DisplayPropsDossiers | null = null;
  let titleDossiers = ERFPACHTv2.content?.titelDossiersKop;
  let displayPropsOpenFacturen: DisplayPropsFacturen | null = null;
  let titleOpenFacturen = ERFPACHTv2.content?.titelOpenFacturenKop;

  if (!!dossiersBase) {
    displayPropsDossiers = {
      voorkeursadres: dossiersBase.titelVoorkeursAdres,
      dossierNummer: dossiersBase.titelDossiernummer,
    };

    if (!!dossiers?.length && 'zaaknummer' in dossiers[0]) {
      displayPropsDossiers.zaaknummer = dossiersBase.titelZaakNummer;
    }
    if (!!dossiers?.length && 'wijzigingsAanvragen' in dossiers[0]) {
      displayPropsDossiers.wijzigingsAanvragen =
        dossiersBase.titelWijzigingsAanvragen;
    }
  }

  if (openFacturen.length) {
    const [openFactuur] = openFacturen;
    displayPropsOpenFacturen = {
      dossierAdres: openFactuur.titelFacturenDossierAdres,
      factuurNummer: openFactuur.titelFacturenNummer,
      formattedFactuurBedrag: openFactuur.titelFacturenFactuurBedrag,
      status: openFactuur.titelFacturenStatus,
      vervalDatum: openFactuur.titelFacturenVervaldatum,
    };
  }

  return {
    ERFPACHTv2,
    openFacturen,
    dossiers,
    displayPropsDossiers,
    displayPropsOpenFacturen,
    titleDossiers,
    titleOpenFacturen,
  };
}

export default function Erfpacht() {
  const {
    ERFPACHTv2,
    openFacturen,
    dossiers,
    displayPropsDossiers,
    displayPropsOpenFacturen,
    titleDossiers,
    titleOpenFacturen,
  } = useErfpachtV2Data();

  return (
    <OverviewPage>
      <PageHeading
        backLink={{
          to: AppRoutes.HOME,
          title: 'Home',
        }}
        icon={<ChapterIcon />}
      >
        {ChapterTitles.ERFPACHTv2}
      </PageHeading>
      <Screen>
        <DesignSystemStyleAdjust />
        <Grid>
          <Grid.Cell span={7} start={1}>
            <MaParagraph>
              Hieronder ziet u de gegevens van uw erfpachtrechten.
            </MaParagraph>
            <UnorderedList markers={false}>
              <UnorderedList.Item>
                <Link
                  variant="inList"
                  href="https://www.amsterdam.nl/wonen-leefomgeving/erfpacht/"
                >
                  Meer informatie over erfpacht in Amsterdam
                </Link>
              </UnorderedList.Item>
              <UnorderedList.Item>
                <Link
                  variant="inList"
                  href="https://formulieren.amsterdam.nl/TriplEforms/DirectRegelen/formulier/nl-NL/evAmsterdam/Erfpacht.aspx"
                >
                  Meer over wijzigen van uw erfpacht
                </Link>
              </UnorderedList.Item>
              <UnorderedList.Item>
                <Link
                  variant="inList"
                  href="https://www.amsterdam.nl/veelgevraagd/overstappen-naar-eeuwigdurende-erfpacht-f92c5#"
                >
                  Overstappen erfpachtrecht
                </Link>
              </UnorderedList.Item>
            </UnorderedList>
          </Grid.Cell>

          {isError(ERFPACHTv2) && (
            <Grid.Cell fullWidth>
              <Alert title="Foutmelding" icon severity="error">
                <Paragraph>
                  We kunnen op dit moment geen erfpachtrechten tonen.
                </Paragraph>
              </Alert>
            </Grid.Cell>
          )}

          {isLoading(ERFPACHTv2) && (
            <Grid.Cell fullWidth>
              <LoadingContent
                barConfig={[
                  ['20rem', '4rem', '4rem'],
                  ['40rem', '2rem', '4rem'],
                  ['40rem', '2rem', '8rem'],
                  ['30rem', '4rem', '4rem'],
                  ['40rem', '2rem', '4rem'],
                  ['40rem', '2rem', '4rem'],
                ]}
              />
            </Grid.Cell>
          )}

          {!isLoading(ERFPACHTv2) && (
            <Grid.Cell fullWidth>
              <Heading level={3} size="level-2">
                {titleDossiers ?? 'Erfpachtrechten'}
              </Heading>

              {!!dossiers.length ? (
                <TableV2
                  className={styles.DossiersTable}
                  titleKey="voorkeursadres"
                  items={dossiers.slice(0, MAX_TABLE_ROWS_ON_THEMA_PAGINA)}
                  displayProps={displayPropsDossiers ?? {}}
                  gridColStyles={[
                    styles.DossiersTable_col1,
                    styles.DossiersTable_col2,
                    styles.DossiersTable_col3,
                    styles.DossiersTable_col4,
                  ]}
                />
              ) : (
                <MaParagraph>
                  U heeft geen{' '}
                  {titleDossiers?.toLowerCase() ?? 'erfpachtrechten'}.
                </MaParagraph>
              )}

              {dossiers.length > MAX_TABLE_ROWS_ON_THEMA_PAGINA && (
                <MaParagraph textAlign="right">
                  <LinkToListPage
                    count={dossiers.length}
                    route={AppRoutes['ERFPACHTv2/DOSSIERS']}
                  />
                </MaParagraph>
              )}
              <Heading level={3} size="level-2">
                {titleOpenFacturen ?? 'Open facturen'}
              </Heading>
              {!!openFacturen.length ? (
                <TableV2
                  titleKey="dossieradres"
                  items={openFacturen.slice(0, MAX_TABLE_ROWS_ON_THEMA_PAGINA)}
                  displayProps={displayPropsOpenFacturen ?? {}}
                  gridColStyles={[
                    styles.FacturenTable_col1,
                    styles.FacturenTable_col2,
                    styles.FacturenTable_col3,
                    styles.FacturenTable_col4,
                    styles.FacturenTable_col5,
                  ]}
                />
              ) : (
                <MaParagraph>
                  U heeft geen{' '}
                  {titleOpenFacturen?.toLowerCase() ?? 'open facturen'}.
                </MaParagraph>
              )}
              <MaParagraph textAlign="right">
                <LinkToListPage
                  count={openFacturen.length}
                  route={AppRoutes['ERFPACHTv2/OPEN_FACTUREN']}
                />
              </MaParagraph>
            </Grid.Cell>
          )}
        </Grid>
      </Screen>
    </OverviewPage>
  );
}
