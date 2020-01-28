import { AppContext } from 'AppState';
import DirectLinks from 'components/DirectLinks/DirectLinks';
import { MyAreaDashboard } from 'components/MyArea/MyArea';
import MyCases from 'components/MyCases/MyCases';
import MyChaptersPanel from 'components/MyChaptersPanel/MyChaptersPanel';
import MyTips from 'components/MyTips/MyTips';
import MyNotifications from 'components/MyNotifications/MyNotifications';
import Page from 'components/Page/Page';
import PageHeading from 'components/PageHeading/PageHeading';
import { usePhoneScreen } from 'hooks/media.hook';
import React, { useContext } from 'react';

import styles from './Dashboard.module.scss';
import { Link } from 'react-router-dom';
import { AppRoutes } from 'config/Routing.constants';

const MAX_NOTIFICATIONS_VISIBLE = 3;
const MAX_TIPS_VISIBLE = 3;

export default () => {
  const {
    MELDINGEN: {
      data: { items: myNotificationItems, total: myNotificationsTotal },
      isLoading: isMyNotificationsLoading,
    },
    MY_CASES: {
      data: { items: myCases },
      isLoading: isMyCasesLoading,
    },
    MIJN_TIPS: {
      data: { items: myTips },
      isOptIn,
      isLoading: isMyTipsLoading,
      isPristine: isMyTipsPristine,
    },
    MY_CHAPTERS: { items: myChapterItems, isLoading: isMyChaptersLoading },
    MIJN_BUURT: {
      url: { simple: mapUrl },
    },
  } = useContext(AppContext);

  const tipItems = myTips.slice(0, MAX_TIPS_VISIBLE);
  const isPhoneScreen = usePhoneScreen();

  return (
    <>
      <Page
        className={styles.Dashboard}
        data-tutorial-item="Hier ziet u nieuwe berichten van onze afdelingen die uw aandacht vragen;right-top"
      >
        <PageHeading>
          <Link
            className={styles.MyNotificationsHeadingLink}
            to={AppRoutes.MELDINGEN}
          >
            Actueel
          </Link>
        </PageHeading>
        <div className={styles.TopContentContainer}>
          <MyNotifications
            total={myNotificationItems.length}
            items={myNotificationItems.slice(0, MAX_NOTIFICATIONS_VISIBLE)}
            showMoreLink={myNotificationsTotal > MAX_NOTIFICATIONS_VISIBLE}
            isLoading={isMyNotificationsLoading}
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
          isLoading={!!isMyCasesLoading}
          title="Mijn lopende aanvragen"
          data-tutorial-item="Dit is een overzicht van uw lopende aanvragen of wijzigingen;right-top"
          items={myCases}
        />

        {!isPhoneScreen && (
          <MyAreaDashboard
            url={mapUrl}
            data-tutorial-item="Hier ziet u informatie van de gemeente, bijvoorbeeld over afval, parkeren en bekendmakingen;left-top"
          />
        )}

        {!isPhoneScreen && (
          <MyTips
            data-tutorial-item="Hier geven wij u handige tips, bijvoorbeeld over de regelingen en voorzieningen van de gemeente;right-bottom"
            isLoading={isMyTipsPristine || isMyTipsLoading}
            items={tipItems}
            isOptIn={isOptIn}
            showOptIn={true}
          />
        )}
        <DirectLinks data-tutorial-item="Hier kunt u meer algemene informatie vinden over Mijn Amsterdam, bijvoorbeeld waar u terecht kunt met uw vragen;right-bottom" />
      </Page>
    </>
  );
};
