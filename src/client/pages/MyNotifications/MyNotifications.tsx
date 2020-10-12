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
import { generatePath, useHistory, useParams } from 'react-router-dom';
import { AppRoutes } from '../../../universal/config/routing';

const PAGE_SIZE = 10;

export default () => {
  const { NOTIFICATIONS } = useAppStateGetter();
  const notifications = useAppStateNotifications();
  const { page = '1' } = useParams<{ page?: string }>();
  const history = useHistory();

  const initialPage = useMemo(() => {
    return parseInt(page, 10);
  }, [page]);

  const [[startIndex, endIndex], setPageIndex] = useState([
    initialPage - 1,
    PAGE_SIZE - 1,
  ]);

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
            initialPage={initialPage}
            onPageClick={(page, ...index) => {
              history.replace(generatePath(AppRoutes.NOTIFICATIONS, { page }));
              setPageIndex(index);
            }}
          />
        </PageContent>
      )}
    </DetailPage>
  );
};
