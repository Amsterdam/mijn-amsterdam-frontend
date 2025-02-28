import { Link, Paragraph } from '@amsterdam/design-system-react';

import type { BZB } from '../../../../server/services/parkeren/config-and-types';
import type { VergunningFrontend } from '../../../../server/services/vergunningen/config-and-types';
import { MyNotification } from '../../../../universal/types';
import { Datalist } from '../../../components/Datalist/Datalist';
import { useAppStateGetter } from '../../../hooks/useAppState';
import {
  dateRange,
  getRows,
} from '../../Vergunningen/detail-page-content/fields-config';

export function ExpirationNotifications({ id }: { id: string }) {
  const appState = useAppStateGetter();
  const isExpiredNotification = appState.NOTIFICATIONS.content?.find(
    (notification: MyNotification) =>
      notification.subject === id &&
      notification.title === 'Uw ontheffing blauwe zone is verlopen'
  );
  const willExpireSoonNotification = appState.NOTIFICATIONS.content?.find(
    (notification: MyNotification) =>
      notification.subject === id &&
      notification.title === 'Uw ontheffing blauwe zone verloopt binnenkort'
  );

  return (
    <>
      {!!isExpiredNotification && (
        <>
          <Paragraph className="ams-mb--sm">
            {isExpiredNotification.description}
          </Paragraph>
          <Paragraph>
            <Link
              rel="noopener noreferrer"
              href="https://formulieren.amsterdam.nl/TriplEforms/DirectRegelen/formulier/nl-NL/evAmsterdam/Ontheffingblauwezone.aspx"
            >
              Vraag een nieuwe ontheffing aan
            </Link>
          </Paragraph>
        </>
      )}
      {!!willExpireSoonNotification && (
        <>
          <Paragraph className="ams-mb--sm">
            {willExpireSoonNotification.description}
          </Paragraph>
          <Paragraph>
            <Link
              rel="noopener noreferrer"
              href="https://formulieren.amsterdam.nl/TriplEforms/DirectRegelen/formulier/nl-NL/evAmsterdam/Ontheffingblauwezone.aspx"
            >
              Vraag op tijd een nieuwe ontheffing aan
            </Link>
          </Paragraph>
        </>
      )}
    </>
  );
}

export function BZB({ vergunning }: { vergunning: VergunningFrontend<BZB> }) {
  const rows = getRows(vergunning, [
    'identifier',
    {
      companyName: () => {
        return {
          label: 'Naam bedrijf',
          content: vergunning.companyName || '-',
        };
      },
    },
    {
      numberOfPermits: () => {
        return {
          label: 'Aantal aangevraagde ontheffingen',
          content: vergunning.numberOfPermits || '-',
        };
      },
    },
    {
      dateRange: (vergunning) => {
        return vergunning.processed ? dateRange(vergunning) : null;
      },
    },
    'decision',
  ]);

  return (
    <>
      <ExpirationNotifications id={vergunning.id} />
      <Datalist rows={rows} />
    </>
  );
}
