import { generatePath } from 'react-router';
import slug from 'slugme';

import {
  VarenZakenFrontend,
  VarenRegistratieRederType,
  VarenVergunningFrontend,
} from './config-and-types';
import { fetchVaren } from './varen';
import {
  routeConfig,
  themaId,
  themaTitle,
} from '../../../client/pages/Thema/Varen/Varen-thema-config';
import {
  apiDependencyError,
  apiSuccessResult,
} from '../../../universal/helpers/api';
import { isDateInFuture } from '../../../universal/helpers/date';
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

function createVarenVergunningNotification(
  vergunning: VarenVergunningFrontend
): MyNotification | null {
  // Vergunning can be transferred from reder to reder on a future start date
  if (!vergunning.dateStart || isDateInFuture(vergunning.dateStart)) {
    return null;
  }
  return {
    id: `varen-${vergunning.id}-vergunning-notification`,
    datePublished: vergunning.dateStart,
    themaID: themaId,
    themaTitle: themaTitle,
    title: `Varen vergunning exploitatie`,
    description: `U hebt een vergunning gekregen voor "${vergunning.vesselName}".`,
    link: {
      to: generatePath(routeConfig.detailPageVergunning.path, {
        id: vergunning.id,
      }),
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

  const ctaLinkToThemaOrDetail = generatePath(routeConfig.detailPageZaak.path, {
    id: zaak.id,
    caseType: slug(zaak.caseType, { lower: true }),
  });

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
        description: `Wij hebben uw aanvraag voor vaartuig "${zaak.vesselName}" ontvangen`,
      };
    case 'In behandeling':
      return {
        ...baseNotification,
        id: `varen-${zaak.id}-inbehandeling-notification`,
        title: `Aanvraag ${zaak.caseType} in behandeling`,
        description: `Wij hebben uw aanvraag voor vaartuig "${zaak.vesselName}" in behandeling genomen.`,
      };
    case 'Meer informatie nodig':
      return {
        ...baseNotification,
        id: `varen-${zaak.id}-meerinformatienodig-notification`,
        title: `Meer informatie nodig omtrent uw ${zaak.caseType} aanvraag`,
        description: `Wij hebben meer informatie nodig om uw aanvraag voor vaartuig "${zaak.vesselName}" verder te kunnen verwerken.`,
      };
    case 'Afgehandeld':
      return {
        ...baseNotification,
        id: `varen-${zaak.id}-afgehandeld-notification`,
        title: `Aanvraag ${zaak.caseType} afgehandeld`,
        description: `Wij hebben uw aanvraag voor vaartuig "${zaak.vesselName}" afgehandeld.`,
      };
  }
  return null;
}

export async function fetchVarenNotifications(
  authProfileAndToken: AuthProfileAndToken
) {
  const VAREN = await fetchVaren(authProfileAndToken);

  if (VAREN.status !== 'OK') {
    return apiDependencyError({ VAREN });
  }
  const notifications = [];

  const rederRegistration = VAREN.content.reder;
  if (rederRegistration) {
    notifications.push(
      createVarenRederRegisteredNotification(rederRegistration)
    );
  }

  notifications.push(
    ...VAREN.content.zaken.map(createVarenNotification).filter((n) => !!n)
  );

  notifications.push(
    ...VAREN.content.vergunningen
      .map(createVarenVergunningNotification)
      .filter((n) => !!n)
  );

  const recentNotifications = notifications.filter(
    (notification) =>
      !!notification.datePublished &&
      isRecentNotification(notification.datePublished)
  );

  return apiSuccessResult({
    notifications: recentNotifications,
  });
}
