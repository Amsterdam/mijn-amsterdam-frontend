import { VergunningFrontend } from './config-and-types';
import { fetchVergunningen } from './vergunningen';
import {
  getLifetimeTriggerDate,
  isExpiryNotificationDue,
} from './vergunningen-helpers';
import {
  routeConfig,
  themaId,
  themaTitle,
} from '../../../client/pages/Thema/Vergunningen/Vergunningen-thema-config';
import {
  apiDependencyError,
  apiSuccessResult,
} from '../../../universal/helpers/api';
import {
  isRecentNotification,
  toDateFormatted,
} from '../../../universal/helpers/utils';
import { MyNotification } from '../../../universal/types/App.types';
import { AuthProfileAndToken } from '../../auth/auth-types';
import type { DecosZaakBase } from '../decos/decos-types';

function getNotificationBase<ID extends string>(
  vergunning: VergunningFrontend,
  themaID: ID,
  themaTitle: string
): Pick<MyNotification, 'themaID' | 'themaTitle' | 'id' | 'link'> {
  const notificationBaseProperties = {
    themaID: themaID,
    themaTitle,
    id: `vergunning-${vergunning.id}-notification`,
    link: {
      to: vergunning.link.to,
      title: 'Bekijk details',
    },
  };
  return notificationBaseProperties;
}

export type NotificationThemaOptions<ID extends string> = {
  themaID: ID;
  themaTitle: string;
};

export function createNotificationDefault<
  DZ extends DecosZaakBase,
  ID extends string = string,
>(
  zaak: VergunningFrontend<DZ>,
  themaOptions: NotificationThemaOptions<ID>
): MyNotification | null {
  const activeStep = zaak.steps.find((step) => step.isActive);

  const isArchivedNotification = activeStep
    ? ['Verlopen', 'Ingetrokken', 'Afgehandeld'].includes(activeStep.status) &&
      !isRecentNotification(activeStep.datePublished, new Date())
    : false;

  if (!activeStep || isArchivedNotification) {
    return null;
  }

  const baseNotification = getNotificationBase(
    zaak,
    themaOptions.themaID,
    themaOptions.themaTitle
  );

  let documentType = 'vergunning ';
  if (/vergunning|ontheffing/gi.test(zaak.title.toLowerCase())) {
    documentType = '';
  }

  switch (activeStep.status) {
    case 'Ontvangen':
      return {
        ...baseNotification,
        datePublished: activeStep.datePublished,
        title: `Aanvraag ${zaak.title} ontvangen`,
        description: `Wij hebben uw aanvraag ${zaak.title} met gemeentelijk zaaknummer ${zaak.identifier} ontvangen.`,
      };
    case 'In behandeling':
      return {
        ...baseNotification,
        datePublished: activeStep.datePublished,
        title: `Aanvraag ${zaak.title} in behandeling`,
        description: `Wij hebben uw aanvraag ${zaak.title} met gemeentelijk zaaknummer ${zaak.identifier} in behandeling genomen.`,
      };
    case 'Meer informatie nodig':
      return {
        ...baseNotification,
        datePublished: activeStep.datePublished,
        title: `Meer informatie omtrent uw aanvraag ${zaak.title}`,
        description: `Er is meer informatie nodig om uw aanvraag ${zaak.title} met gemeentelijk zaaknummer ${zaak.identifier} verder te kunnen behandelen.`,
      };
    case 'Afgehandeld': {
      // Verloopt binnenkort
      if (
        'isExpired' in zaak &&
        zaak.dateStart &&
        zaak.dateEnd &&
        isExpiryNotificationDue(zaak.dateStart, zaak.dateEnd)
      ) {
        return {
          ...baseNotification,
          datePublished: toDateFormatted(
            getLifetimeTriggerDate(zaak.dateStart, zaak.dateEnd)
          ),
          title: `Uw ${zaak.title} loopt af`,
          description: `Uw ${documentType}${zaak.title} met gemeentelijk zaaknummer ${zaak.identifier} loopt binnenkort af, vraag zonodig een nieuwe aan.`,
        };
      }

      // Afgehandeld
      return {
        ...baseNotification,
        datePublished: activeStep.datePublished,
        title: `Aanvraag ${zaak.title} afgehandeld`,
        description: `Wij hebben uw aanvraag ${zaak.title} met gemeentelijk zaaknummer ${zaak.identifier} afgehandeld.`,
      };
    }
    case 'Verlopen':
      return {
        ...baseNotification,
        datePublished: activeStep.datePublished,
        title: `${zaak.title} verlopen`,
        description: `Uw ${documentType}${zaak.title} met gemeentelijk zaaknummer ${zaak.identifier} is verlopen.`,
      };
  }

  return null;
}

export function getVergunningNotifications<
  DZ extends DecosZaakBase,
  ID extends string = string,
>(
  vergunningen: VergunningFrontend<DZ>[],
  themaID: ID,
  themaTitle: string,
  createNotification?: typeof createNotificationDefault
): MyNotification[] {
  return vergunningen
    .map((vergunning) =>
      createNotification
        ? createNotification(vergunning, { themaID, themaTitle })
        : createNotificationDefault(vergunning, {
            themaID,
            themaTitle,
          })
    )
    .filter((notification: MyNotification | null) => notification !== null);
}

export async function fetchVergunningenNotifications(
  authProfileAndToken: AuthProfileAndToken
) {
  const VERGUNNINGEN = await fetchVergunningen(
    authProfileAndToken,
    routeConfig.detailPage.path
  );

  if (VERGUNNINGEN.status === 'OK') {
    const notifications = getVergunningNotifications<any>(
      VERGUNNINGEN.content,
      themaId,
      themaTitle
    );

    return apiSuccessResult({
      notifications,
    });
  }

  return apiDependencyError({ VERGUNNINGEN });
}
