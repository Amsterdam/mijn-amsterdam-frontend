import { Alert, Link, Paragraph } from '@amsterdam/design-system-react';
import classNames from 'classnames';

import { parseHTML } from '../../helpers/html-react-parse.tsx';
import { useCmsMaintenanceNotifications } from '../../hooks/api/useCmsMaintenanceNotifications.ts';
import { PageContentCell } from '../Page/Page.tsx';
import styles from './MaintenanceNotifications.module.scss';

const DEFAULT_HEADING = 'Onderhoudsbericht';

interface MaintenanceNotificationsProps {
  page?: string;
  themaID?: string;
  fromApiDirectly?: boolean;
  className?: string;
}

export function MaintenanceNotifications({
  page,
  themaID,
  fromApiDirectly = false,
  className,
}: MaintenanceNotificationsProps) {
  const maintenanceNotifications = useCmsMaintenanceNotifications(
    page,
    themaID,
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
                : notification.severity
            }
            heading={notification.title || DEFAULT_HEADING}
            headingLevel={4}
            className={classNames(styles.MaintenanceNotification, className)}
          >
            {parseHTML(notification.description)}
            {(
              notification.links ??
              (notification.link ? [notification.link] : [])
            ).map(({ title, to }, index) => (
              <Paragraph key={`${to}-${index}`}>
                <Link href={to}>{title}</Link>
              </Paragraph>
            ))}
          </Alert>
        );
      })}
    </PageContentCell>
  );
}
