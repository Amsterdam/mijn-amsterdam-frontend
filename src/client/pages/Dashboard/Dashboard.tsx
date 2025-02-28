import { useEffect } from 'react';

import { Heading, OrderedList } from '@amsterdam/design-system-react';
import { generatePath, useHistory } from 'react-router-dom';

import styles from './Dashboard.module.scss';
import { WelcomeHeading } from './WelcomHeading';
import { AppRoutes } from '../../../universal/config/routes';
import { isLoading } from '../../../universal/helpers/api';
import LoadingContent from '../../components/LoadingContent/LoadingContent';
import { MaRouterLink } from '../../components/MaLink/MaLink';
import { MyAreaDashboard } from '../../components/MyArea/MyAreaDashboard';
import { MyNotification } from '../../components/MyNotification/MyNotification';
import { MyThemasPanel } from '../../components/MyThemasPanel/MyThemasPanel';
import {
  PageContentCell,
  PageContentV2,
  PageV2,
} from '../../components/Page/Page';
import { usePhoneScreen } from '../../hooks/media.hook';
import { useAppStateGetter } from '../../hooks/useAppState';
import { useAppStateNotifications } from '../../hooks/useNotifications';
import { useThemaMenuItems } from '../../hooks/useThemaMenuItems';

const MAX_NOTIFICATIONS_VISIBLE = 6;

export function Dashboard() {
  const appState = useAppStateGetter();
  const history = useHistory();
  const { NOTIFICATIONS } = appState;
  const { notifications, total } = useAppStateNotifications(
    MAX_NOTIFICATIONS_VISIBLE
  );

  const isPhoneScreen = usePhoneScreen();

  const { items: myThemaItems, isLoading: isMyThemasLoading } =
    useThemaMenuItems();

  useEffect(() => {
    if (history.location.search) {
      history.replace(history.location.pathname);
    }
  }, []);

  return (
    <PageV2 className={styles.Dashboard}>
      <PageContentV2>
        <WelcomeHeading />
        <PageContentCell spanWide={6}>
          <Heading level={2} size="level-3" className="ams-mb--sm">
            Recente berichten{' '}
            {total > notifications.length && (
              <MaRouterLink href={generatePath(AppRoutes.NOTIFICATIONS)}>
                Alle updates
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
                    key={`${notification.thema}-${notification.id}-${index}`}
                    className="ams-mb--sm"
                  >
                    <MyNotification
                      notification={notification}
                      trackCategory="Dashboard / Actueel"
                      smallVariant={true}
                    />
                  </OrderedList.Item>
                );
              })}
          </OrderedList>
        </PageContentCell>
        <PageContentCell startWide={8} spanWide={5}>
          <Heading level={2} size="level-3" className="ams-mb--sm">
            Mijn thema&apos;s
          </Heading>
          <MyThemasPanel
            isLoading={isMyThemasLoading}
            items={myThemaItems}
            trackCategory="Dashboard / Mijn Thema's"
          />
        </PageContentCell>
      </PageContentV2>
      {!isPhoneScreen && <MyAreaDashboard />}
    </PageV2>
  );
}
