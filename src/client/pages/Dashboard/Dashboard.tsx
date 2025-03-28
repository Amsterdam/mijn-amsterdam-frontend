import { useEffect } from 'react';

import {
  Grid,
  Heading,
  OrderedList,
  Screen,
} from '@amsterdam/design-system-react';
import { generatePath, useHistory } from 'react-router-dom';

import styles from './Dashboard.module.scss';
import { AppRoutes } from '../../../universal/config/routes';
import { isLoading } from '../../../universal/helpers/api';
import { getFullName } from '../../../universal/helpers/brp';
import { LoadingContent, Page } from '../../components';
import { MaRouterLink } from '../../components/MaLink/MaLink';
import MyAreaDashboard from '../../components/MyArea/MyAreaDashboard';
import { MyNotification } from '../../components/MyNotification/MyNotification';
import { MyThemasPanel } from '../../components/MyThemasPanel/MyThemasPanel';
import { usePhoneScreen } from '../../hooks/media.hook';
import { useAppStateGetter } from '../../hooks/useAppState';
import { useAppStateNotifications } from '../../hooks/useNotifications';
import { useProfileTypeValue } from '../../hooks/useProfileType';
import { useThemaMenuItems } from '../../hooks/useThemaMenuItems';

const MAX_NOTIFICATIONS_VISIBLE = 6;

export function Dashboard() {
  const appState = useAppStateGetter();
  const history = useHistory();
  const { NOTIFICATIONS, BRP } = appState;
  const { notifications, total } = useAppStateNotifications(
    MAX_NOTIFICATIONS_VISIBLE
  );

  const isPhoneScreen = usePhoneScreen();

  const { items: myThemaItems, isLoading: isMyThemasLoading } =
    useThemaMenuItems();

  const profileType = useProfileTypeValue();

  useEffect(() => {
    if (history.location.search) {
      history.replace(history.location.pathname);
    }
  }, []);

  return (
    <Page>
      <Screen>
        <Grid>
          <Grid.Cell span="all">
            <div className={styles.Welcome}>
              <Heading className={styles.WelcomeHeading} level={3}>
                Goedemorgen,
                <br />{' '}
                {BRP.content?.persoon ? getFullName(BRP.content?.persoon) : ''}
              </Heading>
            </div>
          </Grid.Cell>
          <Grid.Cell start={1} span={6}>
            <Heading level={2} className="ams-mb--sm">
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
          </Grid.Cell>
          <Grid.Cell start={7} span={6}>
            <Heading level={2} className="ams-mb--sm">
              Mijn thema&apos;s
            </Heading>
            <MyThemasPanel
              isLoading={isMyThemasLoading}
              items={myThemaItems}
              trackCategory="Dashboard / Mijn Thema's"
            />
          </Grid.Cell>
        </Grid>
      </Screen>
      {!isPhoneScreen && <MyAreaDashboard />}
    </Page>
  );
}
