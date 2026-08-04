import {
  getParentStatus,
  getSubStepDescription,
  ZAAK_STATUS_FRONTEND,
} from './erfpacht-zaken-config.ts';
import type { ErfpachtZaakExcerptFrontend } from './erfpacht-zaken-types.ts';
import { fetchErfpachtZaakInfo } from './erfpacht-zaken.ts';
import { themaConfig } from '../../../client/pages/Thema/Erfpacht/Erfpacht-thema-config.ts';
import {
  apiSuccessResult,
  type ApiResponse,
} from '../../../universal/helpers/api.ts';
import { isRecentNotification } from '../../../universal/helpers/date.ts';
import type { MyNotification } from '../../../universal/types/App.types.ts';
import type { AuthProfileAndToken } from '../../auth/auth-types.ts';

function getTitleAndDescriptionForNotification(
  zaakExcerpt: ErfpachtZaakExcerptFrontend
): { title: string; description: string } {
  const title = `${zaakExcerpt.zaakNummer}: ${zaakExcerpt.statusOmschrijving}`;
  const description = getSubStepDescription({
    statustoelichting: zaakExcerpt.statusOmschrijving,
    datumStatusGezet: zaakExcerpt.formattedStatusDatum,
  });
  // const description = `De status van uw aanvraag met zaaknummer ${zaakExcerpt.zaakNummer} is gewijzigd. ${description_}`;

  // We only want to show a notification for the parent status, not for the specific status.
  // The specific status per zaak are fetched via an additional API call.
  // It's too request-heavy to do this for all notifications, so we only show the parent status in the notification.
  switch (getParentStatus(zaakExcerpt.statusOmschrijving)) {
    case ZAAK_STATUS_FRONTEND.AANVRAAG:
      return {
        title,
        description,
      };
    case ZAAK_STATUS_FRONTEND.IN_BEHANDELING:
      return {
        title,
        description,
      };
    case ZAAK_STATUS_FRONTEND.AFGEHANDELD:
      return {
        title,
        description,
      };
  }

  return { title, description };
}

export async function fetchErfpachtNotifications(
  authProfileAndToken: AuthProfileAndToken
): Promise<ApiResponse<{ notifications: MyNotification[] }>> {
  const zaakInfoResponse = await fetchErfpachtZaakInfo(authProfileAndToken);

  if (zaakInfoResponse.status !== 'OK') {
    return zaakInfoResponse;
  }

  const notifications: MyNotification[] = zaakInfoResponse.content
    .filter(
      (zaakExcerpt) =>
        zaakExcerpt.datePublished
          ? zaakExcerpt.displayStatus !== ZAAK_STATUS_FRONTEND.AFGEHANDELD ||
            isRecentNotification(zaakExcerpt.datePublished, new Date())
          : false // Do not include notifications without a datePublished.
    )
    .map((zaakExcerpt: ErfpachtZaakExcerptFrontend) => {
      const { title, description } =
        getTitleAndDescriptionForNotification(zaakExcerpt);

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
    });

  return apiSuccessResult({ notifications });
}

export const forTesting = {
  getTitleAndDescriptionForNotification,
};
