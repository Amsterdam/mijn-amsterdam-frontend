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
import { ChapterIcon, OverviewPage, PageHeading } from '../../components';
import { useAppStateGetter } from '../../hooks';
import { TableV2 } from '../../components/Table/TableV2';
import { MaParagraph } from '../../components/Paragraph/Paragraph';
import { MAX_TABLE_ROWS_ON_THEMA_PAGINA } from '../../config/app';
import { LinkToListPage } from '../../components/LinkToListPage/LinkToListPage';
import { addLinkElementToProperty } from '../../components/Table/Table';

export function useErfpachtV2Data() {
  const { ERFPACHTv2 } = useAppStateGetter();
  const dossiers_ = addLinkElementToProperty(
    ERFPACHTv2.content?.dossiers ?? [],
    'voorkeursadres'
  );
  const dossiers = Array.from({ length: 20 }, () => dossiers_)
    .flat()
    .map((d, index) => {
      return Object.assign({}, d, {
        dossierNummer: `${index} - ${d.dossierNummer}`,
      });
    });
  const openFacturen_ = ERFPACHTv2.content?.openFacturen ?? [];
  const openFacturen = Array.from({ length: 20 }, () => openFacturen_)
    .flat()
    .map((f, index) => {
      return Object.assign({}, f, {
        dossierAdres: `${index} - ${f.dossierAdres}`,
      });
    });

  let displayPropsDossiers = {};
  let titleDossiers = ERFPACHTv2.content?.titelDossiersKop;
  let displayPropsOpenFacturen = {};
  let titleOpenFacturen = ERFPACHTv2.content?.titelOpenFacturenKop;

  if (dossiers.length) {
    const [dossier] = dossiers;
    displayPropsDossiers = {
      voorkeursadres: dossier.titelVoorkeursadres,
      dossierNummer: dossier.titelDossierNummer,
      zaaknummer: dossier.titelZaaknummer,
      wijzigingsAanvragen: dossier.titelWijzigingsAanvragen,
    };
  }
  if (openFacturen.length) {
    const [openFactuur] = openFacturen;
    displayPropsOpenFacturen = {
      dossierAdres: openFactuur.titelFacturenDossierAdres,
      notaNummer: openFactuur.titelFacturenNotaNummer,
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
        isLoading={isLoading(ERFPACHTv2)}
        icon={<ChapterIcon />}
      >
        {ChapterTitles.ERFPACHTv2}
      </PageHeading>
      <Screen>
        <style>
          {/* {`
          :root {
            --mams-font-size: initial;
            --mams-line-height: initial;
          }
          `} */}
        </style>
        <Grid>
          <Grid.Cell span={7} start={1}>
            <MaParagraph>
              Hieronder ziet u de gegevens van uw erfpachtrechten.
            </MaParagraph>
            <Heading level={4} size="level-4">
              Factuur naar nieuw adres
            </Heading>
            <MaParagraph>
              Wilt u uw facturen voor erfpacht en canon op een nieuw adres
              ontvangen? Stuur een e-mail naar
              erfpachtadministratie@amsterdam.nl. Zet in het onderwerp
              'Adreswijziging'. Vermeld in de mail uw debiteurennummer of het
              E-dossiernummer en uw nieuwe adresgegevens. U jgt binnen 3
              werkdagen een reactie.
            </MaParagraph>
            <Heading level={4} size="level-4">
              Factuur via e-mail
            </Heading>
            <MaParagraph>
              U kunt uw facturen ook per e-mail krijgen. Mail hiervoor uw
              e-mailadres en debiteurennummer naar
              debiteurenadministratie@amsterdam.nl. Meer informatie over
              erfpacht in Amsterdam Meer over wijzigen van uw erfpacht
              Overstappen erfpachtrecht
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
                  We kunnen op dit moment geen erfpacht dossiers tonen.
                </Paragraph>
              </Alert>
            </Grid.Cell>
          )}

          <Grid.Cell fullWidth>
            <Heading level={3} size="level-2">
              {titleDossiers}
            </Heading>

            {!!dossiers.length ? (
              <TableV2
                titleKey="voorkeursadres"
                items={dossiers.slice(0, MAX_TABLE_ROWS_ON_THEMA_PAGINA)}
                displayProps={displayPropsDossiers}
              />
            ) : (
              <MaParagraph>
                U heeft geen {titleDossiers?.toLowerCase()}
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
              {titleOpenFacturen}
            </Heading>
            {!!openFacturen.length ? (
              <TableV2
                titleKey="dossieradres"
                items={openFacturen.slice(0, MAX_TABLE_ROWS_ON_THEMA_PAGINA)}
                displayProps={displayPropsOpenFacturen}
              />
            ) : (
              <MaParagraph>
                U heeft geen {titleOpenFacturen?.toLowerCase()}
              </MaParagraph>
            )}
            <MaParagraph textAlign="right">
              <LinkToListPage
                count={openFacturen.length}
                route={AppRoutes['ERFPACHTv2/FACTUREN']}
              />
            </MaParagraph>
          </Grid.Cell>
        </Grid>
      </Screen>
    </OverviewPage>
  );
}
