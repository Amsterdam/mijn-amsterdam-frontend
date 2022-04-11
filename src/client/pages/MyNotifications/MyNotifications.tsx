import { useEffect, useMemo, useRef } from 'react';
import { generatePath, useHistory, useParams } from 'react-router-dom';
import { AppRoutes } from '../../../universal/config';
import { isError, isLoading } from '../../../universal/helpers';
import { MyNotification } from '../../../universal/types';
import {
  Alert,
  ChapterIcon,
  DetailPage,
  MyNotifications,
  PageContent,
  PageHeading,
  Pagination,
} from '../../components';
import {
  WelcomeNotification2,
  WelcomeNotification2Commercial,
} from '../../config/staticData';
import { trackItemPresentation } from '../../hooks';
import { useAppStateGetter } from '../../hooks/useAppState';
import { useAppStateNotifications } from '../../hooks/useNotifications';
import { useProfileTypeValue } from '../../hooks/useProfileType';
import { useUserCity } from '../../hooks/useUserCity';
import styles from './MyNotifications.module.scss';

const PAGE_SIZE = 10;

export default function MyNotificationsPage() {
  const { NOTIFICATIONS } = useAppStateGetter();
  const notifications = useAppStateNotifications();
  const { page = '1' } = useParams<{ page?: string }>();
  const history = useHistory();
  const welcomNotificationShown = useRef<boolean>(false);
  const userCity = useUserCity();
  const profileType = useProfileTypeValue();

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

  useEffect(() => {}, [itemsPaginated]);

  if (
    itemsPaginated.some(
      (n: MyNotification) =>
        n.id === WelcomeNotification2.id ||
        n.id === WelcomeNotification2Commercial.id
    ) &&
    !welcomNotificationShown.current
  ) {
    // Send matomo event
    // Ony once though
    welcomNotificationShown.current = true;
    trackItemPresentation(
      'Actueel',
      'Welkom weespers melding',
      profileType,
      userCity
    );
    console.log('userCity', userCity);
  }

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
          <Alert type="warning">
            <p>Niet alle updates kunnen op dit moment worden getoond.</p>
          </Alert>
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
