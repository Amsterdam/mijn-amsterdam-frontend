import {
  DirectLinks,
  MyChaptersPanel,
  MyNotifications,
  MyTips,
  Page,
  PageHeading,
} from '../../components';
import React, { useContext } from 'react';

import { AppContext } from '../../AppState';
import { AppRoutes } from '../../../universal/config';
import { Link } from 'react-router-dom';
import { isLoading } from '../../../universal/helpers';
import styles from './Dashboard.module.scss';
import { usePhoneScreen } from '../../hooks/media.hook';

const MAX_UPDATES_VISIBLE = 3;
const MAX_TIPS_VISIBLE = 3;

export default () => {
  const {
    UPDATES,
    // MY_CASES,
    TIPS,
    CHAPTERS: { items: myChapterItems, isLoading: isMyChaptersLoading },
    // BUURT,
  } = useContext(AppContext);

  const tipItems = TIPS.items.slice(0, MAX_TIPS_VISIBLE);
  const updateItems = UPDATES?.items.slice(0, MAX_UPDATES_VISIBLE);
  const isPhoneScreen = usePhoneScreen();
  const updatesTotal = UPDATES?.items.length || 0;

  return (
    <>
      <Page
        className={styles.Dashboard}
        data-tutorial-item="Hier ziet u nieuwe berichten van onze afdelingen die uw aandacht vragen;right-top"
      >
        <PageHeading>
          <Link
            className={styles.MyNotificationsHeadingLink}
            to={AppRoutes.UPDATES}
          >
            Actueel
          </Link>
        </PageHeading>
        <div className={styles.TopContentContainer}>
          <MyNotifications
            total={updatesTotal}
            items={updateItems}
            showMoreLink={updatesTotal > MAX_UPDATES_VISIBLE}
            isLoading={isLoading(UPDATES)}
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
        {/*
        <MyCases
          isLoading={!!isMyCasesLoading}
          title="Mijn lopende aanvragen"
          data-tutorial-item="Dit is een overzicht van uw lopende aanvragen of wijzigingen;right-top"
          items={myCases}
        />

        {!isPhoneScreen && (
          <MyAreaDashboard
            url={mapUrl}
            center={centroid}
            data-tutorial-item="Hier ziet u informatie van de gemeente, bijvoorbeeld over afval, parkeren en bekendmakingen;left-top"
          />
        )} */}

        {!isPhoneScreen && (
          <MyTips
            data-tutorial-item="Hier geven wij u handige tips, bijvoorbeeld over de regelingen en voorzieningen van de gemeente;right-bottom"
            isLoading={isLoading(TIPS)}
            items={tipItems}
            isOptIn={TIPS.isOptIn}
            showOptIn={true}
          />
        )}
        <DirectLinks data-tutorial-item="Hier kunt u meer algemene informatie vinden over Mijn Amsterdam, bijvoorbeeld waar u terecht kunt met uw vragen;right-bottom" />
      </Page>
    </>
  );
};
