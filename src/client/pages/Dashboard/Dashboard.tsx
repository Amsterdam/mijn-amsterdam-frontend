import { useEffect, useMemo, useRef } from 'react';
import { generatePath, Link, useHistory } from 'react-router-dom';
import { AppRoutes } from '../../../universal/config';
import { isLoading } from '../../../universal/helpers';
import {
  DirectLinks,
  MyChaptersPanel,
  MyNotifications,
  MyTips,
  Page,
  PageHeading,
} from '../../components';
import MyAreaDashboard from '../../components/MyArea/MyAreaDashboard';
import { ChapterMenuItem } from '../../config/menuItems';
import { trackItemPresentation } from '../../hooks/analytics.hook';
import { usePhoneScreen } from '../../hooks/media.hook';
import { useAppStateGetter } from '../../hooks/useAppState';
import { useChapters } from '../../hooks/useChapters';
import { useAppStateNotifications } from '../../hooks/useNotifications';
import { useProfileTypeValue } from '../../hooks/useProfileType';
import styles from './Dashboard.module.scss';

const MAX_NOTIFICATIONS_VISIBLE = 3;
const MAX_TIPS_VISIBLE = 3;

function sortAndFormatChapters(items: ChapterMenuItem[]) {
  const shortNameItems = items
    .map((item) => item.title.substring(0, 3))
    .sort((a, b) => a.localeCompare(b));
  return shortNameItems.join();
}

export default function Dashboard() {
  const appState = useAppStateGetter();
  const history = useHistory();
  const { TIPS, NOTIFICATIONS } = appState;
  const notifications = useAppStateNotifications();
  const prevChapters = useRef<string>();
  const tipItems = useMemo(() => {
    return TIPS.content?.slice(0, MAX_TIPS_VISIBLE) || [];
  }, [TIPS.content]);

  const notificationItems = useMemo(() => {
    return notifications.slice(0, MAX_NOTIFICATIONS_VISIBLE);
  }, [notifications]);

  const isPhoneScreen = usePhoneScreen();
  const NOTIFICATIONSTotal = notifications.length;

  const { items: myChapterItems, isLoading: isMyChaptersLoading } =
    useChapters();

  const profileType = useProfileTypeValue();

  useEffect(() => {
    if (myChapterItems.length && !isMyChaptersLoading) {
      const chapterEventName = sortAndFormatChapters(myChapterItems);
      if (chapterEventName !== prevChapters.current) {
        prevChapters.current = chapterEventName;
        trackItemPresentation(
          'Tonen themas overzicht',
          chapterEventName,
          profileType
        );
      }
    }
  }, [myChapterItems, profileType, isMyChaptersLoading]);

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
        <MyTips
          isLoading={isLoading(TIPS)}
          items={tipItems}
          isEmbedded={true}
        />

        <DirectLinks profileType={profileType} />
      </Page>
    </>
  );
}
