import { useState } from 'react';
import { Alert, InnerHtml } from '../../components';
import { useCmsMaintenanceNotifications } from '../../hooks/api/useCmsMaintenanceNotifications';
import { Button } from '../Button/Button';
import styles from './MaintenanceNotifications.module.scss';
import Linkd from '../Button/Button';

interface MaintenanceNotificationsProps {
  path?: string;
}

export function MaintenanceNotifications({
  path,
}: MaintenanceNotificationsProps) {
  const maintenanceNotifications = useCmsMaintenanceNotifications(path);
  const [isMoreInformationVisible, setMoreInformationVisible] = useState(false);

  if (!maintenanceNotifications?.length) {
    return null;
  }

  return (
    <>
      {maintenanceNotifications.map((notification, index) => {
        return (
          <Alert type="warning" key={notification.title + index}>
            <InnerHtml className={styles.Description}>
              {notification.description}
            </InnerHtml>
            {notification.moreInformation && isMoreInformationVisible && (
              <InnerHtml className={styles.MoreInformation}>
                {notification.moreInformation}
              </InnerHtml>
            )}
            {notification.moreInformation && !isMoreInformationVisible && (
              <p>
                <Button
                  variant="inline"
                  lean={true}
                  onClick={() => setMoreInformationVisible(true)}
                >
                  Meer informatie.
                </Button>
              </p>
            )}
            {isMoreInformationVisible && notification.link && (
              <p>
                <Linkd href={notification.link.to}>
                  {notification.link.title}
                </Linkd>
              </p>
            )}
          </Alert>
        );
      })}
    </>
  );
}

export function MaintenanceNotificationsLandingPage() {
  return <MaintenanceNotifications path="/landingspagina" />;
}
