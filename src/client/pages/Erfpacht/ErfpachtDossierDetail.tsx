import {
  Alert,
  Heading,
  Grid,
  Screen,
  Link,
  UnorderedList,
  Paragraph,
  OrderedList,
} from '@amsterdam/design-system-react';
import { AppRoutes, ChapterTitles } from '../../../universal/config';
import {
  ApiResponse,
  apiPristineResult,
  isError,
  isLoading,
} from '../../../universal/helpers';
import { ChapterIcon, DetailPage, PageHeading } from '../../components';
import { useAppStateGetter } from '../../hooks';
import { TableV2 } from '../../components/Table/TableV2';
import { MaParagraph } from '../../components/Paragraph/Paragraph';
import { MAX_TABLE_ROWS_ON_THEMA_PAGINA } from '../../config/app';
import { LinkToListPage } from '../../components/LinkToListPage/LinkToListPage';
import { addLinkElementToProperty } from '../../components/Table/Table';
import { useErfpachtV2Data } from './Erfpacht';
import { useParams } from 'react-router-dom';
import { useDataApi } from '../../hooks/api/useDataApi';
import { BFFApiUrls } from '../../config/api';

import styles from './ErfpachtDossierDetail.module.scss';
import type { ErfpachtV2DossiersDetail } from '../../../server/services/simple-connect/erfpacht';

export default function ErfpachtDossierDetail() {
  const { id } = useParams<{ id: string }>();
  const [api] = useDataApi<ApiResponse<ErfpachtV2DossiersDetail | null>>(
    {
      url: `${BFFApiUrls.ERFPACHTv2_DOSSIER_DETAILS}/${id}`,
      // postpone: !fromApiDirectly,
    },
    apiPristineResult(null)
  );

  const dossier = api.data.content;
  const noContent = !api.isLoading && !dossier;

  return (
    <DetailPage className={styles.ErfpachtDetail}>
      <PageHeading
        backLink={{
          to: AppRoutes.ERFPACHTv2,
          title: ChapterTitles.ERFPACHTv2,
        }}
        isLoading={api.isLoading}
        icon={<ChapterIcon />}
      >
        {dossier?.title ?? ChapterTitles.ERFPACHTv2}
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
              <Grid.Cell start={1} span={11}>
                <dl>
                  <dt>{dossier.titelDossierNummer}</dt>
                  <dd>{dossier.dossierNummer}</dd>
                  <dt>{dossier.titelVoorkeursadres}</dt>
                  <dd>{dossier.voorkeursadres}</dd>
                  <dt>{dossier.titelKadastraleaanduiding}</dt>
                  <dd>
                    <OrderedList
                      className={styles.DossierDetail__ordered_list}
                      markers={false}
                    >
                      {dossier.kadastraleaanduiding.map(
                        (kadestraleAanduiding) => {
                          return (
                            <OrderedList.Item
                              key={kadestraleAanduiding.perceelsnummer}
                            >
                              {kadestraleAanduiding.samengesteld}
                            </OrderedList.Item>
                          );
                        }
                      )}
                    </OrderedList>
                  </dd>
                  <dt>{dossier.titelEersteUitgifte}</dt>
                  <dd>{dossier.eersteUitgifte}</dd>
                  <dt>Erfpachters</dt>
                  <dd>
                    <OrderedList markers={false}>
                      {dossier.relaties.map((relatie) => {
                        return (
                          <OrderedList.Item key={relatie.relatieNaam}>
                            {relatie.relatieNaam}
                          </OrderedList.Item>
                        );
                      })}
                    </OrderedList>
                  </dd>
                </dl>
                <Heading level={3} size="level-2">
                  Juridisch
                </Heading>
                <dl>
                  <dt>{dossier.juridisch.titelAlgemeneBepaling}</dt>
                  <dd>
                    <Link href="">{dossier.juridisch.algemeneBepaling}</Link>
                  </dd>
                  <dt>{dossier.juridisch.titelIngangsdatum}</dt>
                  <dd>{dossier.juridisch.ingangsdatum}</dd>
                  <dt>{dossier.juridisch.titelSoortErfpacht}</dt>
                  <dd>{dossier.juridisch.soortErfpacht}</dd>
                </dl>
                <Heading level={3} size="level-2">
                  Bijzondere bepalingen
                </Heading>
                <table>
                  <thead>
                    <tr>
                      <th>
                        {dossier.bestemmingen?.[0].titelBestemmingOmschrijving}
                      </th>
                      <th>Oppervlakte</th>
                    </tr>
                  </thead>
                  {dossier.bestemmingen.map((bestemming) => {
                    return (
                      <tr>
                        <td>{bestemming.samengesteldeOmschrijving}</td>
                        <td>
                          {bestemming.oppervlakte}
                          {bestemming.eenheid}
                        </td>
                      </tr>
                    );
                  })}
                </table>
                <Heading level={2}>Financieel</Heading>
                <Heading level={3}>
                  {dossier.financieel.huidigePeriode.titelFinancieelPeriodeVan}{' '}
                  {dossier.financieel.huidigePeriode.periodeVan} t/m{' '}
                  {dossier.financieel.huidigePeriode.periodeTm}
                </Heading>
                <dl>
                  <dt>
                    {dossier.financieel.huidigePeriode.titelFinancieelRegime}
                  </dt>
                  <dd>{dossier.financieel.huidigePeriode.regime}</dd>
                  <dt>
                    {dossier.financieel.huidigePeriode.titelFinancieelCanon}
                  </dt>
                  <dd>
                    <OrderedList>
                      {dossier.financieel.huidigePeriode.canons.map((canon) => {
                        return (
                          <OrderedList.Item>
                            {canon.samengesteld}
                          </OrderedList.Item>
                        );
                      })}
                    </OrderedList>
                  </dd>
                </dl>
                {dossier.financieel.toekomstigePeriodeList.map((periode) => {
                  return (
                    <>
                      <Heading level={3}>
                        {periode.titelFinancieelToekomstigePeriodeVan}{' '}
                        {periode.periodeVan} t/m {periode.periodeTm}
                      </Heading>
                      <dl>
                        <dt>{periode.titelFinancieelToekomstigeRegime}</dt>
                        <dd>{periode.regime}</dd>
                        <dt>{periode.titelFinancieelToekomstigeCanon}</dt>
                        <dd>
                          <OrderedList>
                            {periode.canonOmschrijvingen.map((omschrijving) => {
                              return (
                                <OrderedList.Item>
                                  {omschrijving}
                                </OrderedList.Item>
                              );
                            })}
                          </OrderedList>
                        </dd>
                      </dl>
                    </>
                  );
                })}
                <Heading level={3} size="level-2">
                  Facturen
                </Heading>
              </Grid.Cell>
              <Grid.Cell span={3} start={1}>
                <dl>
                  <dt>{dossier.titelBetaler}</dt>
                  <dd>{dossier.facturen.betaler}</dd>
                </dl>
              </Grid.Cell>
              <Grid.Cell span={3} start={4}>
                <dl>
                  <dt>Debiteurnummer</dt>
                  <dd>{dossier.facturen.debiteurnummer}</dd>
                </dl>
              </Grid.Cell>
              <Grid.Cell fullWidth>
                {!!dossier.facturen.notas.length && (
                  <TableV2
                    titleKey="dossieradres"
                    items={dossier.facturen.notas}
                    displayProps={{
                      notaNummer:
                        dossier.facturen.notas?.[0].titelFacturenNotaNummer,
                      formattedFactuurBedrag:
                        dossier.facturen.notas?.[0].titelFacturenFactuurBedrag,
                      status: dossier.facturen.notas?.[0].titelFacturenStatus,
                      vervalDatum:
                        dossier.facturen.notas?.[0].titelFacturenVervaldatum,
                    }}
                  />
                )}
              </Grid.Cell>
            </>
          )}
        </Grid>
      </Screen>
    </DetailPage>
  );
}
