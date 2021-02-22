import { useState } from 'react';
import { Alert } from '../../components';
import { useCmsMaintenanceNotifications } from '../../hooks/api/useCmsMaintenanceNotifications';
import { Button } from '../Button/Button';
import styles from './MaintenanceNotifications.module.scss';

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
      {maintenanceNotifications.map((notification) => {
        return (
          <Alert type="warning">
            <p className={styles.description}>
              {notification.description}{' '}
              {notification.moreInformation && !isMoreInformationVisible && (
                <Button
                  variant="inline"
                  lean={true}
                  onClick={() => setMoreInformationVisible(true)}
                >
                  Meer informatie.
                </Button>
              )}
            </p>
            {notification.moreInformation && isMoreInformationVisible && (
              <p className={styles.moreInformation}>
                {notification.moreInformation}
              </p>
            )}
          </Alert>
        );
      })}
    </>
  );
}

export function MaintenanceNotificationsLandingPage() {
  return <MaintenanceNotifications path="/" />;
}
