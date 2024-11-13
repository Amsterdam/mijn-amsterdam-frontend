import { Link } from '@amsterdam/design-system-react';

import type { BZB as BZBVergunning } from '../../../../server/services/vergunningen/vergunningen';
import { defaultDateFormat } from '../../../../universal/helpers/date';
import { MyNotification } from '../../../../universal/types';
import { InnerHtml } from '../../../components';
import InfoDetail, {
  InfoDetailGroup,
} from '../../../components/InfoDetail/InfoDetail';
import { useAppStateGetter } from '../../../hooks/useAppState';

function ExpirationNotifications({ id }: { id: string }) {
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
          <InnerHtml>{isExpiredNotification.description}</InnerHtml>
          <p>
            <Link
              variant="inline"
              href="https://formulieren.amsterdam.nl/TriplEforms/DirectRegelen/formulier/nl-NL/evAmsterdam/Ontheffingblauwezone.aspx"
            >
              Vraag een nieuwe ontheffing aan
            </Link>
          </p>
        </>
      )}
      {!!willExpireSoonNotification && (
        <>
          <InnerHtml>{willExpireSoonNotification.description}</InnerHtml>
          <p>
            <Link
              variant="inline"
              href="https://formulieren.amsterdam.nl/TriplEforms/DirectRegelen/formulier/nl-NL/evAmsterdam/Ontheffingblauwezone.aspx"
            >
              Vraag op tijd een nieuwe ontheffing aan
            </Link>
          </p>
        </>
      )}
    </>
  );
}

export function BZB({ vergunning }: { vergunning: BZBVergunning }) {
  return (
    <>
      <ExpirationNotifications id={vergunning.id} />
      <InfoDetail label="Kenmerk" value={vergunning?.identifier || '-'} />
      <InfoDetail label="Naam bedrijf" value={vergunning.companyName || '-'} />
      <InfoDetail
        label="Aantal aangevraagde ontheffingen"
        value={vergunning.numberOfPermits}
      />
      {!!vergunning.dateStart &&
        !!vergunning.dateEnd &&
        vergunning.decision === 'Verleend' &&
        vergunning.status === 'Afgehandeld' && (
          <InfoDetailGroup>
            <InfoDetail
              label="Vanaf"
              value={defaultDateFormat(vergunning.dateStart)}
            />
            <InfoDetail
              label="Tot en met"
              value={defaultDateFormat(vergunning.dateEnd)}
            />
          </InfoDetailGroup>
        )}
      {!!vergunning.decision && (
        <InfoDetail label="Resultaat" value={vergunning.decision} />
      )}
    </>
  );
}
