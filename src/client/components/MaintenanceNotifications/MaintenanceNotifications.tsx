import { Alert, Link, Paragraph } from '@amsterdam/design-system-react';
import classNames from 'classnames';

import styles from './MaintenanceNotifications.module.scss';
import { InnerHtml } from '../../components';
import { useCmsMaintenanceNotifications } from '../../hooks/api/useCmsMaintenanceNotifications';

interface MaintenanceNotificationsProps {
  page?: string;
  fromApiDirectly?: boolean;
}

export default function MaintenanceNotifications({
  page,
  fromApiDirectly = false,
}: MaintenanceNotificationsProps) {
  const maintenanceNotifications = useCmsMaintenanceNotifications(
    page,
    fromApiDirectly
  );

  if (!maintenanceNotifications?.length) {
    return null;
  }

  return (
    <>
      {maintenanceNotifications.map((notification, index) => {
        return (
          <Alert
            key={notification.title + index}
            severity="warning"
            heading="Onderhoudsmelding"
            className={styles.MaintenanceNotification}
          >
            <InnerHtml className={classNames(styles.Description, 'ams-mb--sm')}>
              {notification.description}
            </InnerHtml>

            {notification.link?.to && (
              <Paragraph>
                <Link href={notification.link.to}>
                  {notification.link.title}
                </Link>
              </Paragraph>
            )}
          </Alert>
        );
      })}
    </>
  );
}
