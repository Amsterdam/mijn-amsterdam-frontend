import { useEffect } from 'react';

import { Heading, OrderedList } from '@amsterdam/design-system-react';
import { useLocation, useNavigate } from 'react-router';

import { DASHBOARD_PAGE_DOCUMENT_TITLE } from './Dashboard-config.ts';
import styles from './Dashboard.module.scss';
import { DashboardHeader } from './DashboardHeader.tsx';
import { WelcomeHeading } from './WelcomHeading.tsx';
import { isLoading } from '../../../universal/helpers/api.ts';
import LoadingContent from '../../components/LoadingContent/LoadingContent.tsx';
import { MaRouterLink } from '../../components/MaLink/MaLink.tsx';
import { MyAreaDashboard } from '../../components/MyArea/MyAreaDashboard.tsx';
import { MyNotification } from '../../components/MyNotification/MyNotification.tsx';
import { MyThemasPanel } from '../../components/MyThemasPanel/MyThemasPanel.tsx';
import {
  PageContentCell,
  PageContentV2,
  PageV2,
} from '../../components/Page/Page.tsx';
import { useSmallScreen } from '../../hooks/media.hook.ts';
import { useAppStateGetter } from '../../hooks/useAppState.ts';
import { useHTMLDocumentTitle } from '../../hooks/useHTMLDocumentTitle.ts';
import { useAppStateNotifications } from '../../hooks/useNotifications.ts';
import { useThemaMenuItems } from '../../hooks/useThemaMenuItems.ts';
import { myNotificationsMenuItem } from '../MyNotifications/MyNotifications-routes.ts';
import { themaTitle as notificationsThemaTitle } from '../MyNotifications/MyNotifications-config.ts';

const MAX_NOTIFICATIONS_VISIBLE = 6;

export function Dashboard() {
  useHTMLDocumentTitle({
    documentTitle: DASHBOARD_PAGE_DOCUMENT_TITLE,
  });

  const appState = useAppStateGetter();
  const location = useLocation();
  const navigate = useNavigate();
  const { NOTIFICATIONS } = appState;
  const { notifications, total } = useAppStateNotifications(
    MAX_NOTIFICATIONS_VISIBLE
  );

  const isPhoneScreen = useSmallScreen();

  const { items: myThemaItems, isLoading: isMyThemasLoading } =
    useThemaMenuItems();

  useEffect(() => {
    if (location.search) {
      navigate(location.pathname, { replace: true });
    }
  }, []);

  return (
    <PageV2 className={styles.Dashboard}>
      {!isPhoneScreen && <DashboardHeader />}
      <PageContentV2 id="skip-to-id-AppContent">
        <PageContentCell startWide={2} spanWide={10}>
          <WelcomeHeading />
        </PageContentCell>
        <PageContentCell startWide={2} spanWide={5}>
          <Heading level={2} size="level-3" className="ams-mb-m">
            Recente berichten{' '}
            {total > notifications.length && (
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
                    className="ams-mb-m"
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
          <Heading level={2} size="level-3" className="ams-mb-m">
            Mijn thema&apos;s
          </Heading>
          <MyThemasPanel isLoading={isMyThemasLoading} items={myThemaItems} />
        </PageContentCell>
      </PageContentV2>
      {!isPhoneScreen && <MyAreaDashboard />}
    </PageV2>
  );
}
