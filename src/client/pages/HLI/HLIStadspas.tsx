import {
  Grid,
  Heading,
  Paragraph,
  Screen,
} from '@amsterdam/design-system-react';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { StadspasTransaction } from '../../../server/services/hli/stadspas-types';
import { AppRoutes, ThemaTitles } from '../../../universal/config';
import {
  ApiResponse,
  apiPristineResult,
  isError,
  isLoading,
} from '../../../universal/helpers';
import {
  DetailPage,
  ErrorAlert,
  LoadingContent,
  PageHeading,
  ThemaIcon,
} from '../../components';
import { Datalist } from '../../components/Datalist/Datalist';
import { BarConfig } from '../../components/LoadingContent/LoadingContent';
import { MaRouterLink } from '../../components/MaLink/MaLink';
import { TableV2 } from '../../components/Table/TableV2';
import { useAppStateGetter } from '../../hooks';
import { useDataApi } from '../../hooks/api/useDataApi';
import styles from './HLIStadspas.module.scss';
import { getThemaTitleWithAppState } from './helpers';

const loadingContentBarConfigDetails: BarConfig = [
  ['10rem', '2rem', '.5rem'],
  ['16rem', '2rem', '3rem'],
  ['10rem', '2rem', '.5rem'],
  ['25rem', '2rem', '3rem'],
  ['8rem', '2rem', '.5rem'],
  ['5rem', '2rem', '3rem'],
];
const loadingContentBarConfigList: BarConfig = [
  ['60rem', '2rem', '.5rem'],
  ['60rem', '2rem', '4rem'],
];

const displayPropsTransacties = {
  title: 'Omschrijving',
  datePublishedFormatted: 'Datum',
  amountFormatted: 'Bedrag',
};
const displayPropsBudgets = {
  title: 'Omschrijving',
  dateEndFormatted: 'Geldig t/m',
  amountFormatted: 'Bedrag',
  // balanceFormatted: 'Saldo',
};

export default function HLIStadspas() {
  const appState = useAppStateGetter();
  const { HLI } = appState;
  const { id } = useParams<{ id: string }>();
  const stadspas = id
    ? HLI?.content?.stadspas?.stadspassen?.find((pass) => pass.id === id)
    : null;
  const isErrorStadspas = isError(HLI);
  const isLoadingStadspas = isLoading(HLI);
  const noContent = !stadspas;

  const rowsNaam = stadspas
    ? [
        {
          label: 'Naam',
          content: stadspas.owner,
        },
      ]
    : [];
  const rowsNummerSaldo = stadspas
    ? [
        {
          label: 'Stadspasnummer',
          content: stadspas.passNumber,
        },
        {
          label: 'Saldo',
          content: stadspas.balanceFormatted,
        },
      ]
    : [];

  const transactionKeys = stadspas?.budgets.map(
    (budget) => budget.transactionsKey
  );
  const requestOptions = {
    method: 'post',
    url: stadspas?.urlTransactions,
    data: transactionKeys,
    postpone: true,
  };
  const [transactionsApi, fetchTransactions] = useDataApi<
    ApiResponse<StadspasTransaction[]>
  >(requestOptions, apiPristineResult([]));

  const isLoadingTransacties = transactionsApi.isLoading;

  useEffect(() => {
    if (stadspas?.urlTransactions) {
      fetchTransactions({ ...requestOptions, postpone: false });
    }
  }, [fetchTransactions, stadspas?.urlTransactions]);

  const budgetsFormatted =
    stadspas?.budgets.map((budget) => {
      return {
        title: budget.description,
        amountFormatted: budget.budgetAssignedFormatted,
        dateEndFormatted: budget.dateEndFormatted,
      };
    }) ?? [];

  const transactions =
    stadspas?.budgets && transactionsApi.data.content
      ? transactionsApi.data.content
      : [];

  return (
    <DetailPage>
      <PageHeading
        backLink={{
          to: AppRoutes.HLI,
          title: getThemaTitleWithAppState(appState),
        }}
        icon={<ThemaIcon />}
      >
        Overzicht stadspas {stadspas?.owner && ` van ${stadspas?.owner}`}
      </PageHeading>
      <Screen>
        <Grid>
          {!stadspas && (
            <Grid.Cell span="all">
              {isLoadingStadspas && (
                <LoadingContent barConfig={loadingContentBarConfigDetails} />
              )}
              {(isErrorStadspas || (!isLoadingStadspas && noContent)) && (
                <ErrorAlert>
                  We kunnen op dit moment geen gegevens tonen.{' '}
                  <MaRouterLink href={AppRoutes.STADSPAS}>
                    Naar het overzicht
                  </MaRouterLink>
                </ErrorAlert>
              )}
            </Grid.Cell>
          )}
          {!!stadspas && (
            <Grid.Cell span="all">
              <Datalist rows={rowsNaam} />
              <Paragraph className={styles.StadspasNummerInfo}>
                Hieronder staat het Stadspasnummer van uw actieve pas.
                <br /> Dit pasnummer staat ook op de achterkant van uw pas.
              </Paragraph>
              <Datalist rows={rowsNummerSaldo} />
            </Grid.Cell>
          )}

          <>
            <Grid.Cell span="all">
              <Heading>Gekregen tegoed</Heading>
            </Grid.Cell>
            <Grid.Cell span="all">
              {isLoadingStadspas && (
                <LoadingContent barConfig={loadingContentBarConfigList} />
              )}
              {!isLoadingStadspas && budgetsFormatted.length && (
                <TableV2
                  className={styles.Table_budgets}
                  items={budgetsFormatted}
                  displayProps={displayPropsBudgets}
                />
              )}
              {!isLoadingStadspas && !budgetsFormatted.length && (
                <Paragraph>U heeft (nog) geen tegoed gekregen.</Paragraph>
              )}
            </Grid.Cell>
            <Grid.Cell span="all">
              <Heading>Uw uitgaven</Heading>
            </Grid.Cell>
            <Grid.Cell span="all">
              {(isLoadingTransacties || isLoadingStadspas) && (
                <LoadingContent barConfig={loadingContentBarConfigList} />
              )}
              {!isLoadingStadspas && !isLoadingTransacties && (
                <Paragraph>
                  Hieronder ziet u bij welke winkels u het tegoed hebt
                  uitgegeven. Deze informatie kan een dag achterlopen. Maar het
                  bedrag dat u nog over heeft klopt altijd.
                </Paragraph>
              )}
            </Grid.Cell>
            {!isLoadingTransacties &&
              !!transactionsApi.data.content?.length && (
                <>
                  <Grid.Cell span="all">
                    <TableV2
                      className={styles.Table_transactions}
                      items={transactions}
                      displayProps={displayPropsTransacties}
                    />
                  </Grid.Cell>
                </>
              )}
            {!isLoadingStadspas &&
              !isLoadingTransacties &&
              !transactionsApi.data.content?.length && (
                <Grid.Cell span="all">
                  <Paragraph>U heeft (nog) geen uitgaven.</Paragraph>
                </Grid.Cell>
              )}
          </>
        </Grid>
      </Screen>
    </DetailPage>
  );
}
