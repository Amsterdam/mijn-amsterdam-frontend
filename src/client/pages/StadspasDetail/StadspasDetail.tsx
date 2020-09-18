import React, { useState } from 'react';
import { AppRoutes, ChapterTitles } from '../../../universal/config';
import {
  Alert,
  ChapterIcon,
  DetailPage,
  LinkdInline,
  LoadingContent,
  PageContent,
  PageHeading,
  Linkd,
  Heading,
  Button,
} from '../../components';
import styles from './StadspasDetail.module.scss';
import { useAppStateGetter } from '../../hooks/useAppState';
import { isLoading, isError } from '../../../universal/helpers';
import { useParams } from 'react-router-dom';
import { defaultDateFormat } from '../../../universal/helpers/date';
import { IconChevronRight } from '../../assets/icons';
import classnames from 'classnames';

const transactions = [
  {
    id: 'xx1',
    title: 'Hema',
    amount: '31,30',
    date: '2020-01-04',
  },
  {
    id: 'xx2',
    title: 'Aktiesport',
    amount: '21,30',
    date: '2019-12-16',
  },
  {
    id: 'xx3',
    title: 'Hema',
    amount: '24,40',
    date: '2019-10-21',
  },
];

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

export default () => {
  const { GPASS_STADSPAS } = useAppStateGetter();
  const { id } = useParams();
  const stadspasItem = GPASS_STADSPAS?.content?.find(pass => pass.id === id);
  const isErrorStadspas = isError(GPASS_STADSPAS);
  const title = 'Saldo Stadspas';
  const isLoadingStadspas = isLoading(GPASS_STADSPAS);
  const noContent = !stadspasItem;

  const [isTransactionOverviewActive, toggleTransactionOverview] = useState(
    false
  );

  return (
    <DetailPage>
      <PageHeading
        icon={<ChapterIcon />}
        backLink={{ to: AppRoutes.INKOMEN, title: ChapterTitles.INKOMEN }}
        isLoading={isLoadingStadspas}
      >
        {title}
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
        {(isErrorStadspas || noContent) && (
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
        <>
          <PageContent className={styles.PageContentBalance}>
            <Heading size="large">{stadspasItem?.naam}</Heading>
            <p className={styles.StadspasNummer}>
              Stadspasnummer: {stadspasItem.pasnummer}
            </p>
            <ul className={styles.Balance}>
              <li
                className={styles.AmountSpent}
                style={{
                  width: `${(100 / stadspasItem.totaal) * stadspasItem.saldo}%`,
                }}
              >
                <span className={styles.Label}>
                  Uitgegeven &euro;
                  {stadspasItem.totaal - stadspasItem.saldo}
                </span>
              </li>
              <li className={styles.AmountLeft}>
                <span className={styles.Label}>
                  Nog te besteden vóór&nbsp;
                  <time dateTime={stadspasItem.datumAfloop}>
                    {defaultDateFormat(stadspasItem.datumAfloop)}
                  </time>
                  &nbsp; &euro;{stadspasItem.saldo}
                </span>
              </li>
            </ul>
          </PageContent>
          <PageContent
            className={classnames(
              styles.PageContentTransactions,
              isTransactionOverviewActive &&
                styles.withActiveTransactionsOverview
            )}
          >
            {!!isTransactionOverviewActive && (
              <div className={styles.TransactionsOverview}>
                <div className={styles.TransactionLabels}>
                  <span>Uitgaven</span>
                  <span>Bedrag</span>
                </div>
                <ul className={styles.Transactions}>
                  {transactions.map(transaction => (
                    <Transaction
                      key={transaction.id}
                      value={transaction.amount}
                      title={transaction.title}
                      date={transaction.date}
                    />
                  ))}
                </ul>
              </div>
            )}
            <Button
              className={classnames(
                styles.ToggleTransactionsOveview,
                isTransactionOverviewActive &&
                  styles.isTransactionOverviewActive
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
      )}
    </DetailPage>
  );
};
