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
import type { Erfpachtv2DossierInfoDetailsResponseSource } from '../../../server/services/simple-connect/erfpacht';
import styles from './ErfpachtDossierDetail.module.scss';

export default function ErfpachtDossierDetail() {
  const { id } = useParams<{ id: string }>();
  const [api] = useDataApi<
    ApiResponse<Erfpachtv2DossierInfoDetailsResponseSource | null>
  >(
    {
      url: `${BFFApiUrls.ERFPACHTv2_DOSSIER_DETAILS}/${id}`,
      // postpone: !fromApiDirectly,
    },
    apiPristineResult(null)
  );

  const dossier = api.data.content;
  const noContent = !api.isLoading && !dossier;

  return (
    <DetailPage>
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
            <Grid.Cell start={1} span={11}>
              <Heading level={3} size="level-4">
                {dossier.titelDossierNummer}
              </Heading>
              <MaParagraph>{dossier.dossierNummer}</MaParagraph>
              <Heading level={3} size="level-4">
                {dossier.titelVoorkeursadres}
              </Heading>
              <MaParagraph>{dossier.voorkeursadres}</MaParagraph>
              <Heading level={3} size="level-4">
                {dossier.titelKadastraleaanduiding}
              </Heading>
              <OrderedList
                className={styles.DossierDetail__ordered_list}
                markers={false}
              >
                {dossier.kadastraleaanduiding.map((kadestraleAanduiding) => {
                  return (
                    <OrderedList.Item key={kadestraleAanduiding.perceelsnummer}>
                      {kadestraleAanduiding.samengesteld}
                    </OrderedList.Item>
                  );
                })}
              </OrderedList>
              <Heading level={3} size="level-4">
                {dossier.titelEersteUitgifte}
              </Heading>
              <MaParagraph>{dossier.eersteUitgifte}</MaParagraph>
              <Heading level={3} size="level-4">
                Erfpachters
              </Heading>
              <OrderedList markers={false}>
                {dossier.relaties.map((relatie) => {
                  return (
                    <OrderedList.Item key={relatie.relatieNaam}>
                      {relatie.relatieNaam}
                    </OrderedList.Item>
                  );
                })}
              </OrderedList>
            </Grid.Cell>
          )}
        </Grid>
      </Screen>
    </DetailPage>
  );
}
