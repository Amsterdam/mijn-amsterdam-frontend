import { Alert, Link, Paragraph } from '@amsterdam/design-system-react';
import classNames from 'classnames';

import styles from './MaintenanceNotifications.module.scss';
import { parseHTML } from '../../helpers/html-react-parse';
import { useCmsMaintenanceNotifications } from '../../hooks/api/useCmsMaintenanceNotifications';
import { PageContentCell } from '../Page/Page';

const DEFAULT_SEVERITY = 'warning';
const DEFAULT_HEADING = 'Onderhoudsbericht';

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
    <PageContentCell startWide={1} spanWide={12}>
      {maintenanceNotifications.map((notification, index) => {
        return (
          <Alert
            key={notification.title + index}
            severity={
              notification.severity === 'info'
                ? undefined
                : notification.severity || DEFAULT_SEVERITY
            }
            heading={notification.title || DEFAULT_HEADING}
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
    </PageContentCell>
  );
}
