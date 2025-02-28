import { Alert, Link, Paragraph } from '@amsterdam/design-system-react';
import classNames from 'classnames';

import styles from './MaintenanceNotifications.module.scss';
import { useCmsMaintenanceNotifications } from '../../hooks/api/useCmsMaintenanceNotifications';
import InnerHtml from '../InnerHtml/InnerHtml';

interface MaintenanceNotificationsProps {
  page?: string;
  fromApiDirectly?: boolean;
  className?: string;
}

export function MaintenanceNotifications({
  page,
  fromApiDirectly = false,
  className,
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
            className={classNames(styles.MaintenanceNotification, className)}
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
