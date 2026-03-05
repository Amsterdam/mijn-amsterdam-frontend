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
): MyNotification | null {
  const datePublished = zaak.dateRequest;
  if (!isRecentNotification(datePublished)) {
    return null;
  }
  return {
    id: `varen-${zaak.id}-reder-notification`,
    subId: 'registratie',
    datePublished,
    themaID: themaId,
    themaTitle,
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
  const datePublished = vergunning.dateStart;
  if (!isRecentNotification(datePublished)) {
    return null;
  }
  return {
    id: `varen-${vergunning.id}-vergunning-notification`,
    subId: 'vergunning',
    datePublished,
    themaID: themaId,
    themaTitle,
    title: vergunning.title,
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

  const baseNotification = {
    id: `varen-${zaak.id}-notification`,
    subId: currentStep.status.toLowerCase().split(' ').join(''),
    datePublished: currentStep.datePublished,
    themaID: themaId,
    themaTitle,
    link: {
      to: ctaLinkToThemaOrDetail,
      title: 'Bekijk details',
    },
  } satisfies Partial<MyNotification>;

  switch (currentStep.status) {
    case 'Ontvangen':
      return {
        ...baseNotification,
        title: `Aanvraag ${zaak.title} ontvangen`,
        description: `Wij hebben uw aanvraag voor vaartuig "${zaak.vesselName}" ontvangen`,
      };
    case 'In behandeling':
      return {
        ...baseNotification,
        title: `Aanvraag ${zaak.title} in behandeling`,
        description: `Wij hebben uw aanvraag voor vaartuig "${zaak.vesselName}" in behandeling genomen.`,
      };
    case 'Meer informatie nodig':
      return {
        ...baseNotification,
        title: `Meer informatie nodig omtrent uw ${zaak.title} aanvraag`,
        description: `Wij hebben meer informatie nodig om uw aanvraag voor vaartuig "${zaak.vesselName}" verder te kunnen verwerken.`,
      };
    case 'Afgehandeld':
      if (!isRecentNotification(baseNotification.datePublished)) {
        return null;
      }
      return {
        ...baseNotification,
        title: `Aanvraag ${zaak.title} afgehandeld`,
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

  notifications.push(...VAREN.content.zaken.map(createVarenNotification));

  notifications.push(
    ...VAREN.content.vergunningen
      .map(createVarenVergunningNotification)
      .filter((n) => !!n)
  );

  const recentNotifications = notifications
    .filter((notification) => !!notification) // Check if notification exists seperately for typescript
    .filter((notification) => !!notification.datePublished);

  return apiSuccessResult({
    notifications: recentNotifications,
  });
}
