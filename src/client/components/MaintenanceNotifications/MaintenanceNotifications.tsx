import { useState } from 'react';

import { Alert } from '@amsterdam/design-system-react';

import styles from './MaintenanceNotifications.module.scss';
import { InnerHtml } from '../../components';
import { useCmsMaintenanceNotifications } from '../../hooks/api/useCmsMaintenanceNotifications';
import { Button } from '../Button/Button';
import Linkd from '../Button/Button';


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
            title="Onderhoudsmelding"
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
