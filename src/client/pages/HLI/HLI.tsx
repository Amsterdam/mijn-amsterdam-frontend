import {
  Grid,
  LinkList,
  Paragraph,
  Screen,
  UnorderedList,
} from '@amsterdam/design-system-react';
import { generatePath } from 'react-router-dom';
import { HLIRegeling } from '../../../server/services/hli/regelingen-types';
import { Stadspas } from '../../../server/services/hli/stadspas-types';
import { AppRoutes, ThemaTitles } from '../../../universal/config';
import { isError, isLoading } from '../../../universal/helpers';
import {
  ErrorAlert,
  LoadingContent,
  OverviewPage,
  PageHeading,
  ThemaIcon,
  addTitleLinkComponent,
} from '../../components';
import { LinkToListPage } from '../../components/LinkToListPage/LinkToListPage';
import { MaRouterLink } from '../../components/MaLink/MaLink';
import { TableV2 } from '../../components/Table/TableV2';
import { MAX_TABLE_ROWS_ON_THEMA_PAGINA } from '../../config/app';
import { useAppStateGetter } from '../../hooks/useAppState';
import styles from './HLI.module.scss';
import { addLinkElementToProperty } from '../../components/Table/Table';

const displayPropsHuidigeRegelingen = {
  title: 'Naam regeling',
};

const displayPropsEerdereRegelingen = {
  title: 'Naam regeling',
};

function StadspasListItem({ stadspas }: { stadspas: Stadspas }) {
  return (
    <UnorderedList.Item key={stadspas.passNumber}>
      <MaRouterLink
        maVariant="fatNoUnderline"
        href={generatePath(AppRoutes['HLI/STADSPAS'], {
          id: stadspas.id,
        })}
      >
        <span className={styles.Stadspas_owner}>{stadspas.owner}</span>
        <span className={styles.Stadspas_balance}>
          Saldo {stadspas.balanceFormatted}
        </span>
      </MaRouterLink>
    </UnorderedList.Item>
  );
}

export default function ThemaPaginaHLI() {
  const { HLI } = useAppStateGetter();
  const hasStadspas = !!HLI.content?.stadspas?.stadspassen?.length;
  const stadspassen = HLI.content?.stadspas?.stadspassen;
  const regelingen = addLinkElementToProperty<HLIRegeling>(
    HLI.content?.regelingen ?? [],
    'title'
  );

  const huidigeRegelingen: HLIRegeling[] = regelingen.filter(
    (regeling) => regeling.isActual
  );
  const eerdereRegelingen: HLIRegeling[] = regelingen.filter(
    (regeling) => !regeling.isActual
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
        {ThemaTitles.HLI}
      </PageHeading>
      <Screen>
        <Grid>
          <Grid.Cell span="all">
            <Paragraph>
              Hieronder ziet u al uw voorzieningen. Indien u of uw kinderen in
              bezit zijn van een Stadspas ziet u ook de stadspasgegevens.
            </Paragraph>
          </Grid.Cell>
          <Grid.Cell span="all">
            <LinkList>
              <LinkList.Link href="https://www.amsterdam.nl/werk-inkomen/hulp-bij-laag-inkomen/">
                Meer informatie over voorzieningen
              </LinkList.Link>
              <LinkList.Link href="https://www.amsterdam.nl/stadspas">
                Meer informatie over Stadspas
              </LinkList.Link>
              <LinkList.Link href="https://www.amsterdam.nl/stadspas/kindtegoed/kosten-terugvragen/">
                Meer informatie over Kindtegoed declareren
              </LinkList.Link>
            </LinkList>
          </Grid.Cell>

          {isError(HLI) && (
            <Grid.Cell span="all">
              <ErrorAlert>
                We kunnen op dit moment niet alle gegevens tonen.
              </ErrorAlert>
            </Grid.Cell>
          )}

          {isLoading(HLI) && (
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

          {!isLoading(HLI) && !isError(HLI) && (
            <>
              {hasStadspas && (
                <Grid.Cell span="all">
                  <UnorderedList markers={false}>
                    {stadspassen?.map((stadspas) => (
                      <StadspasListItem stadspas={stadspas} />
                    ))}
                  </UnorderedList>
                  {!!stadspassen?.length && (
                    <Paragraph size="small">
                      Voor alle stadspassen geldt de einddatum van{' '}
                      {stadspassen[0].dateEndFormatted}
                    </Paragraph>
                  )}
                </Grid.Cell>
              )}
              <Grid.Cell span="all">
                <TableV2
                  caption="Huidige regelingen"
                  items={huidigeRegelingen}
                  displayProps={displayPropsHuidigeRegelingen}
                />

                {!huidigeRegelingen.length && (
                  <Paragraph>U heeft geen huidige regelingen.</Paragraph>
                )}
              </Grid.Cell>
              <Grid.Cell span="all">
                <TableV2
                  caption="Eerdere en afgewezen regelingen"
                  items={eerdereRegelingen.slice(
                    0,
                    MAX_TABLE_ROWS_ON_THEMA_PAGINA
                  )}
                  displayProps={displayPropsEerdereRegelingen}
                />

                {!eerdereRegelingen.length && (
                  <Paragraph>
                    U heeft geen eerdere of afgewezen regelingen.
                  </Paragraph>
                )}

                <LinkToListPage
                  count={eerdereRegelingen.length}
                  route={AppRoutes['HLI/REGELINGEN_LIJST']}
                />
              </Grid.Cell>
            </>
          )}
        </Grid>
      </Screen>
    </OverviewPage>
  );
}
