import { generatePath } from 'react-router-dom';

import {
  VarenFrontend,
  VarenRegistratieRederType,
  VarenVergunningFrontend,
} from './config-and-types';
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

function createVarenRederRegisteredNotification(
  zaak: VarenFrontend<VarenRegistratieRederType>
): MyNotification {
  return {
    id: `varen-${zaak.id}-reder-notification`,
    datePublished: zaak.dateRequestFormatted,
    thema: Themas.VAREN,
    title: `Reder geregistreerd`,
    description: `U heeft zich geregistreerd.`,
    link: {
      to: AppRoutes.VAREN,
      title: 'Bekijk details',
    },
  };
}

function createVarenNotifications(
  zaak: VarenVergunningFrontend
): MyNotification[] {
  // We do not link to or show processed aanvragen, only vergunningen
  const ctaLinkToThemaOrDetail =
    !zaak.processed || isVergunning(zaak)
      ? generatePath(AppRoutes['VAREN/DETAIL'], {
          id: zaak.id,
          caseType: zaak.caseType,
        })
      : AppRoutes.VAREN;

  const notifications = zaak.steps
    .filter((step) => step.isChecked)
    .map((step) => {
      switch (step.status) {
        case 'Ontvangen':
          return {
            id: `varen-${zaak.id}-ontvangen-notification`,
            datePublished: step.datePublished,
            thema: Themas.VAREN,
            title: `Aanvraag ${zaak.caseType} ontvangen`,
            description: `Wij hebben uw aanvraag ontvangen.`,
            link: {
              to: ctaLinkToThemaOrDetail,
              title: 'Bekijk details',
            },
          };
        case 'In behandeling':
          return {
            id: `varen-${zaak.id}-inbehandeling-notification`,
            datePublished: step.datePublished,
            thema: Themas.VAREN,
            title: `Aanvraag ${zaak.caseType} in behandeling`,
            description: `Wij hebben uw aanvraag in behandeling genomen.`,
            link: {
              to: ctaLinkToThemaOrDetail,
              title: 'Bekijk details',
            },
          };
        case 'Meer informatie nodig':
          return {
            id: `varen-${zaak.id}-meerinformatienodig-notification`,
            datePublished: step.datePublished,
            thema: Themas.VAREN,
            title: `Meer informatie nodig omtrent uw ${zaak.caseType} aanvraag`,
            description: `Er is meer informatie nodig om de aanvraag verder te kunnen verwerken.`,
            link: {
              to: ctaLinkToThemaOrDetail,
              title: 'Bekijk details',
            },
          };
        case 'Besluit':
          return {
            id: `varen-${zaak.id}-afgehandeld-notification`,
            datePublished: step.datePublished,
            thema: Themas.VAREN,
            title: `Aanvraag ${zaak.caseType} afgehandeld`,
            description: `Wij hebben uw aanvraag afgehandeld.`,
            link: {
              to: ctaLinkToThemaOrDetail,
              title: 'Bekijk details',
            },
          };
      }
    });

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
  const notifications = [];

  const rederRegistration = varenResponse.content.find(
    (zaak) => zaak.caseType === 'Varen registratie reder'
  );
  if (rederRegistration) {
    notifications.push(
      createVarenRederRegisteredNotification(rederRegistration)
    );
  }

  const zaken = varenResponse.content.filter(
    (zaak) => zaak.caseType !== 'Varen registratie reder'
  );
  notifications.push(...zaken.map(createVarenNotifications).flat());

  return apiSuccessResult({
    notifications,
  });
}
