import classnames from 'classnames';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  WpiStadspasBudget,
  WpiStadspasTransaction,
} from '../../../server/services/wpi/wpi-types';
import { AppRoutes, ChapterTitles } from '../../../universal/config';
import {
  apiPristineResult,
  ApiResponse,
  directApiUrl,
  isError,
  isLoading,
} from '../../../universal/helpers';
import { defaultDateFormat } from '../../../universal/helpers/date';
import displayAmount from '../../../universal/helpers/text';
import { IconChevronRight } from '../../assets/icons';
import {
  Alert,
  Button,
  ChapterIcon,
  DetailPage,
  Heading,
  Linkd,
  LinkdInline,
  LoadingContent,
  PageContent,
  PageHeading,
} from '../../components';
import { useDataApi } from '../../hooks/api/useDataApi';
import { usePhoneScreen } from '../../hooks/media.hook';
import { useAppStateGetter } from '../../hooks/useAppState';
import styles from './StadspasDetail.module.scss';

interface TransactionProps {
  value: number;
  title: string;
  date: string;
}

function Transaction({ value, title, date }: TransactionProps) {
  return (
    <li className={styles.Transaction}>
      <time className={styles.TransactionDate} dateTime={date}>
        {defaultDateFormat(date)}
      </time>
      <span className={styles.TransactionTitle}>{title}</span>
      <span className={styles.TransactionValue}>
        {value > 0 && '+'}
        {displayAmount(value)}
      </span>
    </li>
  );
}

interface TransactionOverviewProps {
  transactions?: WpiStadspasTransaction[] | null;
}

function TransactionOverview({ transactions }: TransactionOverviewProps) {
  return (
    <div className={styles.TransactionsOverview}>
      <div className={styles.TransactionLabels}>
        <span>Winkels</span>
        <span>Bedrag</span>
      </div>
      <ul className={styles.Transactions}>
        {transactions!.map((transaction) => (
          <Transaction
            key={transaction.id}
            value={transaction.amount}
            title={transaction.title}
            date={transaction.datePublished}
          />
        ))}
      </ul>
    </div>
  );
}

interface BudgetBalanceProps {
  budget: WpiStadspasBudget;
}

function BudgetBalance({ budget }: BudgetBalanceProps) {
  const isPhoneScreen = usePhoneScreen();
  return (
    <ul className={styles.Balance}>
      <li
        className={styles.AmountSpent}
        style={{
          width: `${
            100 - (100 / budget.budgetAssigned) * budget.budgetBalance
          }%`,
        }}
      >
        <span className={styles.Label}>
          Uitgegeven &euro;{' '}
          {displayAmount(budget.budgetAssigned - budget.budgetBalance)}
        </span>
      </li>
      <li
        className={styles.AmountLeft}
        style={{
          width:
            budget.budgetAssigned === budget.budgetBalance ? '100%' : 'auto',
        }}
      >
        <span className={styles.Label}>
          {isPhoneScreen ? 'Te' : 'Nog te'} besteden vóór&nbsp;
          <time dateTime={budget.dateEnd}>
            {defaultDateFormat(budget.dateEnd)}
          </time>
          &nbsp;&euro; {displayAmount(budget.budgetBalance)}
        </span>
      </li>
    </ul>
  );
}

interface StadspasBudgetProps {
  urlTransactions: string;
  budget: WpiStadspasBudget;
  dateEnd: string;
}

function StadspasBudget({
  urlTransactions,
  budget,
  dateEnd,
}: StadspasBudgetProps) {
  const [isTransactionOverviewActive, toggleTransactionOverview] =
    useState(false);

  const [api] = useDataApi<ApiResponse<WpiStadspasTransaction[]>>(
    {
      url: directApiUrl(urlTransactions),
    },
    apiPristineResult([])
  );

  const {
    data: { content: transactions },
    isLoading: isLoadingTransactions,
    isError,
  } = api;

  return (
    <>
      <PageContent className={styles.PageContentBalance}>
        <Heading className={styles.PageContentBalanceHeading}>
          {budget.description}
        </Heading>
        <BudgetBalance budget={budget} />
      </PageContent>
      <PageContent
        className={classnames(
          styles.PageContentTransactions,
          isTransactionOverviewActive && styles.withActiveTransactionsOverview
        )}
      >
        <p>
          Hieronder ziet u bij welke winkels u geld hebt uitgegeven. Deze
          informatie kan een dag achterlopen. Maar het bedrag dat u nog over
          hebt klopt altijd.
        </p>
        {!!isTransactionOverviewActive && !isLoadingTransactions && (
          <TransactionOverview transactions={transactions} />
        )}
        {isError && (
          <Alert type="warning">
            <p>We kunnen op dit moment geen transacties tonen</p>
          </Alert>
        )}
        {!!transactions?.length ? (
          <Button
            className={classnames(
              styles.ToggleTransactionsOveview,
              isTransactionOverviewActive && styles.isTransactionOverviewActive
            )}
            icon={IconChevronRight}
            variant="plain"
            lean={true}
            onClick={() =>
              toggleTransactionOverview(!isTransactionOverviewActive)
            }
          >
            {isTransactionOverviewActive ? 'Verberg' : 'Laat zien'} wat ik heb
            uitgegeven
          </Button>
        ) : (
          !isLoadingTransactions && (
            <p className={styles.NoTransactions}>U hebt nog geen transacties</p>
          )
        )}
      </PageContent>
    </>
  );
}

export default function StadspasDetail() {
  const { WPI_STADSPAS } = useAppStateGetter();
  const { id } = useParams<{ id: string }>();
  const stadspasItem = id
    ? WPI_STADSPAS?.content?.stadspassen?.find(
        (pass) => pass.id === parseInt(id, 10)
      )
    : null;
  const isErrorStadspas = isError(WPI_STADSPAS);
  const isLoadingStadspas = isLoading(WPI_STADSPAS);
  const noContent = !stadspasItem;

  return (
    <DetailPage>
      <PageHeading
        icon={<ChapterIcon />}
        backLink={{ to: AppRoutes.STADSPAS, title: ChapterTitles.STADSPAS }}
        isLoading={false}
      >
        Saldo Stadspas
      </PageHeading>
      <PageContent className={styles.DetailPageContent}>
        <p>Hieronder ziet u hoeveel geld er nog op de Stadspas staat.</p>
        <p>
          <Linkd external={true} href="https://www.amsterdam.nl/kindtegoed">
            Meer informatie over het Kindtegoed
          </Linkd>
        </p>
        {(isErrorStadspas || (!isLoading(WPI_STADSPAS) && noContent)) && (
          <Alert type="warning">
            <p>
              We kunnen op dit moment geen gegevens tonen.{' '}
              <LinkdInline href={AppRoutes.STADSPAS}>
                Naar het overzicht
              </LinkdInline>
            </p>
          </Alert>
        )}
        {isLoadingStadspas && <LoadingContent />}
      </PageContent>
      {!!stadspasItem && (
        <PageContent className={styles.PageContentStadspasInfo}>
          <Heading size="large">{stadspasItem?.owner}</Heading>
          <p className={styles.StadspasNummer}>
            Stadspasnummer: {stadspasItem.passNumber}
          </p>
        </PageContent>
      )}
      {stadspasItem?.budgets.map((budget) => (
        <StadspasBudget
          urlTransactions={budget.urlTransactions}
          key={budget.code}
          budget={budget}
          dateEnd={stadspasItem.dateEnd}
        />
      ))}
    </DetailPage>
  );
}
