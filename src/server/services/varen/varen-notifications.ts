import { generatePath } from 'react-router';
import slug from 'slugme';

import {
  VarenZakenFrontend,
  VarenRegistratieRederType,
} from './config-and-types';
import { fetchVaren } from './varen';
import { isVergunning } from '../../../client/pages/Thema/Varen/helper';
import {
  routeConfig,
  themaId,
  themaTitle,
} from '../../../client/pages/Thema/Varen/Varen-thema-config';
import {
  apiErrorResult,
  ApiResponse,
  apiSuccessResult,
} from '../../../universal/helpers/api';
import { isRecentNotification } from '../../../universal/helpers/utils';
import { MyNotification } from '../../../universal/types/App.types';
import { AuthProfileAndToken } from '../../auth/auth-types';

function createVarenRederRegisteredNotification(
  zaak: VarenRegistratieRederType
): MyNotification {
  return {
    id: `varen-${zaak.id}-reder-notification`,
    datePublished: zaak.dateRequest,
    themaID: themaId,
    themaTitle: themaTitle,
    title: `Reder geregistreerd`,
    description: `U heeft zich geregistreerd.`,
    link: {
      to: routeConfig.themaPage.path,
      title: 'Bekijk details',
    },
  };
}

function createVarenNotification(
  zaak: VarenZakenFrontend
): MyNotification | null {
  const currentStep = zaak.steps.find((step) => step.isActive);
  if (!currentStep) {
    return null;
  }

  // We do not link to or show processed aanvragen, only vergunningen
  const ctaLinkToThemaOrDetail =
    !zaak.processed || isVergunning(zaak)
      ? generatePath(routeConfig.detailPage.path, {
          id: zaak.id,
          caseType: slug(zaak.caseType, { lower: true }),
        })
      : routeConfig.themaPage.path;

  const baseNotification: Omit<MyNotification, 'id' | 'description' | 'title'> =
    {
      datePublished: currentStep.datePublished,
      themaID: themaId,
      themaTitle: themaTitle,
      link: {
        to: ctaLinkToThemaOrDetail,
        title: 'Bekijk details',
      },
    };

  switch (currentStep.status) {
    case 'Ontvangen':
      return {
        ...baseNotification,
        id: `varen-${zaak.id}-ontvangen-notification`,
        title: `Aanvraag ${zaak.caseType} ontvangen`,
        description: `Wij hebben uw aanvraag ontvangen.`,
      };
    case 'In behandeling':
      return {
        ...baseNotification,
        id: `varen-${zaak.id}-inbehandeling-notification`,
        title: `Aanvraag ${zaak.caseType} in behandeling`,
        description: `Wij hebben uw aanvraag in behandeling genomen.`,
      };
    case 'Meer informatie nodig':
      return {
        ...baseNotification,
        id: `varen-${zaak.id}-meerinformatienodig-notification`,
        title: `Meer informatie nodig omtrent uw ${zaak.caseType} aanvraag`,
        description: `Er is meer informatie nodig om de aanvraag verder te kunnen verwerken.`,
      };
    case 'Afgehandeld':
      return {
        ...baseNotification,
        id: `varen-${zaak.id}-afgehandeld-notification`,
        title: `Aanvraag ${zaak.caseType} afgehandeld`,
        description: `Wij hebben uw aanvraag afgehandeld.`,
      };
  }
  return null;
}

export async function fetchVarenNotifications(
  authProfileAndToken: AuthProfileAndToken
): Promise<ApiResponse<{ notifications: MyNotification[] }>> {
  const varenResponse = await fetchVaren(authProfileAndToken);

  if (varenResponse.status === 'ERROR') {
    return apiErrorResult(
      'Error fetching Varen zaken data',
      null,
      varenResponse.code
    );
  }
  const notifications = [];

  const rederRegistration = varenResponse.content.reder;
  if (rederRegistration) {
    notifications.push(
      createVarenRederRegisteredNotification(rederRegistration)
    );
  }

  const zaken = varenResponse.content.zaken;
  notifications.push(...zaken.map(createVarenNotification).filter((n) => !!n));

  const recentNotifications = notifications.filter(
    (notification) =>
      !!notification.datePublished &&
      isRecentNotification(notification.datePublished)
  );

  return apiSuccessResult({
    notifications: recentNotifications,
  });
}
