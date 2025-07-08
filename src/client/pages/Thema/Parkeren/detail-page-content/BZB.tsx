import { Link, Paragraph } from '@amsterdam/design-system-react';

import type { BZB } from '../../../../../server/services/parkeren/config-and-types.ts';
import type { VergunningFrontend } from '../../../../../server/services/vergunningen/config-and-types.ts';
import { MyNotification } from '../../../../../universal/types/App.types.ts';
import { Datalist } from '../../../../components/Datalist/Datalist.tsx';
import { useAppStateGetter } from '../../../../hooks/useAppState.ts';
import {
  commonTransformers,
  dateRange,
  getRows,
} from '../../Vergunningen/detail-page-content/fields-config.tsx';

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
          <Paragraph className="ams-mb-m">
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
          <Paragraph className="ams-mb-m">
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
  const dateRangeTransformer = () => {
    return vergunning.processed ? dateRange(vergunning) : null;
  };

  const companyName = () =>
    vergunning.companyName
      ? {
          label: 'Naam bedrijf',
          content: vergunning.companyName,
        }
      : null;

  const numberOfPermits = () =>
    vergunning.numberOfPermits
      ? {
          label: 'Aantal aangevraagde ontheffingen',
          content: vergunning.numberOfPermits,
        }
      : null;

  const rows = getRows(vergunning, [
    commonTransformers.identifier,
    companyName,
    numberOfPermits,
    dateRangeTransformer,
    commonTransformers.decision,
  ]);

  return (
    <>
      <ExpirationNotifications id={vergunning.id} />
      <Datalist rows={rows} />
    </>
  );
}
