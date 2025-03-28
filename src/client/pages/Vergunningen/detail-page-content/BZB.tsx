import { Link, Paragraph } from '@amsterdam/design-system-react';

import type {
  BZB,
  VergunningFrontend,
} from '../../../../server/services/vergunningen/config-and-types';
import { defaultDateFormat } from '../../../../universal/helpers/date';
import { MyNotification } from '../../../../universal/types';
import InfoDetail, {
  InfoDetailGroup,
} from '../../../components/InfoDetail/InfoDetail';
import { useAppStateGetter } from '../../../hooks/useAppState';

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

export function BZB({ vergunning }: { vergunning: VergunningFrontend }) {
  const vergunningData = vergunning as VergunningFrontend<BZB>;

  return (
    <>
      <ExpirationNotifications id={vergunningData.id} />
      <InfoDetail label="Kenmerk" value={vergunningData?.identifier || '-'} />
      <InfoDetail
        label="Naam bedrijf"
        value={vergunningData.companyName || '-'}
      />
      <InfoDetail
        label="Aantal aangevraagde ontheffingen"
        value={vergunningData.numberOfPermits}
      />
      {!!vergunningData.dateStart &&
        !!vergunningData.dateEnd &&
        vergunningData.decision === 'Verleend' &&
        vergunningData.status === 'Afgehandeld' && (
          <InfoDetailGroup>
            <InfoDetail
              label="Vanaf"
              value={defaultDateFormat(vergunningData.dateStart)}
            />
            <InfoDetail
              label="Tot en met"
              value={defaultDateFormat(vergunningData.dateEnd)}
            />
          </InfoDetailGroup>
        )}
      {!!vergunningData.decision && (
        <InfoDetail label="Resultaat" value={vergunningData.decision} />
      )}
    </>
  );
}
