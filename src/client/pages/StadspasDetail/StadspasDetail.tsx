import { Heading } from '@amsterdam/design-system-react';
import classnames from 'classnames';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  StadspasBudget,
  StadspasTransaction,
} from '../../../server/services/hli/stadspas-types';
import { AppRoutes, ThemaTitles } from '../../../universal/config';
import {
  ApiResponse,
  apiPristineResult,
  isError,
  isLoading,
} from '../../../universal/helpers';
import { defaultDateFormat } from '../../../universal/helpers/date';
import displayAmount from '../../../universal/helpers/text';
import { IconChevronRight } from '../../assets/icons';
import {
  Button,
  ThemaIcon,
  DetailPage,
  ErrorAlert,
  Linkd,
  LinkdInline,
  LoadingContent,
  PageContent,
  PageHeading,
  Pagination,
} from '../../components';
import { useDataApi } from '../../hooks/api/useDataApi';
import { usePhoneScreen } from '../../hooks/media.hook';
import { useAppStateGetter } from '../../hooks/useAppState';
import styles from './StadspasDetail.module.scss';

const PAGE_SIZE = 10;

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
  transactions?: StadspasTransaction[] | null;
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
  budget: StadspasBudget;
}

function BudgetBalance({ budget }: BudgetBalanceProps) {
  const isPhoneScreen = usePhoneScreen();
  return (
    <ul className={styles.Balance}>
      <li
        className={styles.AmountSpent}
        style={{
          width: `${100 - (100 / budget.budgetAssigned) * budget.budgetBalance
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
  budget: StadspasBudget;
  isTransactionOverviewActive: boolean;
  toggleTransactionOverview: () => void;
}

function CStadspasBudget({
  urlTransactions,
  budget,
  isTransactionOverviewActive,
  toggleTransactionOverview,
}: StadspasBudgetProps) {
  const [currentPage, setCurrentPage] = useState(1);

  const [api] = useDataApi<ApiResponse<StadspasTransaction[]>>(
    {
      url: urlTransactions,
    },
    apiPristineResult([])
  );

  const {
    data: { content: transactions },
    isLoading: isLoadingTransactions,
    isError,
  } = api;

  const shouldPaginate = !!transactions && transactions?.length > PAGE_SIZE;
  const startIndex = currentPage - 1;
  const start = startIndex * PAGE_SIZE;
  const end = start + PAGE_SIZE;

  const paginatedTransactions = shouldPaginate
    ? transactions?.slice(start, end)
    : transactions;

  return (
    <>
      <PageContent className={styles.PageContentBalance}>
        <Heading
          className={styles.PageContentBalanceHeading}
          level={3}
          size="level-3"
        >
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
          Hieronder ziet u bij welke winkels u het tegoed hebt uitgegeven. Deze
          informatie kan een dag achterlopen. Maar het bedrag dat u nog over
          hebt klopt altijd.
        </p>
        {!!isTransactionOverviewActive && !isLoadingTransactions && (
          <>
            <TransactionOverview transactions={paginatedTransactions} />

            {shouldPaginate && (
              <Pagination
                className={styles.Pagination}
                totalCount={transactions?.length || 0}
                pageSize={PAGE_SIZE}
                currentPage={currentPage}
                onPageClick={(page) => {
                  setCurrentPage(page);
                }}
              />
            )}
          </>
        )}
        {isError && (
          <ErrorAlert>
            We kunnen op dit moment geen transacties tonen
          </ErrorAlert>
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
            onClick={() => toggleTransactionOverview()}
          >
            {isTransactionOverviewActive ? 'Verberg' : 'Laat zien'} wat ik heb
            uitgegeven
          </Button>
        ) : (
          !isLoadingTransactions && (
            <p className={styles.NoTransactions}>
              U heeft nog geen transacties
            </p>
          )
        )}
      </PageContent>
    </>
  );
}

export default function StadspasDetail() {
  const { STADSPAS } = useAppStateGetter();
  const [openTransactionOverview, setOpenTransactionOverview] = useState<
    number | null
  >(null);
  const { id } = useParams<{ id: string }>();
  const stadspasItem = id
    ? STADSPAS?.content?.stadspassen?.find((pass) => pass.id === id)
    : null;
  const isErrorStadspas = isError(STADSPAS);
  const isLoadingStadspas = isLoading(STADSPAS);
  const noContent = !stadspasItem;

  return (
    <DetailPage>
      <PageHeading
        icon={<ThemaIcon />}
        backLink={{ to: AppRoutes.STADSPAS, title: ThemaTitles.STADSPAS }}
        isLoading={false}
      >
        Saldo Stadspas
      </PageHeading>
      <PageContent className={styles.DetailPageContent}>
        <p>Hieronder ziet u hoeveel tegoed er nog op de Stadspas staat.</p>
        <p>
          <Linkd external={true} href="https://www.amsterdam.nl/kindtegoed">
            Meer informatie over het Kindtegoed
          </Linkd>
        </p>
        {(isErrorStadspas || (!isLoading(STADSPAS) && noContent)) && (
          <ErrorAlert>
            We kunnen op dit moment geen gegevens tonen.{' '}
            <LinkdInline href={AppRoutes.STADSPAS}>
              Naar het overzicht
            </LinkdInline>
          </ErrorAlert>
        )}
        {isLoadingStadspas && <LoadingContent />}
      </PageContent>
      {!!stadspasItem && (
        <PageContent className={styles.PageContentStadspasInfo}>
          <Heading size="level-2" level={3}>
            {stadspasItem?.owner}
          </Heading>
          <p className={styles.StadspasNummer}>
            Stadspasnummer: {stadspasItem.passNumber}
          </p>
        </PageContent>
      )}
      {stadspasItem?.budgets.map((budget, index) => (
        <CStadspasBudget
          urlTransactions={budget.urlTransactions}
          key={budget.code}
          budget={budget}
          isTransactionOverviewActive={openTransactionOverview === index}
          toggleTransactionOverview={() =>
            setOpenTransactionOverview(
              index === openTransactionOverview ? null : index
            )
          }
        />
      ))}
    </DetailPage>
  );
}
