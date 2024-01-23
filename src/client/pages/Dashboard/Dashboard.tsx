import { useEffect, useMemo } from 'react';
import { Link, generatePath, useHistory } from 'react-router-dom';
import { AppRoutes } from '../../../universal/config';
import { isLoading } from '../../../universal/helpers';
import {
  DirectLinks,
  MyChaptersPanel,
  MyNotifications,
  Page,
  PageHeading,
} from '../../components';
import MyAreaDashboard from '../../components/MyArea/MyAreaDashboard';
import { usePhoneScreen } from '../../hooks/media.hook';
import { useAppStateGetter } from '../../hooks/useAppState';
import { useChapters } from '../../hooks/useChapters';
import { useAppStateNotifications } from '../../hooks/useNotifications';
import { useProfileTypeValue } from '../../hooks/useProfileType';
import styles from './Dashboard.module.scss';

const MAX_NOTIFICATIONS_VISIBLE = 6;

export default function Dashboard() {
  const appState = useAppStateGetter();
  const history = useHistory();
  const { NOTIFICATIONS } = appState;
  const notifications = useAppStateNotifications();

  const notificationItems = useMemo(() => {
    return notifications.slice(0, MAX_NOTIFICATIONS_VISIBLE);
  }, [notifications]);

  const isPhoneScreen = usePhoneScreen();
  const NOTIFICATIONSTotal = notifications.length;

  const { items: myChapterItems, isLoading: isMyChaptersLoading } =
    useChapters();

  const profileType = useProfileTypeValue();

  useEffect(() => {
    if (history.location.search) {
      history.replace(history.location.pathname);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Page className={styles.Dashboard}>
        <PageHeading>
          <Link
            className={styles.MyNotificationsHeadingLink}
            to={generatePath(AppRoutes.NOTIFICATIONS)}
          >
            Actueel
          </Link>
        </PageHeading>
        <div className={styles.TopContentContainer}>
          <MyNotifications
            items={notificationItems}
            showMoreLink={NOTIFICATIONSTotal > MAX_NOTIFICATIONS_VISIBLE}
            isLoading={isLoading(NOTIFICATIONS)}
            trackCategory="Dashboard / Actueel"
            isEmbedded={true}
          />
          <MyChaptersPanel
            isLoading={isMyChaptersLoading}
            items={myChapterItems}
            title="Mijn thema's"
            trackCategory="Dashboard / Mijn Thema's"
          />
        </div>
        {!isPhoneScreen && <MyAreaDashboard />}
        <DirectLinks profileType={profileType} />
      </Page>
    </>
  );
}
