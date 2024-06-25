import {
  Grid,
  LinkList,
  Paragraph,
  Screen,
} from '@amsterdam/design-system-react';
import { VergunningV2 } from '../../../server/services/vergunningen-v2/config-and-types';
import { AppRoutes, ThemaTitles } from '../../../universal/config';
import { isError, isLoading } from '../../../universal/helpers';
import {
  ErrorAlert,
  LoadingContent,
  OverviewPage,
  PageHeading,
  ThemaIcon,
} from '../../components';
import { LinkToListPage } from '../../components/LinkToListPage/LinkToListPage';
import { addLinkElementToProperty } from '../../components/Table/Table';
import { TableV2 } from '../../components/Table/TableV2';
import { MAX_TABLE_ROWS_ON_THEMA_PAGINA } from '../../config/app';
import { useAppStateGetter } from '../../hooks/useAppState';
import styles from './Vergunningen.module.scss';

import {
  displayPropsEerdereVergunningen,
  displayPropsHuidigeVergunningen,
} from './config';
import { CaseTypeV2 } from '../../../universal/types/vergunningen';

export default function VergunningenV2() {
  const { VERGUNNINGEN_V2 } = useAppStateGetter();
  const vergunningen = addLinkElementToProperty<VergunningV2>(
    VERGUNNINGEN_V2.content ?? [],
    'title'
  );
  const hasVergunningen = !!vergunningen.length;

  const huidigeVergunningen: VergunningV2[] = vergunningen.filter(
    (regeling) => !regeling.processed
  );
  const eerdereVergunningen: VergunningV2[] = vergunningen.filter(
    (regeling) => regeling.processed
  );

  const hasActualGPK = huidigeVergunningen.find(
    (vergunning) => vergunning.caseType === CaseTypeV2.GPK
  );

  return (
    <OverviewPage>
      <PageHeading
        backLink={{
          to: AppRoutes.HOME,
          title: 'Home',
        }}
        icon={<ThemaIcon />}
      >
        {ThemaTitles.VERGUNNINGEN}
      </PageHeading>
      <Screen>
        <Grid>
          <Grid.Cell span="all">
            <Paragraph>
              Hier ziet u een overzicht van uw aanvragen voor vergunningen en
              ontheffingen bij gemeente Amsterdam.
            </Paragraph>
          </Grid.Cell>
          <Grid.Cell span="all">
            <LinkList>
              <LinkList.Link
                rel="noreferrer"
                href="https://www.amsterdam.nl/ondernemen/vergunningen/wevos/"
              >
                Ontheffing RVV en TVM aanvragen
              </LinkList.Link>
            </LinkList>
          </Grid.Cell>

          {isError(VERGUNNINGEN_V2) && (
            <Grid.Cell span="all">
              <ErrorAlert>
                We kunnen op dit moment niet alle gegevens tonen.
              </ErrorAlert>
            </Grid.Cell>
          )}

          {isLoading(VERGUNNINGEN_V2) && (
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

          {!isLoading(VERGUNNINGEN_V2) && !isError(VERGUNNINGEN_V2) && (
            <>
              <Grid.Cell span="all">
                <TableV2
                  showTHead={!!huidigeVergunningen.length}
                  caption="Huidige vergunningen en ontheffingen"
                  items={huidigeVergunningen.slice(
                    0,
                    MAX_TABLE_ROWS_ON_THEMA_PAGINA
                  )}
                  displayProps={displayPropsHuidigeVergunningen}
                  className={styles.HuidigeVergunningen}
                />

                {!huidigeVergunningen.length && (
                  <Paragraph>
                    U heeft geen huidige vergunningen of ontheffingen.
                  </Paragraph>
                )}

                <LinkToListPage
                  count={huidigeVergunningen.length}
                  route={AppRoutes['VERGUNNINGEN_V2/HUIDIGE_VERGUNNINGEN']}
                />
              </Grid.Cell>
              <Grid.Cell span="all">
                <TableV2
                  showTHead={!!eerdereVergunningen.length}
                  caption="Eerdere en niet verleende vergunningen en ontheffingen"
                  items={eerdereVergunningen.slice(
                    0,
                    MAX_TABLE_ROWS_ON_THEMA_PAGINA
                  )}
                  displayProps={displayPropsEerdereVergunningen}
                  className={styles.EerdereVergunningen}
                />

                {!eerdereVergunningen.length && (
                  <Paragraph>
                    U heeft geen eerdere of niet verleende vergunningen of
                    ontheffingen.
                  </Paragraph>
                )}

                <LinkToListPage
                  count={eerdereVergunningen.length}
                  route={AppRoutes['VERGUNNINGEN_V2/EERDERE_VERGUNNINGEN']}
                />
              </Grid.Cell>
            </>
          )}
          {hasActualGPK && (
            <Grid.Cell span="all">
              <Paragraph className={styles.SuppressedParagraph}>
                Hebt u naast een Europese gehandicaptenparkeerkaart (GPK) ook
                een vaste parkeerplaats voor gehandicapten (GPP) aangevraagd?
                Dan ziet u hier in Mijn Amsterdam alleen de aanvraag voor een
                GPK staan. Zodra de GPK is gegeven, ziet u ook uw aanvraag voor
                uw GPP in Mijn Amsterdam.
              </Paragraph>
            </Grid.Cell>
          )}
        </Grid>
      </Screen>
    </OverviewPage>
  );
}
