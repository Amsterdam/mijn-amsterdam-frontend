import classnames from 'classnames';
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { FocusStadspasBudget } from '../../../server/services/focus/focus-combined';
import { FocusStadspasTransaction } from '../../../server/services/focus/focus-stadspas';
import { AppRoutes, ChapterTitles } from '../../../universal/config';
import {
  apiPristineResult,
  ApiResponse,
  directApiUrl,
  isError,
  isLoading,
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
import { useDataApi } from '../../hooks/api/useDataApi';
import { usePhoneScreen } from '../../hooks/media.hook';
import { useAppStateGetter } from '../../hooks/useAppState';
import styles from './StadspasDetail.module.scss';
import displayAmount from '../../../universal/helpers/text';

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
      <span className={styles.TransactionValue}>{displayAmount(value)}</span>
    </li>
  );
}

interface TransactionOverviewProps {
  transactions?: FocusStadspasTransaction[] | null;
}

function TransactionOverview({ transactions }: TransactionOverviewProps) {
  return (
    <div className={styles.TransactionsOverview}>
      <div className={styles.TransactionLabels}>
        <span>Winkels</span>
        <span>Bedrag</span>
      </div>
      <ul className={styles.Transactions}>
        {transactions!.map(transaction => (
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
  const isPhoneScreen = usePhoneScreen();
  return (
    <ul className={styles.Balance}>
      <li
        className={styles.AmountSpent}
        style={{
          width: `${100 - (100 / budget.assigned) * budget.balance}%`,
        }}
      >
        <span className={styles.Label}>
          Uitgegeven &euro;{displayAmount(budget.assigned - budget.balance)}
        </span>
      </li>
      <li
        className={styles.AmountLeft}
        style={{
          width: budget.assigned === budget.balance ? '100%' : 'auto',
        }}
      >
        <span className={styles.Label}>
          {isPhoneScreen ? 'Te' : 'Nog te'} besteden vóór&nbsp;
          <time dateTime={dateEnd}>{defaultDateFormat(dateEnd)}</time>
          &nbsp;&euro;{displayAmount(budget.balance)}
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

  const [api] = useDataApi<ApiResponse<FocusStadspasTransaction[]>>(
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
        <BudgetBalance budget={budget} dateEnd={dateEnd} />
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

export default () => {
  const { FOCUS_STADSPAS } = useAppStateGetter();
  const { id } = useParams<{ id: string }>();
  const stadspasItem = id
    ? FOCUS_STADSPAS?.content?.stadspassen.find(
        pass => pass.id === parseInt(id, 10)
      )
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
        <p>Hieronder ziet u hoeveel geld er nog op de Stadspas staat.</p>
        <p>
          <Linkd external={true} href="https://www.amsterdam.nl/kindtegoed">
            Meer informatie over het Kindtegoed
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
        <PageContent className={styles.PageContentStadspasInfo}>
          <Heading size="large">{stadspasItem?.naam}</Heading>
          <p className={styles.StadspasNummer}>
            Stadspasnummer: {stadspasItem.pasnummer}
          </p>
        </PageContent>
      )}
      {stadspasItem?.budgets.map(budget => (
        <StadspasBudget
          urlTransactions={budget.urlTransactions}
          key={budget.code}
          budget={budget}
          dateEnd={stadspasItem.datumAfloop}
        />
      ))}
    </DetailPage>
  );
};
