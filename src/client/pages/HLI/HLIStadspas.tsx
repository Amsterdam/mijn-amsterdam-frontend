import {
  Grid,
  Heading,
  Paragraph,
  Screen,
} from '@amsterdam/design-system-react';
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { StadspasTransaction } from '../../../server/services/hli/stadspas-types';
import { AppRoutes } from '../../../universal/config/routes';
import {
  ApiResponse,
  apiPristineResult,
  isError,
  isLoading,
} from '../../../universal/helpers/api';
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
import { useAppStateGetter } from '../../hooks/useAppState';
import { useDataApi } from '../../hooks/api/useDataApi';
import styles from './HLIStadspas.module.scss';
import { getThemaTitleWithAppState } from './helpers';
import { usePhoneScreen } from '../../hooks/media.hook';

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

const displayPropsTransactiesWithBudget = {
  title: displayPropsTransacties.title,
  budget: 'Budget',
  datePublishedFormatted: displayPropsTransacties.datePublishedFormatted,
  amountFormatted: displayPropsTransacties.amountFormatted,
};

const displayPropsBudgets = {
  title: 'Omschrijving',
  dateEndFormatted: 'Tegoed geldig t/m',
  amountFormatted: 'Bedrag',
  // balanceFormatted: 'Saldo',
};

export default function HLIStadspas() {
  const isPhoneScreen = usePhoneScreen();
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
          content: stadspas.owner.firstname,
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
          content: `${stadspas.balanceFormatted} (Dit is het bedrag dat u nog kunt uitgeven)`,
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

  const showMultiBudgetTransactions =
    budgetsFormatted.length > 1 && !isPhoneScreen;

  return (
    <DetailPage>
      <PageHeading
        backLink={{
          to: AppRoutes.HLI,
          title: getThemaTitleWithAppState(appState),
        }}
        icon={<ThemaIcon />}
      >
        Overzicht stadspas{' '}
        {stadspas?.owner && ` van ${stadspas?.owner.firstname}`}
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
              {!!budgetsFormatted.length && <Datalist rows={rowsNummerSaldo} />}
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
              {!isLoadingStadspas && !!budgetsFormatted.length && (
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
                      className={
                        showMultiBudgetTransactions
                          ? styles.Table_transactions__withBudget
                          : styles.Table_transactions
                      }
                      items={transactions}
                      displayProps={
                        showMultiBudgetTransactions
                          ? displayPropsTransactiesWithBudget
                          : displayPropsTransacties
                      }
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
