import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { AppRoutes } from '../../../universal/config';
import { isLoading } from '../../../universal/helpers';
import {
  DirectLinks,
  MyAreaDashboard,
  MyCases,
  MyChaptersPanel,
  MyNotifications,
  MyTips,
  Page,
  PageHeading,
} from '../../components';
import { usePhoneScreen } from '../../hooks/media.hook';
import {
  useAppStateGetter,
  useAppStateNotifications,
} from '../../hooks/useAppState';
import { useChapters } from '../../hooks/useChapters';
import styles from './Dashboard.module.scss';
import { useProfileTypeValue } from '../../hooks/useProfileType';

const MAX_NOTIFICATIONS_VISIBLE = 3;
const MAX_TIPS_VISIBLE = 3;

export default () => {
  const appState = useAppStateGetter();
  const { TIPS, NOTIFICATIONS, CASES, BUURT, HOME, BRP, KVK } = appState;
  const notifications = useAppStateNotifications();
  const profileType = useProfileTypeValue();

  const tipItems = useMemo(() => {
    return TIPS.content?.slice(0, MAX_TIPS_VISIBLE) || [];
  }, [TIPS.content]);

  const notificationItems = useMemo(() => {
    return notifications.slice(0, MAX_NOTIFICATIONS_VISIBLE);
  }, [notifications]);

  const isPhoneScreen = usePhoneScreen();
  const NOTIFICATIONSTotal = notifications.length;

  const {
    items: myChapterItems,
    isLoading: isMyChaptersLoading,
  } = useChapters();

  return (
    <>
      <Page
        className={styles.Dashboard}
        data-tutorial-item="Hier ziet u nieuwe berichten van onze afdelingen;right-top"
      >
        <PageHeading>
          <Link
            className={styles.MyNotificationsHeadingLink}
            to={AppRoutes.NOTIFICATIONS}
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
          />
          <MyChaptersPanel
            isLoading={isMyChaptersLoading}
            items={myChapterItems}
            title="Mijn thema's"
            data-tutorial-item="Over deze onderwerpen hebben wij informatie voor u;right-top"
            trackCategory="Dashboard / Mijn Thema's"
          />
        </div>

        <MyCases
          isLoading={isLoading(CASES)}
          title="Mijn lopende aanvragen"
          data-tutorial-item="Hier staan de aanvragen waar de gemeente nog een besluit over moet nemen;right-top"
          items={CASES.content!}
        />

        {!isPhoneScreen && (
          <MyAreaDashboard
            url={BUURT.content?.embed.simple}
            center={HOME.content?.latlng}
            address={
              profileType === 'private'
                ? BRP.content?.adres
                : KVK.content?.hoofdAdres
            }
            data-tutorial-item="Op deze kaart ziet u informatie van de gemeente, bijvoorbeeld over afval, parkeren en vergunningen;left-top"
          />
        )}

        {!isPhoneScreen && (
          <MyTips
            data-tutorial-item="Hier geven wij u handige tips, bijvoorbeeld over regelingen van de gemeente;right-bottom"
            isLoading={isLoading(TIPS)}
            items={tipItems}
          />
        )}
        <DirectLinks data-tutorial-item="Hier staan links naar andere websites;right-bottom" />
      </Page>
    </>
  );
};
