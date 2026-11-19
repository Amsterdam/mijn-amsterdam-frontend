import { useState } from 'react';

import {
  Alert,
  Heading,
  Link,
  Paragraph,
} from '@amsterdam/design-system-react';

import { sanitizeToPlainText } from '../../../../../universal/helpers/sanitize-to-plain-text.ts';
import type { MyNotification as MyNotificationData } from '../../../../../universal/types/App.types.ts';
import { MyNotification } from '../../../../components/MyNotification/MyNotification.tsx';
import {
  themaId as notificationsThemaId,
  themaTitle as notificationsThemaTitle,
} from '../../../bob/pages/MyNotifications/MyNotifications-config.ts';
import type { ServiceAlertPreviewProps } from './ServiceAlertPreview.types.ts';
import { getServiceAlertPreviewPeriod } from './ServiceAlerts.helpers.ts';

export function ServiceAlertPreview({
  title,
  body,
  type,
  displayLocation,
  links,
  dateRange,
  timeStart,
  timeEnd,
}: ServiceAlertPreviewProps) {
  const [datePublished] = useState(() => new Date().toISOString());
  const description = sanitizeToPlainText(body || 'Bericht van de melding');
  const period = getServiceAlertPreviewPeriod(dateRange, timeStart, timeEnd);
  const notification: MyNotificationData = {
    id: 'service-alert-preview',
    themaID: notificationsThemaId,
    themaTitle: notificationsThemaTitle,
    datePublished,
    title,
    description,
    isAlert: true,
    links: links.map(({ label, url }) => ({ title: label, to: url })),
  };

  return (
    <>
      <Heading level={2} className="ams-mb-m">
        Voorbeeld
      </Heading>
      {period && <Paragraph className="ams-mb-m">{period}</Paragraph>}
      {displayLocation === 'notification' ? (
        <MyNotification
          notification={notification}
          trackCategory="Dashboard / Actueel"
        />
      ) : (
        <Alert
          heading={title || 'Titel van de melding'}
          headingLevel={4}
          severity={type === 'info' || !type ? undefined : type}
        >
          <Paragraph>{description}</Paragraph>
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
