import { ZAAK_FRONTEND_STATUS } from './erfpacht-zaken-config.ts';
import type { ErfpachtZaakExcerptFrontend } from './erfpacht-zaken-types.ts';
import { fetchErfpachtZaakInfo } from './erfpacht.ts';
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
  const title = `Aanvraag wijziging erfpachtdossier`;
  const description = `Status: ${zaakExcerpt.displayStatus}`;

  switch (zaakExcerpt.displayStatus) {
    case ZAAK_FRONTEND_STATUS.AANVRAAG:
      return {
        title: `${title} - ontvangen`,
        description: `Uw aanvraag is ingediend en wordt beoordeeld. Het nummer van uw aanvraag is ${zaakExcerpt.zaakNummer}.`,
      };
    case ZAAK_FRONTEND_STATUS.MEER_INFORMATIE_NODIG:
      return {
        title: `${title} - Meer informatie nodig`,
        description: `Er is meer informatie en tijd nodig om uw aanvraag met nummer ${zaakExcerpt.zaakNummer} te kunnen beoordelen.`,
      };
    case ZAAK_FRONTEND_STATUS.IN_BEHANDELING:
      return {
        title: `${title} - In behandeling`,
        description: `Uw aanvraag met nummer ${zaakExcerpt.zaakNummer} is in behandeling.`,
      };
    case ZAAK_FRONTEND_STATUS.AFGEHANDELD:
      return {
        title: `${title} - Afgehandeld`,
        description: `Uw aanvraag met nummer ${zaakExcerpt.zaakNummer} is afgehandeld.`,
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
          ? zaakExcerpt.displayStatus !== ZAAK_FRONTEND_STATUS.AFGEHANDELD ||
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
