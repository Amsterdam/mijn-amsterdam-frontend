import { Heading, OrderedList } from '@amsterdam/design-system-react';

import { DASHBOARD_PAGE_DOCUMENT_TITLE } from './Dashboard-config';
import styles from './Dashboard.module.scss';
import { DashboardHeader } from './DashboardHeader';
import { WelcomeHeading } from './WelcomHeading';
import { isLoading } from '../../../universal/helpers/api';
import LoadingContent from '../../components/LoadingContent/LoadingContent';
import { MaRouterLink } from '../../components/MaLink/MaLink';
import { MyAreaDashboard } from '../../components/MyArea/MyAreaDashboard';
import { MyNotification } from '../../components/MyNotification/MyNotification';
import { MyThemasPanel } from '../../components/MyThemasPanel/MyThemasPanel';
import { PageContentCell, PageV2 } from '../../components/Page/Page';
import { useSmallScreen } from '../../hooks/media.hook';
import { useAppStateGetter } from '../../hooks/useAppStateStore';
import { useHTMLDocumentTitle } from '../../hooks/useHTMLDocumentTitle';
import { useAppStateNotifications } from '../../hooks/useNotifications';
import { useActiveThemaMenuItems } from '../../hooks/useThemaMenuItems';
import { myNotificationsMenuItem } from '../MyNotifications/MyNotifications-routes';

const MAX_NOTIFICATIONS_VISIBLE = 6;

export function Dashboard() {
  useHTMLDocumentTitle({
    documentTitle: DASHBOARD_PAGE_DOCUMENT_TITLE,
  });

  const appState = useAppStateGetter();
  const { NOTIFICATIONS } = appState;
  const { notifications, total } = useAppStateNotifications(
    MAX_NOTIFICATIONS_VISIBLE
  );

  const isPhoneScreen = useSmallScreen();

  const { items: myThemaItems, isLoading: isMyThemasLoading } =
    useActiveThemaMenuItems();

  return (
    <>
      {!isPhoneScreen && <DashboardHeader />}
      <PageV2
        className={styles.Dashboard}
        heading={<WelcomeHeading />}
        showBreadcrumbs={false}
      >
        <PageContentCell spanWide={7}>
          <Heading level={2} className="ams-mb-m">
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
        {!isPhoneScreen && (
          <PageContentCell>
            <MyAreaDashboard />
          </PageContentCell>
        )}
      </PageV2>
    </>
  );
}
