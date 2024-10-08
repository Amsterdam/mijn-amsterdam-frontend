import { useEffect } from 'react';

import {
  Grid,
  Heading,
  Paragraph,
  Screen,
} from '@amsterdam/design-system-react';
import { useParams } from 'react-router-dom';

import { getThemaTitleWithAppState } from './helpers';
import styles from './HLIStadspas.module.scss';
import {
  StadspasBudget,
  StadspasBudgetTransaction,
} from '../../../server/services/hli/stadspas-types';
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
import { useDataApi } from '../../hooks/api/useDataApi';
import { usePhoneScreen } from '../../hooks/media.hook';
import { useAppStateGetter } from '../../hooks/useAppState';

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
  budgetAssignedFormatted: 'Bedrag',
};

export default function HLIStadspas() {
  const isPhoneScreen = usePhoneScreen();
  const appState = useAppStateGetter();
  const { HLI } = appState;
  const { id } = useParams<{ id: string }>();
  const stadspas = id
    ? HLI?.content?.stadspas?.find((pass) => pass.id === id)
    : null;
  const isErrorStadspas = isError(HLI);
  const isLoadingStadspas = isLoading(HLI);
  const noContent = !stadspas;

  const NAME = {
    label: 'Naam',
    content: stadspas?.owner.firstname,
  };

  const NUMBER = {
    label: 'Stadspasnummer',
    content: stadspas?.passNumberComplete,
  };

  const BALANCE = {
    label: 'Saldo',
    content: `${stadspas?.balanceFormatted} (Dit is het bedrag dat u nog kunt uitgeven)`,
  };

  const requestOptions = {
    method: 'get',
    url: stadspas?.urlTransactions,
    postpone: true,
  };

  const [transactionsApi, fetchTransactions] = useDataApi<
    ApiResponse<StadspasBudgetTransaction[]>
  >(requestOptions, apiPristineResult([]));

  const isLoadingTransacties = transactionsApi.isLoading;

  useEffect(() => {
    if (stadspas?.urlTransactions) {
      fetchTransactions({ ...requestOptions, postpone: false });
    }
  }, [fetchTransactions, stadspas?.urlTransactions]);

  const transactions =
    stadspas?.budgets && transactionsApi.data.content
      ? transactionsApi.data.content
      : [];

  const hasTransactions = !!transactionsApi.data.content?.length;

  const showMultiBudgetTransactions =
    !!stadspas?.budgets.length && stadspas.budgets.length > 1 && !isPhoneScreen;

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
                  <MaRouterLink href={AppRoutes.HLI}>
                    Naar het overzicht
                  </MaRouterLink>
                </ErrorAlert>
              )}
            </Grid.Cell>
          )}
          {!!stadspas && (
            <Grid.Cell span="all">
              <Datalist rows={[NAME]} />
              <Paragraph className={styles.StadspasNummerInfo}>
                Hieronder staat het Stadspasnummer van uw actieve pas.
                <br /> Dit pasnummer staat ook op de achterkant van uw pas.
              </Paragraph>
              <Datalist rows={[NUMBER]} />
              {!!stadspas.budgets.length && <Datalist rows={[BALANCE]} />}
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
              {!isLoadingStadspas && !!stadspas?.budgets.length && (
                <TableV2<StadspasBudget>
                  className={styles.Table_budgets}
                  items={stadspas.budgets}
                  displayProps={displayPropsBudgets}
                />
              )}
              {!isLoadingStadspas && !stadspas?.budgets.length && (
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
                  {hasTransactions ? (
                    <>
                      Hieronder ziet u bij welke winkels u het tegoed hebt
                      uitgegeven. Deze informatie kan een dag achterlopen. Maar
                      het bedrag dat u nog over heeft klopt altijd.
                    </>
                  ) : (
                    <>
                      U heeft nog geen uitgaven. Deze informatie kan een dag
                      achterlopen. Maar het bedrag dat u nog over heeft klopt
                      altijd.
                    </>
                  )}
                </Paragraph>
              )}
            </Grid.Cell>
            {!isLoadingTransacties && hasTransactions && (
              <>
                <Grid.Cell span="all">
                  <TableV2<StadspasBudgetTransaction>
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
          </>
        </Grid>
      </Screen>
    </DetailPage>
  );
}
