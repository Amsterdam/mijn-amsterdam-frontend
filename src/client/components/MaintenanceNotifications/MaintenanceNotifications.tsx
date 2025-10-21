import { Alert, Link, Paragraph } from '@amsterdam/design-system-react';
import classNames from 'classnames';

import styles from './MaintenanceNotifications.module.scss';
import { parseHTML } from '../../helpers/html-react-parse';
import { useCmsMaintenanceNotifications } from '../../hooks/api/useCmsMaintenanceNotifications';

interface MaintenanceNotificationsProps {
  page: string;
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
            headingLevel={4}
            className={classNames(styles.MaintenanceNotification, className)}
          >
            {parseHTML(notification.description)}
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
