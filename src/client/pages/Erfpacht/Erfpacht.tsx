import {
  Alert,
  Grid,
  Heading,
  Link,
  Paragraph,
  Screen,
  UnorderedList,
} from '@amsterdam/design-system-react';
import { AppRoutes, ChapterTitles } from '../../../universal/config';
import { isError, isLoading } from '../../../universal/helpers';
import {
  ChapterIcon,
  LoadingContent,
  OverviewPage,
  PageHeading,
} from '../../components';
import { LinkToListPage } from '../../components/LinkToListPage/LinkToListPage';
import { MaParagraph } from '../../components/Paragraph/Paragraph';
import { TableV2 } from '../../components/Table/TableV2';
import { MAX_TABLE_ROWS_ON_THEMA_PAGINA } from '../../config/app';
import styles from './Erfpacht.module.scss';
import { OpenFacturenListGrouped } from './ErfpachtOpenFacturen';
import { useErfpachtV2Data } from './erfpachtData.hook';

export default function Erfpacht() {
  const {
    ERFPACHTv2,
    openFacturen,
    dossiers,
    displayPropsDossiers,
    displayPropsOpenFacturen,
    titleDossiers,
    titleOpenFacturen,
    colStyles,
    isMediumScreen,
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
        <Grid>
          <Grid.Cell span="all">
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
            <Grid.Cell span="all">
              <Alert title="Foutmelding" severity="error">
                <Paragraph>
                  We kunnen op dit moment geen erfpachtrechten tonen.
                </Paragraph>
              </Alert>
            </Grid.Cell>
          )}

          {isLoading(ERFPACHTv2) && (
            <Grid.Cell span="all">
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

          {!isLoading(ERFPACHTv2) && !isError(ERFPACHTv2) && (
            <Grid.Cell span="all">
              <Heading level={3} size="level-2">
                {titleDossiers ?? 'Erfpachtrechten'}
              </Heading>

              {!!dossiers.length ? (
                <TableV2
                  className={styles.DossiersTable}
                  items={dossiers.slice(0, MAX_TABLE_ROWS_ON_THEMA_PAGINA)}
                  displayProps={displayPropsDossiers}
                  gridColStyles={colStyles.dossiersTable}
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
                {titleOpenFacturen ?? 'Openstaande facturen'}
              </Heading>

              {!!openFacturen.length ? (
                isMediumScreen ? (
                  <TableV2
                    items={openFacturen.slice(
                      0,
                      MAX_TABLE_ROWS_ON_THEMA_PAGINA
                    )}
                    displayProps={displayPropsOpenFacturen}
                    gridColStyles={colStyles.openFacturenTable}
                  />
                ) : (
                  <OpenFacturenListGrouped
                    facturen={openFacturen.slice(
                      0,
                      MAX_TABLE_ROWS_ON_THEMA_PAGINA
                    )}
                    displayProps={displayPropsOpenFacturen}
                    gridColStyles={colStyles.openFacturenTable}
                  />
                )
              ) : (
                <MaParagraph>
                  U heeft geen{' '}
                  {titleOpenFacturen?.toLowerCase() ?? 'openstaande facturen'}.
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
