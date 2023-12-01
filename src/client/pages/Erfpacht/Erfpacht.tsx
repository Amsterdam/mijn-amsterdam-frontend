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
  OverviewPage,
  PageContent,
  PageHeading,
  addTitleLinkComponent,
} from '../../components';
import { useAppStateGetter } from '../../hooks';
import styles from './Erfpacht.module.scss';
import { TableV2 } from '../../components/Table/TableV2';
import { MaParagraph } from '../../components/Paragraph/Paragraph';

export default function Erfpacht() {
  const { ERFPACHTv2 } = useAppStateGetter();
  const dossiers = addTitleLinkComponent(
    ERFPACHTv2.content?.dossiers ?? [],
    'voorkeursadres'
  );
  const openFacturen = ERFPACHTv2.content?.openFacturen ?? [];

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
          {`
          :root {
            --mams-font-size: initial;
            --mams-line-height: initial;
          }
          `}
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
          <Grid.Cell fullWidth>
            {isError(ERFPACHTv2) && (
              <Alert title="Foutmelding" icon severity="error">
                <Paragraph>
                  We kunnen op dit moment geen erfpacht dossiers tonen.
                </Paragraph>
              </Alert>
            )}
          </Grid.Cell>
          <Grid.Cell fullWidth>
            <Heading level={3} size="level-2">
              {titleDossiers}
            </Heading>
            <TableV2
              titleKey="voorkeursadres"
              items={dossiers}
              displayProps={displayPropsDossiers}
            />
            <Heading level={3} size="level-2">
              {titleOpenFacturen}
            </Heading>
            <TableV2
              titleKey="dossieradres"
              items={openFacturen}
              displayProps={displayPropsOpenFacturen}
            />
          </Grid.Cell>
        </Grid>
      </Screen>
    </OverviewPage>
  );
}
