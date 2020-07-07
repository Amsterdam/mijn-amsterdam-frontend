import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AppRoutes } from '../../../universal/config';
import { isLoading } from '../../../universal/helpers';
import { AppContext } from '../../AppState';
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
import { getMyChapters } from '../../helpers/chapters';
import { usePhoneScreen } from '../../hooks/media.hook';
import styles from './Dashboard.module.scss';

const MAX_NOTIFICATIONS_VISIBLE = 3;
const MAX_TIPS_VISIBLE = 3;

export default () => {
  const appState = useContext(AppContext);
  const { TIPS, NOTIFICATIONS, CASES, BUURT, HOME } = appState;

  const tipItems = TIPS.content?.items.slice(0, MAX_TIPS_VISIBLE) || [];
  const notificationItems =
    NOTIFICATIONS.content?.slice(0, MAX_NOTIFICATIONS_VISIBLE) || [];
  const isPhoneScreen = usePhoneScreen();
  const NOTIFICATIONSTotal = NOTIFICATIONS.content?.length || 0;

  const {
    items: myChapterItems,
    isLoading: isMyChaptersLoading,
  } = getMyChapters(appState);

  return (
    <>
      <Page
        className={styles.Dashboard}
        data-tutorial-item="Hier ziet u nieuwe berichten van onze afdelingen die uw aandacht vragen;right-top"
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
            data-tutorial-item="Dit zijn de onderwerpen waarover u iets heeft bij de gemeente;right-top"
            trackCategory="Dashboard / Mijn Thema's"
          />
        </div>

        <MyCases
          isLoading={isLoading(CASES)}
          title="Mijn lopende aanvragen"
          data-tutorial-item="Dit is een overzicht van uw lopende aanvragen of wijzigingen;right-top"
          items={CASES.content!}
        />

        {!isPhoneScreen && (
          <MyAreaDashboard
            url={BUURT.content?.embed.simple}
            center={HOME.content?.latlng}
            data-tutorial-item="Hier ziet u informatie van de gemeente, bijvoorbeeld over afval, parkeren en bekendmakingen;left-top"
          />
        )}

        {!isPhoneScreen && (
          <MyTips
            data-tutorial-item="Hier geven wij u handige tips, bijvoorbeeld over de regelingen en voorzieningen van de gemeente;right-bottom"
            isLoading={isLoading(TIPS)}
            items={tipItems}
          />
        )}
        <DirectLinks data-tutorial-item="Hier kunt u meer algemene informatie vinden over Mijn Amsterdam, bijvoorbeeld waar u terecht kunt met uw vragen;right-bottom" />
      </Page>
    </>
  );
};
