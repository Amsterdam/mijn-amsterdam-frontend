import { useEffect, useState } from 'react';

import { Grid, Heading, OrderedList } from '@amsterdam/design-system-react';
import { useLocation, useNavigate } from 'react-router';

import { DASHBOARD_PAGE_DOCUMENT_TITLE } from './Dashboard-config.ts';
import styles from './Dashboard.module.scss';
import { DashboardHeader } from './DashboardHeader.tsx';
import { WelcomeHeading } from './WelcomHeading.tsx';
import { isLoading } from '../../../../../universal/helpers/api.ts';
import { LoadingContent } from '../../../../components/LoadingContent/LoadingContent.tsx';
import { MaLink, MaRouterLink } from '../../../../components/MaLink/MaLink.tsx';
import { MyAreaDashboard } from '../../../../components/MyArea/MyAreaDashboard.tsx';
import { MyNotification } from '../../../../components/MyNotification/MyNotification.tsx';
import { MyThemasPanel } from '../../../../components/MyThemasPanel/MyThemasPanel.tsx';
import { PageContentCell, PageV2 } from '../../../../components/Page/Page.tsx';
import {
  TipCard,
  tipCardColors,
} from '../../../../components/TipCard/TipCard.tsx';
import { getRedactedClass } from '../../../../helpers/cobrowse.ts';
import { useSmallScreen } from '../../../../hooks/media.hook.ts';
import { useAppStateGetter } from '../../../../hooks/useAppStateStore.ts';
import { useHTMLDocumentTitle } from '../../../../hooks/useHTMLDocumentTitle.ts';
import { useAppStateNotifications } from '../../../../hooks/useNotifications.ts';
import { useActiveThemaMenuItems } from '../../../../hooks/useThemaMenuItems.ts';
import { featureToggle } from '../../../../pages/Tips/tips-config.ts';
import { myNotificationsMenuItem } from '../MyNotifications/MyNotifications-routes.ts';
import { AfsprakenDashboard } from '../Thema/KlantContact/Afspraken/Afspraken.tsx';
import { useKlantcontactData } from '../Thema/KlantContact/useKlantcontactData.hook.tsx';

const MAX_NOTIFICATIONS_VISIBLE = 6;

export function Dashboard() {
  useHTMLDocumentTitle({
    documentTitle: DASHBOARD_PAGE_DOCUMENT_TITLE,
  });

  const appState = useAppStateGetter();
  const location = useLocation();
  const navigate = useNavigate();
  const { NOTIFICATIONS } = appState;
  const { notifications, tips, notificationsTotal } = useAppStateNotifications(
    MAX_NOTIFICATIONS_VISIBLE
  );

  const isPhoneScreen = useSmallScreen();

  const { items: myThemaItems, isLoading: isMyThemasLoading } =
    useActiveThemaMenuItems();
  const { afspraken, isLoading: isKlantcontactLoading } = useKlantcontactData();
  const hasAfspraken = afspraken.length > 0;
  const hasTips = tips && tips.length > 0;

  // We only want to run this on mount.
  useEffect(() => {
    if (location.search) {
      navigate(location.pathname, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [readTipIds, setReadTipIds] = useState<string[]>([]);

  const visibleTips = tips
    ?.map((tip, tipIndex) => ({
      tip,
      colorIndex: tipIndex % tipCardColors.length,
    }))
    .filter(({ tip }) => !readTipIds.includes(tip.id))
    .slice(0, 3);

  const markAsRead = (tipId: string) => {
    setReadTipIds((currentIds) =>
      currentIds.includes() ? currentIds : [...currentIds, tipId]
    );

    // TODO: MIJN-12460: Actually mark the tip as read.
  };

  return (
    <>
      {!isPhoneScreen && <DashboardHeader />}
      <PageV2
        className={styles.Dashboard}
        heading={<WelcomeHeading />}
        showBreadcrumbs={false}
        showUserFeedback
        userFeedbackDetails={{
          pageTitle: 'Dashboard',
        }}
      >
        <PageContentCell
          spanWide={7}
          className={getRedactedClass(null, 'full')}
        >
          {isKlantcontactLoading && <LoadingContent className="ams-mb-l" />}
          {!isKlantcontactLoading && hasAfspraken && (
            <AfsprakenDashboard afspraken={afspraken} className="ams-mb-l" />
          )}

          <Heading level={2} className="ams-mb-m">
            Recente berichten{' '}
            {notificationsTotal > notifications.length && (
              <MaRouterLink
                className={styles.LinkToNotifications}
                href={myNotificationsMenuItem.to}
              >
                Toon alle
              </MaRouterLink>
            )}
          </Heading>
          <OrderedList markers={false}>
            {isLoading(NOTIFICATIONS) && (
              <OrderedList.Item>
                <LoadingContent />
              </OrderedList.Item>
            )}
            {!isLoading(NOTIFICATIONS) &&
              notifications.map((notification, index) => {
                return (
                  <OrderedList.Item
                    key={`${notification.themaID}-${notification.id}-${index}`}
                    className={`ams-mb-m ${notification.className}`}
                  >
                    <MyNotification
                      notification={notification}
                      trackCategory="Dashboard / Actueel"
                    />
                  </OrderedList.Item>
                );
              })}
          </OrderedList>
        </PageContentCell>
        <PageContentCell startWide={8} spanWide={5}>
          <Heading level={2} className="ams-mb-m">
            Mijn thema&apos;s
          </Heading>
          <MyThemasPanel isLoading={isMyThemasLoading} items={myThemaItems} />
        </PageContentCell>
        {featureToggle.newTipsDesign && hasTips && (
          <Grid.Subgrid as="ul" span="all" gapVertical="large">
            {visibleTips?.map(({ colorIndex, tip }) => (
              <Grid.Cell as="li" span={4} key={tip.id}>
                <TipCard
                  backgroundColor={tipCardColors[colorIndex]}
                  description={tip.description}
                  heading={tip.title}
                  link={tip.link}
                  onClick={() => markAsRead(tip.id)}
                  tipReason={tip.tipReason}
                />
              </Grid.Cell>
            ))}
            <Grid.Cell span="all">
              <MaLink href="/alle-tips">Toon alle tips</MaLink>
            </Grid.Cell>
          </Grid.Subgrid>
        )}
        {!isPhoneScreen && (
          <PageContentCell>
            <MyAreaDashboard />
          </PageContentCell>
        )}
      </PageV2>
    </>
  );
}
