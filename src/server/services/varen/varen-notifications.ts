import { generatePath } from 'react-router-dom';

import { VarenVergunningFrontend } from './config-and-types';
import { fetchVaren } from './varen';
import { isVergunning } from '../../../client/pages/Varen/helper';
import { AppRoutes } from '../../../universal/config/routes';
import { Themas } from '../../../universal/config/thema';
import {
  apiDependencyError,
  apiSuccessResult,
} from '../../../universal/helpers/api';
import { MyNotification } from '../../../universal/types';
import { AuthProfileAndToken } from '../../auth/auth-types';

export function createVarenNotifications(
  zaak: VarenVergunningFrontend
): MyNotification[] {
  const notifications = [];

  // We do not link to or show processed aanvragen, only vergunningen
  const ctaLinkToThemaOrDetail =
    !zaak.processed || isVergunning(zaak)
      ? generatePath(AppRoutes['VAREN/DETAIL'], {
          id: zaak.id,
          caseType: zaak.caseType,
        })
      : AppRoutes.VAREN;

  notifications.push({
    id: `varen-${zaak.id}-ontvangen-notification`,
    datePublished: zaak.dateRequest,
    thema: Themas.VAREN,
    title: `Aanvraag ${zaak.caseType} ontvangen`,
    description: `Wij hebben uw aanvraag ontvangen.`,
    link: {
      to: ctaLinkToThemaOrDetail,
      title: 'Bekijk details',
    },
  });

  if (zaak.dateInBehandeling) {
    notifications.push({
      id: `varen-${zaak.id}-inbehandeling-notification`,
      datePublished: zaak.dateInBehandeling,
      thema: Themas.VAREN,
      title: `Aanvraag ${zaak.caseType} in behandeling`,
      description: `Wij hebben uw aanvraag in behandeling genomen.`,
      link: {
        to: ctaLinkToThemaOrDetail,
        title: 'Bekijk details',
      },
    });
  }

  notifications.push(
    ...zaak.termijnDates.map((termijn) => ({
      id: `varen-${zaak.id}-meerinformatienodig-notification`,
      datePublished: termijn.dateStart,
      thema: Themas.VAREN,
      title: `Meer informatie nodig omtrent uw aanvraag`,
      description: `Er is meer informatie nodig om de aanvraag verder te kunnen verwerken`,
      link: {
        to: ctaLinkToThemaOrDetail,
        title: 'Bekijk details',
      },
    }))
  );

  if (zaak.dateDecision) {
    notifications.push({
      id: `varen-${zaak.id}-afgehandeld-notification`,
      datePublished: zaak.dateDecision,
      thema: Themas.VAREN,
      title: `Aanvraag ${zaak.caseType} afgehandeld`,
      description: `Wij hebben uw aanvraag afgehandeld.`,
      link: {
        to: ctaLinkToThemaOrDetail,
        title: 'Bekijk details',
      },
    });
  }

  // If datePublished of notifications are equal, the last notification is shown first
  return notifications.reverse();
}

export async function fetchVarenNotifications(
  requestID: RequestID,
  authProfileAndToken: AuthProfileAndToken
) {
  const varenResponse = await fetchVaren(requestID, authProfileAndToken);

  if (varenResponse.status === 'ERROR') {
    return apiDependencyError({ varen: varenResponse });
  }
  const zaken = varenResponse.content.filter(
    (zaak) => zaak.caseType !== 'Varen registratie reder'
  );

  const notifications = zaken.map(createVarenNotifications).flat();

  return apiSuccessResult({
    notifications,
  });
}
