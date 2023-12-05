import {
  Alert,
  Grid,
  Heading,
  Link,
  OrderedList,
  Paragraph,
  Screen,
} from '@amsterdam/design-system-react';
import classname from 'classnames';
import { useParams } from 'react-router-dom';
import { AppRoutes, ChapterTitles } from '../../../universal/config';
import { ApiResponse, apiPristineResult } from '../../../universal/helpers';
import { ChapterIcon, DetailPage, PageHeading } from '../../components';
import { TableV2 } from '../../components/Table/TableV2';
import { BFFApiUrls } from '../../config/api';
import { useDataApi } from '../../hooks/api/useDataApi';
import type { ErfpachtV2DossiersDetail } from '../../../server/services/simple-connect/erfpacht';
import { CollapsiblePanel } from '../../components/CollapsiblePanel/CollapsiblePanel';
import styles from './ErfpachtDossierDetail.module.scss';
import { DesignSystemStyleAdjust } from '../../components/DesignSystemStyleAdjust/DesignSystemStyleAdjust';

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
        <DesignSystemStyleAdjust />
        <Grid className={styles.Grid}>
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
              </Grid.Cell>
              <Grid.Cell start={1} span={10} className={styles.Sectio1}>
                <CollapsiblePanel title="Juridisch">
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
                </CollapsiblePanel>
              </Grid.Cell>
              <Grid.Cell start={1} span={10} className={styles.Sectio1}>
                <CollapsiblePanel title="Bijzondere bepalingen">
                  <table>
                    <thead>
                      <tr>
                        <th>
                          {
                            dossier.bestemmingen?.[0]
                              .titelBestemmingOmschrijving
                          }
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
                </CollapsiblePanel>
              </Grid.Cell>
              <Grid.Cell
                className={classname(styles.Section, styles.Section_Financieel)}
                start={1}
                span={11}
              >
                <CollapsiblePanel title="Financieel">
                  <Heading level={3} className={styles.Section__heading}>
                    {
                      dossier.financieel.huidigePeriode
                        .titelFinancieelPeriodeVan
                    }{' '}
                    {dossier.financieel.huidigePeriode.periodeVan} t/m{' '}
                    {dossier.financieel.huidigePeriode.periodeTm}
                  </Heading>
                  <dl>
                    <dt>
                      {
                        dossier.financieel.huidigePeriode
                          .titelFinancieelAlgemeneBepaling
                      }
                    </dt>
                    <dd>
                      {dossier.financieel.huidigePeriode.algemeneBepaling}
                    </dd>
                    <dt>
                      {dossier.financieel.huidigePeriode.titelFinancieelRegime}
                    </dt>
                    <dd>{dossier.financieel.huidigePeriode.regime}</dd>
                    <dt>
                      {dossier.financieel.huidigePeriode.titelFinancieelCanon}
                    </dt>
                    <dd>
                      <OrderedList markers={false}>
                        {dossier.financieel.huidigePeriode.canons.map(
                          (canon) => {
                            return (
                              <OrderedList.Item>
                                {canon.samengesteld}
                              </OrderedList.Item>
                            );
                          }
                        )}
                      </OrderedList>
                    </dd>
                  </dl>
                  {dossier.financieel.toekomstigePeriodeList.map((periode) => {
                    return (
                      <>
                        <Heading
                          level={3}
                          className={classname(
                            styles.Section__heading,
                            styles.Section__heading_nested
                          )}
                        >
                          {periode.titelFinancieelToekomstigePeriodeVan}{' '}
                          {periode.periodeVan} t/m {periode.periodeTm}
                        </Heading>
                        <dl>
                          <dt>
                            {periode.titelFinancieelToekomstigeAlgemeneBepaling}
                          </dt>
                          <dd>{periode.algemeneBepaling}</dd>
                          <dt>{periode.titelFinancieelToekomstigeRegime}</dt>
                          <dd>{periode.regime}</dd>
                          <dt>{periode.titelFinancieelToekomstigeCanon}</dt>
                          <dd>
                            <OrderedList markers={false}>
                              {periode.canonOmschrijvingen.map(
                                (omschrijving) => {
                                  return (
                                    <OrderedList.Item>
                                      {omschrijving}
                                    </OrderedList.Item>
                                  );
                                }
                              )}
                            </OrderedList>
                          </dd>
                        </dl>
                      </>
                    );
                  })}
                </CollapsiblePanel>
              </Grid.Cell>
              <Grid.Cell className={styles.Section} start={1} span={11}>
                <CollapsiblePanel title="Facturen">
                  <Grid className={styles.FacturenBetaler}>
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
                    <Grid.Cell start={1} span={11}>
                      {!!dossier.facturen.notas.length && (
                        <TableV2
                          titleKey="dossieradres"
                          items={dossier.facturen.notas}
                          displayProps={{
                            notaNummer:
                              dossier.facturen.notas?.[0]
                                .titelFacturenNotaNummer,
                            formattedFactuurBedrag:
                              dossier.facturen.notas?.[0]
                                .titelFacturenFactuurBedrag,
                            status:
                              dossier.facturen.notas?.[0].titelFacturenStatus,
                            vervalDatum:
                              dossier.facturen.notas?.[0]
                                .titelFacturenVervaldatum,
                          }}
                        />
                      )}
                    </Grid.Cell>
                  </Grid>
                </CollapsiblePanel>
              </Grid.Cell>
            </>
          )}
        </Grid>
      </Screen>
    </DetailPage>
  );
}
