import React, { useState, useMemo } from 'react';
import { isError, isLoading } from '../../../universal/helpers';
import {
  Alert,
  ChapterIcon,
  DetailPage,
  MyNotifications,
  PageContent,
  PageHeading,
  Pagination,
} from '../../components';
import { useAppStateGetter } from '../../hooks/useAppState';
import styles from './MyNotifications.module.scss';
import { useAppStateNotifications } from '../../hooks/useNotifications';

const PAGE_SIZE = 10;
const INITIAL_INDEX = [0, PAGE_SIZE - 1];

export default () => {
  const { NOTIFICATIONS } = useAppStateGetter();
  const notifications = useAppStateNotifications();

  const [[startIndex, endIndex], setPageIndex] = useState(INITIAL_INDEX);
  const itemsPaginated = useMemo(() => {
    return notifications.slice(startIndex, endIndex + 1);
  }, [startIndex, endIndex, notifications]);

  const total = notifications.length || itemsPaginated.length;

  return (
    <DetailPage className={styles.MyNotifications}>
      <PageHeading className={styles.MainHeader} icon={<ChapterIcon />}>
        Actueel
      </PageHeading>
      <PageContent>
        {isError(NOTIFICATIONS) && (
          <Alert type="warning">
            <p>Niet alle updates kunnen op dit moment worden getoond.</p>
          </Alert>
        )}
      </PageContent>
      <MyNotifications
        isLoading={isLoading(NOTIFICATIONS)}
        items={itemsPaginated}
        noContentNotification="Er zijn op dit moment geen actuele meldingen voor u."
        trackCategory="Actueel overzicht"
      />
      {total > PAGE_SIZE && (
        <PageContent>
          <Pagination
            className={styles.Pagination}
            totalCount={total}
            pageSize={PAGE_SIZE}
            onPageClick={(page, ...index) => setPageIndex(index)}
          />
        </PageContent>
      )}
    </DetailPage>
  );
};
