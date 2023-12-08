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
import {
  useMediumScreen,
  usePhoneScreen,
  useTabletScreen,
  useWidescreen,
} from '../../hooks';
import { MaParagraph } from '../../components/Paragraph/Paragraph';
import { MAX_TABLE_ROWS_ON_THEMA_PAGINA } from '../../config/app';
import { LinkToListPage } from '../../components/LinkToListPage/LinkToListPage';

export default function ErfpachtDossierDetail() {
  const { dossierNummerUrlParam } = useParams<{
    dossierNummerUrlParam: string;
  }>();
  const [api] = useDataApi<ApiResponse<ErfpachtV2DossiersDetail | null>>(
    {
      url: `${BFFApiUrls.ERFPACHTv2_DOSSIER_DETAILS}/${dossierNummerUrlParam}`,
    },
    apiPristineResult(null)
  );

  const dossier = api.data.content;
  const noContent = !api.isLoading && !dossier;
  const isWideScreen = useWidescreen();
  const isMediumScreen = useMediumScreen();
  const relaties = dossier?.relaties
    ? Array.from({ length: 20 }, () => dossier.relaties).flat()
    : [];

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
            <Grid.Cell fullWidth>
              <Paragraph>
                Erfpacht dossier gegevens worden opgehaald...
              </Paragraph>
            </Grid.Cell>
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
              <Grid.Cell start={1} span={12}>
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
                      {dossier.kadastraleaanduidingen?.map(
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
                    <OrderedList
                      markers={false}
                      className={styles.ColumnList}
                      style={{
                        gridTemplateRows: `repeat(${Math.ceil(
                          relaties.length / 3
                        )}, 1fr)`,
                      }}
                    >
                      {relaties?.map((relatie, index, all) => {
                        return (
                          <OrderedList.Item key={relatie.relatieNaam}>
                            {index}-{relatie.relatieNaam}
                          </OrderedList.Item>
                        );
                      })}
                    </OrderedList>
                  </dd>
                </dl>
              </Grid.Cell>

              <Grid.Cell start={1} span={10} className={styles.Sectio1}>
                <CollapsiblePanel title="Juridisch">
                  {!!dossier.juridisch && (
                    <dl>
                      <dt>{dossier.juridisch.titelAlgemeneBepaling}</dt>
                      <dd>
                        <Link href="">
                          {dossier.juridisch.algemeneBepaling}
                        </Link>
                      </dd>
                      <dt>{dossier.juridisch.titelIngangsdatum}</dt>
                      <dd>{dossier.juridisch.ingangsdatum}</dd>
                      <dt>{dossier.juridisch.titelSoortErfpacht}</dt>
                      <dd>{dossier.juridisch.uitgeschrevenSoortErfpacht}</dd>
                    </dl>
                  )}
                </CollapsiblePanel>
              </Grid.Cell>

              <Grid.Cell start={1} span={10} className={styles.Sectio1}>
                <CollapsiblePanel title="Bijzondere bepalingen">
                  {!!dossier.bijzondereBepalingen && (
                    <table>
                      <thead>
                        <tr>
                          <th>
                            {
                              dossier.bijzondereBepalingen?.[0]
                                .titelBestemmingOmschrijving
                            }
                          </th>
                          <th>Oppervlakte</th>
                        </tr>
                      </thead>
                      {dossier.bijzondereBepalingen.map(
                        (bijzondereBepaling) => {
                          return (
                            <tr key={bijzondereBepaling.omschrijving}>
                              <td>{bijzondereBepaling.omschrijving}</td>
                              <td>
                                {bijzondereBepaling.oppervlakte}
                                {bijzondereBepaling.eenheid}
                              </td>
                            </tr>
                          );
                        }
                      )}
                    </table>
                  )}
                </CollapsiblePanel>
              </Grid.Cell>
              <Grid.Cell
                className={classname(styles.Section, styles.Section_Financieel)}
                start={1}
                span={12}
              >
                <CollapsiblePanel title="Financieel">
                  <Heading level={3} className={styles.Section__heading}>
                    {
                      dossier.financieel?.huidigePeriode
                        .titelFinancieelPeriodeVan
                    }{' '}
                    {dossier.financieel?.huidigePeriode.periodeVan}{' '}
                    {!!dossier.financieel?.huidigePeriode.periodeTm && 't/m '}
                    {dossier.financieel?.huidigePeriode.periodeTm}
                  </Heading>
                  {!!dossier.financieel?.huidigePeriode && (
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
                        {
                          dossier.financieel.huidigePeriode
                            .titelFinancieelRegime
                        }
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
                                <OrderedList.Item key={canon.samengesteld}>
                                  {canon.samengesteld}
                                </OrderedList.Item>
                              );
                            }
                          )}
                        </OrderedList>
                      </dd>
                    </dl>
                  )}
                  {dossier.financieel?.toekomstigePeriodeList?.map(
                    (periode) => {
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
                              {
                                periode.titelFinancieelToekomstigeAlgemeneBepaling
                              }
                            </dt>
                            <dd>{periode.algemeneBepaling}</dd>
                            <dt>{periode.titelFinancieelToekomstigeRegime}</dt>
                            <dd>{periode.regime}</dd>
                            <dt>{periode.titelFinancieelToekomstigeCanon}</dt>
                            <dd>
                              <OrderedList markers={false}>
                                {periode.canons.map((canon) => {
                                  return (
                                    <OrderedList.Item>
                                      {canon.samengesteld}
                                    </OrderedList.Item>
                                  );
                                })}
                              </OrderedList>
                            </dd>
                          </dl>
                        </>
                      );
                    }
                  )}
                </CollapsiblePanel>
              </Grid.Cell>
              <Grid.Cell className={styles.Section} start={1} span={12}>
                <CollapsiblePanel title="Facturen">
                  <Grid className={styles.FacturenBetaler}>
                    <Grid.Cell start={1} span={9}>
                      <Heading level={4} size="level-4">
                        Factuur naar nieuw adres
                      </Heading>
                      <MaParagraph>
                        Wilt u uw facturen voor erfpacht en canon op een nieuw
                        adres ontvangen? Stuur een e-mail naar{' '}
                        <Link href="mailto:erfpachtadministratie@amsterdam.nl">
                          erfpachtadministratie@amsterdam.nl
                        </Link>
                        . Zet in het onderwerp 'Adreswijziging'. Vermeld in de
                        mail uw debiteurennummer of het E-dossiernummer en uw
                        nieuwe adresgegevens. U krijgt binnen 3 werkdagen een
                        reactie.
                      </MaParagraph>
                      <Heading level={4} size="level-4">
                        Factuur via e-mail
                      </Heading>
                      <MaParagraph>
                        U kunt uw facturen ook per e-mail krijgen. Mail hiervoor
                        uw e-mailadres en debiteurennummer naar{' '}
                        <Link href="mailto:debiteurenadministratie@amsterdam.nl">
                          debiteurenadministratie@amsterdam.nl
                        </Link>
                        .
                      </MaParagraph>
                    </Grid.Cell>
                    <Grid.Cell span={3} start={1}>
                      {!!dossier.facturen && (
                        <dl>
                          <dt>{dossier.titelBetaler}</dt>
                          <dd>{dossier.facturen.betaler}</dd>
                        </dl>
                      )}
                    </Grid.Cell>
                    <Grid.Cell span={3} start={4}>
                      {!!dossier.facturen && (
                        <dl>
                          <dt>Debiteurnummer</dt>
                          <dd>{dossier.facturen.debiteurnummer}</dd>
                        </dl>
                      )}
                    </Grid.Cell>
                    <Grid.Cell start={1} span={12}>
                      {!!dossier.facturen?.facturen?.length && (
                        <TableV2
                          gridColStyles={[
                            styles.FacturenTable_col1,
                            styles.FacturenTable_col2,
                            styles.FacturenTable_col3,
                            styles.FacturenTable_col4,
                          ]}
                          titleKey="dossieradres"
                          items={dossier.facturen.facturen.slice(0, 3)}
                          className={styles.FacturenTable}
                          displayProps={{
                            notaNummer: dossier.facturen.titelFacturenNummer,
                            formattedFactuurBedrag:
                              dossier.facturen.titelFacturenFactuurBedrag,
                            status: dossier.facturen.titelFacturenStatus,
                            vervalDatum:
                              dossier.facturen.titelFacturenVervaldatum,
                          }}
                        />
                      )}
                      {dossier.facturen?.facturen?.length >
                        MAX_TABLE_ROWS_ON_THEMA_PAGINA && (
                        <MaParagraph textAlign="right">
                          <LinkToListPage
                            count={dossier.facturen.facturen.length}
                            route={AppRoutes['ERFPACHTv2/OPEN_FACTUREN']}
                          />
                        </MaParagraph>
                      )}
                      {!dossier.facturen?.facturen?.length && (
                        <Paragraph>U heeft geen facturen.</Paragraph>
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
