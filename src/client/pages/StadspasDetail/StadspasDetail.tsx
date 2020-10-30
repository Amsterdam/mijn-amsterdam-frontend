import classnames from 'classnames';
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FocusStadspasTransaction } from '../../../server/services/focus/focus-stadspas';
import { AppRoutes, ChapterTitles } from '../../../universal/config';
import {
  isError,
  isLoading,
  apiPristineResult,
  ApiResponse,
  directApiUrl,
} from '../../../universal/helpers';
import { defaultDateFormat } from '../../../universal/helpers/date';
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
import { useAppStateGetter } from '../../hooks/useAppState';
import styles from './StadspasDetail.module.scss';
import { FocusStadspasBudget } from '../../../server/services/focus/focus-combined';
import { useDataApi } from '../../hooks/api/useDataApi';

interface TransactionProps {
  value: string;
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
      <span className={styles.TransactionValue}>&euro; {value}</span>
    </li>
  );
}

interface TransactionOverviewProps {
  transactions: FocusStadspasTransaction[];
}

function TransactionOverview({ transactions }: TransactionOverviewProps) {
  return (
    <div className={styles.TransactionsOverview}>
      <div className={styles.TransactionLabels}>
        <span>Uitgaven</span>
        <span>Bedrag</span>
      </div>
      <ul className={styles.Transactions}>
        {transactions.map((transaction) => (
          <Transaction
            key={transaction.id}
            value={transaction.amount}
            title={transaction.title}
            date={transaction.date}
          />
        ))}
      </ul>
    </div>
  );
}

interface BudgetBalanceProps {
  budget: FocusStadspasBudget;
  dateEnd: string;
}

function BudgetBalance({ budget, dateEnd }: BudgetBalanceProps) {
  return (
    <ul className={styles.Balance}>
      <li
        className={styles.AmountSpent}
        style={{
          width: `${(100 / budget.assigned) * budget.balance}%`,
        }}
      >
        <span className={styles.Label}>
          Uitgegeven &euro;
          {budget.assigned - budget.balance}
        </span>
      </li>
      <li className={styles.AmountLeft}>
        <span className={styles.Label}>
          Nog te besteden vóór&nbsp;
          <time dateTime={dateEnd}>{defaultDateFormat(dateEnd)}</time>
          &nbsp; &euro;{budget.balance}
        </span>
      </li>
    </ul>
  );
}

interface StadspasBudgetProps {
  urlTransactions: string;
  budget: FocusStadspasBudget;
  dateEnd: string;
}

function StadspasBudget({
  urlTransactions,
  budget,
  dateEnd,
}: StadspasBudgetProps) {
  const [isTransactionOverviewActive, toggleTransactionOverview] = useState(
    false
  );

  const [
    {
      data: { content: transactions },
      isLoading: isLoadingTransactions,
      isDirty,
    },
    fetchTransactions,
  ] = useDataApi<ApiResponse<FocusStadspasTransaction[]>>(
    {
      url: directApiUrl(urlTransactions),
      postpone: true,
    },
    apiPristineResult([])
  );

  useEffect(() => {
    if (isTransactionOverviewActive && !isDirty) {
      fetchTransactions();
    }
  }, [isTransactionOverviewActive, fetchTransactions, isDirty]);

  return (
    <>
      <PageContent className={styles.PageContentBalance}>
        <BudgetBalance budget={budget} dateEnd={dateEnd} />
      </PageContent>
      <PageContent
        className={classnames(
          styles.PageContentTransactions,
          isTransactionOverviewActive && styles.withActiveTransactionsOverview
        )}
      >
        {!!isTransactionOverviewActive &&
          !isLoadingTransactions &&
          transactions !== null && (
            <TransactionOverview transactions={transactions} />
          )}
        {isLoadingTransactions && (
          <LoadingContent
            barConfig={[
              ['100%', '2rem', '1rem'],
              ['80%', '2rem', '1rem'],
              ['60%', '2rem', '1rem'],
            ]}
          />
        )}
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
      </PageContent>
    </>
  );
}

export default () => {
  const { FOCUS_STADSPAS } = useAppStateGetter();
  const { id } = useParams<{ id: string }>();
  const stadspasItem = id
    ? FOCUS_STADSPAS?.content?.find((pass) => pass.id === parseInt(id, 10))
    : null;
  const isErrorStadspas = isError(FOCUS_STADSPAS);
  const isLoadingStadspas = isLoading(FOCUS_STADSPAS);
  const noContent = !stadspasItem;

  return (
    <DetailPage>
      <PageHeading
        icon={<ChapterIcon />}
        backLink={{ to: AppRoutes.INKOMEN, title: ChapterTitles.INKOMEN }}
        isLoading={false}
      >
        Saldo Stadspas
      </PageHeading>
      <PageContent className={styles.DetailPageContent}>
        <p>
          U mag voor uw kind een bepaald bedrag uitgeven aan kleding en sport.
          Hieronder ziet u hoeveel u nog te besteden hebt.
        </p>
        <p>
          <Linkd
            external={true}
            href="https://www.amsterdam.nl/toerisme-vrije-tijd/stadspas/"
          >
            Meer informatie over de stadspas
          </Linkd>
        </p>
        {(isErrorStadspas || (!isLoading(FOCUS_STADSPAS) && noContent)) && (
          <Alert type="warning">
            <p>
              We kunnen op dit moment geen gegevens tonen.{' '}
              <LinkdInline href={AppRoutes.INKOMEN}>
                Naar het overzicht
              </LinkdInline>
            </p>
          </Alert>
        )}
        {isLoadingStadspas && <LoadingContent />}
      </PageContent>
      {!!stadspasItem && (
        <PageContent className={styles.PageContentBalance}>
          <Heading size="large">{stadspasItem?.naam}</Heading>
          <p className={styles.StadspasNummer}>
            Stadspasnummer: {stadspasItem.pasnummer}
          </p>
        </PageContent>
      )}
      {stadspasItem?.budgets.map((budget) => (
        <StadspasBudget
          urlTransactions={stadspasItem.urlTransactions}
          key={budget.title}
          budget={budget}
          dateEnd={stadspasItem.datumAfloop}
        />
      ))}
    </DetailPage>
  );
};
