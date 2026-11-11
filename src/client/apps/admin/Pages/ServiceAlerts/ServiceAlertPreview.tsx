import { useState } from 'react';

import {
  Alert,
  Heading,
  Link,
  OrderedList,
  Paragraph,
} from '@amsterdam/design-system-react';

import type { MyNotification as MyNotificationData } from '../../../../../universal/types/App.types.ts';
import { MyNotification } from '../../../../components/MyNotification/MyNotification.tsx';
import {
  themaId as notificationsThemaId,
  themaTitle as notificationsThemaTitle,
} from '../../../bob/pages/MyNotifications/MyNotifications-config.ts';
import type { ServiceAlertPreviewProps } from './ServiceAlertPreview.types.ts';

export function ServiceAlertPreview({
  title,
  body,
  type,
  displayLocation,
  links,
}: ServiceAlertPreviewProps) {
  const [datePublished] = useState(() => new Date().toISOString());
  const notification: MyNotificationData = {
    id: 'service-alert-preview',
    themaID: notificationsThemaId,
    themaTitle: notificationsThemaTitle,
    datePublished,
    title: title || 'Titel van de melding',
    description: body || 'Bericht van de melding',
    isAlert: true,
    links: links.map(({ label, url }) => ({ title: label, to: url })),
  };

  return (
    <>
      <Heading level={2} className="ams-mb-m">
        Voorbeeld
      </Heading>
      {displayLocation === 'notification' ? (
        <OrderedList markers={false}>
          <OrderedList.Item className="ams-mb-m">
            <MyNotification
              notification={notification}
              trackCategory="Dashboard / Actueel"
            />
          </OrderedList.Item>
        </OrderedList>
      ) : (
        <Alert
          heading={title || 'Titel van de melding'}
          headingLevel={4}
          severity={type === 'info' ? undefined : type}
        >
          <Paragraph>{body || 'Bericht van de melding'}</Paragraph>
          {links.map(({ label, url }) => (
            <Paragraph key={url}>
              <Link href={url}>{label}</Link>
            </Paragraph>
          ))}
        </Alert>
      )}
    </>
  );
}
