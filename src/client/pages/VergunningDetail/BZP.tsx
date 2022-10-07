import type { BZP as BZPVergunning } from '../../../server/services/vergunningen/vergunningen';
import { defaultDateFormat } from '../../../universal/helpers';
import { InnerHtml, LinkdInline } from '../../components';
import InfoDetail, {
  InfoDetailGroup,
} from '../../components/InfoDetail/InfoDetail';
import { useAppStateGetter } from '../../hooks';

export function ExpirationdNotifications({ id }: { id: string }) {
  const appState = useAppStateGetter();
  const isExpiredNotification = appState.NOTIFICATIONS.content?.find(
    (notification) =>
      notification.subject === id &&
      notification.title === 'Uw ontheffing blauwe zone is verlopen'
  );
  const willExpireSoonNotification = appState.NOTIFICATIONS.content?.find(
    (notification) =>
      notification.subject === id &&
      notification.title === 'Uw ontheffing blauwe zone verloopt binnenkort'
  );

  return (
    <>
      {!!isExpiredNotification && (
        <>
          <InnerHtml>{isExpiredNotification.description}</InnerHtml>
          <p>
            <LinkdInline
              external
              href="https://formulieren.amsterdam.nl/TriplEforms/DirectRegelen/formulier/nl-NL/evAmsterdam/Ontheffingblauwezone.aspx"
            >
              Verleng uw ontheffing
            </LinkdInline>
          </p>
        </>
      )}
      {!!willExpireSoonNotification && (
        <>
          <InnerHtml>{willExpireSoonNotification.description}</InnerHtml>
          <p>
            <LinkdInline
              external
              href="https://formulieren.amsterdam.nl/TriplEforms/DirectRegelen/formulier/nl-NL/evAmsterdam/Ontheffingblauwezone.aspx"
            >
              Verleng uw ontheffing
            </LinkdInline>
          </p>
        </>
      )}
    </>
  );
}

export function BZP({ vergunning }: { vergunning: BZPVergunning }) {
  return (
    <>
      <ExpirationdNotifications id={vergunning.id} />
      <InfoDetail label="Kenmerk" value={vergunning?.identifier || '-'} />
      <InfoDetail label="Kenteken" value={vergunning.kenteken || '-'} />
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
      {!!vergunning?.decision && (
        <InfoDetail label="Resultaat" value={vergunning.decision} />
      )}
    </>
  );
}
