import {
  getSubStatusDescription,
  ZAAK_STATUS_FRONTEND,
  ZAAK_STATUS_SOURCE,
} from './erfpacht-zaken-config.ts';
import type { ErfpachtZaakExcerptFrontend } from './erfpacht-zaken-types.ts';
import { fetchErfpachtZaakInfo } from './erfpacht-zaken.ts';
import { themaConfig } from '../../../client/apps/bob/pages/Thema/Erfpacht/Erfpacht-thema-config.ts';
import {
  apiSuccessResult,
  type ApiResponse,
} from '../../../universal/helpers/api.ts';
import { isRecentNotification } from '../../../universal/helpers/date.ts';
import type { MyNotification } from '../../../universal/types/App.types.ts';
import type { AuthProfileAndToken } from '../../auth/auth-types.ts';
import { captureException } from '../monitoring.ts';

export function getSubStatusNotificationTitle(
  zaakExcerpt: Pick<ErfpachtZaakExcerptFrontend, 'statusOmschrijving'>
): string {
  const caseType = 'Wijzigen Erfpachtrecht';
  const zaakOmschrijving = zaakExcerpt.statusOmschrijving.toLowerCase();

  switch (zaakOmschrijving) {
    case ZAAK_STATUS_SOURCE.AANVRAAG:
      return `Aanvraag ${caseType} ontvangen`;
    case ZAAK_STATUS_SOURCE.AANVRAAG_BEOORDELEN:
      return `Aanvraag ${caseType} wordt beoordeeld`;
    case ZAAK_STATUS_SOURCE.INFORMATIE_OPGEVRAAGD:
      return `Meer informatie nodig omtrent uw aanvraag ${caseType}`;
    case ZAAK_STATUS_SOURCE.INFORMATIE_AANGELEVERD:
      return `Informatie ontvangen omtrent uw aanvraag ${caseType}`;
    case ZAAK_STATUS_SOURCE.AANVRAAG_GEREED_VOOR_BEHANDELING:
      return `Aanvraag ${caseType} gereed voor behandeling`;
    case ZAAK_STATUS_SOURCE.AANBIEDING:
      return `Aanvraag ${caseType} aanbieding verstuurd`;

    case ZAAK_STATUS_SOURCE.INDICATIE_VERSTUURD:
    case ZAAK_STATUS_SOURCE.ACCEPTATIE_ONTVANGEN:
    case ZAAK_STATUS_SOURCE.BESLUIT_VERSTUURD:
    case ZAAK_STATUS_SOURCE.AKTE_GEPASSEERD:
    case ZAAK_STATUS_SOURCE.BEHANDELING:
    case ZAAK_STATUS_SOURCE.AANVRAAG_AFGEROND:
      return `Aanvraag ${caseType} ${zaakOmschrijving}`;
    default:
      captureException(`Unknown status for ${caseType}: ${zaakOmschrijving}`, {
        severity: 'warning',
      });
      return `Aanvraag ${caseType} ${zaakOmschrijving}`;
  }
}

function createErfpachtNotification(
  zaakExcerpt: ErfpachtZaakExcerptFrontend
): MyNotification {
  const title = getSubStatusNotificationTitle(zaakExcerpt);
  const description = getSubStatusDescription(
    zaakExcerpt.statusOmschrijving,
    zaakExcerpt.zaakNummer
  );

  const notification: MyNotification = {
    id: `erfpacht-${zaakExcerpt.zaakUuid}-notification`,
    themaID: themaConfig.id,
    themaTitle: themaConfig.title,
    title,
    description,
    datePublished: zaakExcerpt.datePublished ?? '',
    link: {
      ...zaakExcerpt.link,
      title: 'Bekijk uw aanvraag',
    },
  };
  return notification;
}

export async function fetchErfpachtNotifications(
  authProfileAndToken: AuthProfileAndToken
): Promise<ApiResponse<{ notifications: MyNotification[] }>> {
  const zaakInfoResponse = await fetchErfpachtZaakInfo(authProfileAndToken);

  if (zaakInfoResponse.status !== 'OK') {
    return zaakInfoResponse;
  }

  const notifications: MyNotification[] = zaakInfoResponse.content
    .filter((zaakExcerpt) => {
      if (!zaakExcerpt.datePublished) {
        return false;
      }
      return (
        isRecentNotification(zaakExcerpt.datePublished) ||
        zaakExcerpt.displayStatus !== ZAAK_STATUS_FRONTEND.AFGEHANDELD
      );
    })
    .map(createErfpachtNotification);

  return apiSuccessResult({ notifications });
}

export const forTesting = {
  createErfpachtNotification,
};
