import { useEffect, useMemo } from 'react';
import { generatePath, useHistory, useParams } from 'react-router-dom';
import { AppRoutes } from '../../../universal/config';
import { isError, isLoading } from '../../../universal/helpers';
import {
  ErrorAlert,
  ChapterIcon,
  DetailPage,
  MyNotifications,
  PageContent,
  PageHeading,
  Pagination,
} from '../../components';
import { useAppStateGetter } from '../../hooks/useAppState';
import { useAppStateNotifications } from '../../hooks/useNotifications';
import styles from './MyNotifications.module.scss';

const PAGE_SIZE = 12;

export default function MyNotificationsPage() {
  const { NOTIFICATIONS } = useAppStateGetter();
  const notifications = useAppStateNotifications();
  const { page = '1' } = useParams<{ page?: string }>();
  const history = useHistory();

  const currentPage = useMemo(() => {
    if (!page) {
      return 1;
    }
    return parseInt(page, 10);
  }, [page]);

  const itemsPaginated = useMemo(() => {
    const startIndex = currentPage - 1;
    const start = startIndex * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    return notifications.slice(start, end);
  }, [currentPage, notifications]);
  const total = notifications.length;

  useEffect(() => {
    window.scrollBy({
      top: -document.documentElement.scrollTop,
      left: 0,
      behavior: 'smooth',
    });
  }, [currentPage]);

  return (
    <DetailPage className={styles.MyNotifications}>
      <PageHeading
        backLink={{
          to: AppRoutes.HOME,
          title: 'Home',
        }}
        className={styles.MainHeader}
        icon={<ChapterIcon />}
      >

        Actueel
      </PageHeading>
      <PageContent>
        {isError(NOTIFICATIONS) && (
          <ErrorAlert>
            Niet alle updates kunnen op dit moment worden getoond.
          </ErrorAlert>
        )}
      </PageContent>
      {total > PAGE_SIZE && (
        <PageContent>
          <Pagination
            className={styles.Pagination}
            totalCount={total}
            pageSize={PAGE_SIZE}
            currentPage={currentPage}
            onPageClick={(page) => {
              history.replace(generatePath(AppRoutes.NOTIFICATIONS, { page }));
            }}
          />
        </PageContent>
      )}
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
            currentPage={currentPage}
            onPageClick={(page) => {
              history.replace(generatePath(AppRoutes.NOTIFICATIONS, { page }));
            }}
          />
        </PageContent>
      )}
    </DetailPage>
  );
}
