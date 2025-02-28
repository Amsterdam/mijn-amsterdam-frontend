import {
  Grid,
  Heading,
  LinkList,
  Paragraph,
  Screen,
} from '@amsterdam/design-system-react';

import styles from './Erfpacht.module.scss';
import { useErfpachtV2Data } from './erfpachtData.hook';
import { OpenFacturenListGrouped } from './ErfpachtOpenFacturen';
import { IS_PRODUCTION } from '../../../universal/config/env';
import { AppRoutes } from '../../../universal/config/routes';
import { isError, isLoading } from '../../../universal/helpers/api';
import {
  ErrorAlert,
  LoadingContent,
  OverviewPage,
  PageHeading,
  ThemaIcon,
} from '../../components';
import { LinkToListPage } from '../../components/LinkToListPage/LinkToListPage';
import { TableV2 } from '../../components/Table/TableV2';
import { MAX_TABLE_ROWS_ON_THEMA_PAGINA } from '../../config/app';
import { ThemaTitles } from '../../config/thema';

export default function Erfpacht() {
  const {
    ERFPACHTv2,
    openFacturen,
    dossiers,
    displayPropsDossiers,
    displayPropsOpenFacturen,
    titleDossiers,
    titleOpenFacturen,
    isMediumScreen,
  } = useErfpachtV2Data();

  return (
    <OverviewPage>
      <PageHeading
        backLink={{
          to: AppRoutes.HOME,
          title: 'Home',
        }}
        icon={<ThemaIcon />}
      >
        {ThemaTitles.ERFPACHTv2}
      </PageHeading>
      <Screen>
        <Grid>
          <Grid.Cell span="all">
            <Paragraph>
              Hieronder ziet u de gegevens van uw erfpachtrechten.
            </Paragraph>
          </Grid.Cell>
          <Grid.Cell span="all">
            <LinkList>
              <LinkList.Link href="https://www.amsterdam.nl/wonen-leefomgeving/erfpacht/">
                Meer informatie over erfpacht in Amsterdam
              </LinkList.Link>
              <LinkList.Link
                href={`https://formulieren${IS_PRODUCTION ? '' : '.acc'}.amsterdam.nl/TriplEforms/DirectRegelen/formulier/nl-NL/evAmsterdam/ErfpachtWijzigen.aspx`}
              >
                Erfpacht wijzigen
              </LinkList.Link>
              <LinkList.Link href="https://www.amsterdam.nl/wonen-leefomgeving/erfpacht/overstappen-eeuwigdurende-erfpacht/">
                Overstappen erfpachtrecht
              </LinkList.Link>
            </LinkList>
          </Grid.Cell>

          {isError(ERFPACHTv2) && (
            <Grid.Cell span="all">
              <ErrorAlert>
                We kunnen op dit moment geen erfpachtrechten tonen.
              </ErrorAlert>
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
            <>
              <Grid.Cell span="all">
                <TableV2
                  caption={titleDossiers ?? 'Erfpachtrechten'}
                  className={styles.DossiersTable}
                  items={dossiers.slice(0, MAX_TABLE_ROWS_ON_THEMA_PAGINA)}
                  displayProps={displayPropsDossiers}
                />

                {!dossiers.length && (
                  <Paragraph>
                    U heeft geen{' '}
                    {titleDossiers?.toLowerCase() ?? 'erfpachtrechten'}.
                  </Paragraph>
                )}

                {dossiers.length > MAX_TABLE_ROWS_ON_THEMA_PAGINA && (
                  <LinkToListPage
                    count={dossiers.length}
                    route={AppRoutes['ERFPACHTv2/DOSSIERS']}
                  />
                )}
              </Grid.Cell>
              <Grid.Cell span="all">
                {isMediumScreen ? (
                  <TableV2
                    caption={titleOpenFacturen ?? 'Openstaande facturen'}
                    className={styles.OpenFacturenTableThemaPagina}
                    items={openFacturen.slice(
                      0,
                      MAX_TABLE_ROWS_ON_THEMA_PAGINA
                    )}
                    displayProps={displayPropsOpenFacturen}
                  />
                ) : (
                  <>
                    <Heading level={3} size="level-2">
                      {titleOpenFacturen ?? 'Openstaande facturen'}
                    </Heading>
                    <OpenFacturenListGrouped
                      tableClassName={styles.OpenFacturenTableThemaPagina}
                      facturen={openFacturen.slice(
                        0,
                        MAX_TABLE_ROWS_ON_THEMA_PAGINA
                      )}
                      displayProps={displayPropsOpenFacturen}
                    />
                  </>
                )}

                {!openFacturen.length && (
                  <Paragraph>
                    U heeft geen{' '}
                    {titleOpenFacturen?.toLowerCase() ?? 'openstaande facturen'}
                    .
                  </Paragraph>
                )}

                <LinkToListPage
                  count={openFacturen.length}
                  route={AppRoutes['ERFPACHTv2/OPEN_FACTUREN']}
                />
              </Grid.Cell>
            </>
          )}
        </Grid>
      </Screen>
    </OverviewPage>
  );
}
