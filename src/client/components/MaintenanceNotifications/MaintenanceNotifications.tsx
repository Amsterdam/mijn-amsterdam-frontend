import { useState } from 'react';

import { Alert, Paragraph } from '@amsterdam/design-system-react';

import styles from './MaintenanceNotifications.module.scss';
import { InnerHtml } from '../../components';
import { useCmsMaintenanceNotifications } from '../../hooks/api/useCmsMaintenanceNotifications';
import Linkd, { Button } from '../Button/Button';

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
  const [isMoreInformationVisible, setMoreInformationVisible] = useState(false);

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
            <InnerHtml className={styles.Description}>
              {notification.description}
            </InnerHtml>
            {notification.moreInformation && isMoreInformationVisible && (
              <InnerHtml className={styles.MoreInformation}>
                {notification.moreInformation}
              </InnerHtml>
            )}
            {notification.moreInformation && !isMoreInformationVisible && (
              <Paragraph>
                <Button
                  variant="inline"
                  lean={true}
                  onClick={() => setMoreInformationVisible(true)}
                >
                  Meer informatie.
                </Button>
              </Paragraph>
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
