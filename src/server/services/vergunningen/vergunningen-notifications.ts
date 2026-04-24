import { type ZaakFrontendCombined } from './config-and-types.ts';
import {
  getLifetimeTriggerDate,
  isExpiryNotificationDue,
} from './vergunningen-helpers.ts';
import {
  VERGUNNING_AANVRAAG_LINKS,
  type CaseType,
} from './vergunningen-notifications-config.ts';
import { fetchVergunningen } from './vergunningen.ts';
import { themaConfig } from '../../../client/pages/Thema/Vergunningen/Vergunningen-thema-config.ts';
import {
  apiDependencyError,
  apiSuccessResult,
} from '../../../universal/helpers/api.ts';
import { isRecentNotification } from '../../../universal/helpers/utils.ts';
import type { MyNotification } from '../../../universal/types/App.types.ts';
import type { AuthProfileAndToken } from '../../auth/auth-types.ts';
import { getStatusDate } from '../decos/decos-helpers.ts';

function getNotificationBase<ID extends string>(
  vergunning: ZaakFrontendCombined,
  themaID: ID,
  themaTitle: string
): Pick<MyNotification, 'themaID' | 'themaTitle' | 'id' | 'link'> {
  const notificationBaseProperties = {
    themaID,
    themaTitle,
    id: `vergunning-${vergunning.id}-notification`,
    link: {
      to: vergunning.link.to,
      title: 'Bekijk details',
    },
  };
  return notificationBaseProperties;
}

export type NotificationThemaOptions = {
  themaID: string;
  themaTitle: string;
};

export function createNotificationDefault(
  zaak: ZaakFrontendCombined,
  themaOptions: NotificationThemaOptions
): MyNotification | null {
  const activeStep = zaak.steps.find((step) => step.isActive);

  let datePublished: string = activeStep?.datePublished ?? '';
  let isArchivedNotification = false;

  if (
    activeStep &&
    ['Verlopen', 'Ingetrokken', 'Afgehandeld'].includes(activeStep.status)
  ) {
    datePublished =
      datePublished || // If empty string fallback to afgehandeld or decision date
      (getStatusDate('Afgehandeld', zaak) ?? zaak.dateDecision ?? '');

    if (datePublished && !isRecentNotification(datePublished, new Date())) {
      isArchivedNotification = true;
    }
  }

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
        datePublished,
        title: `Aanvraag ${zaak.title} ontvangen`,
        description: `Wij hebben uw aanvraag ${zaak.title} met zaaknummer ${zaak.identifier} ontvangen.`,
      };
    case 'In behandeling':
      return {
        ...baseNotification,
        datePublished,
        title: `Aanvraag ${zaak.title} in behandeling`,
        description: `Wij hebben uw aanvraag ${zaak.title} met zaaknummer ${zaak.identifier} in behandeling genomen.`,
      };
    case 'Meer informatie nodig':
      return {
        ...baseNotification,
        datePublished,
        title: `Meer informatie omtrent uw aanvraag ${zaak.title}`,
        description: `Er is meer informatie nodig om uw aanvraag ${zaak.title} met zaaknummer ${zaak.identifier} verder te kunnen behandelen.`,
      };
    case 'Ingetrokken':
    case 'Afgehandeld': {
      // Verloopt binnenkort
      if (
        activeStep.status !== 'Ingetrokken' &&
        'isExpired' in zaak &&
        zaak.dateStart &&
        zaak.dateEnd &&
        isExpiryNotificationDue(zaak.dateStart, zaak.dateEnd)
      ) {
        const url =
          zaak.caseType && zaak.caseType in VERGUNNING_AANVRAAG_LINKS
            ? VERGUNNING_AANVRAAG_LINKS[zaak.caseType as CaseType]
            : null;
        return {
          ...baseNotification,
          datePublished: getLifetimeTriggerDate(
            zaak.dateStart,
            zaak.dateEnd
          ).toISOString(),
          title: `Uw ${zaak.title} loopt af`,
          description: `Uw ${documentType}${zaak.title} met zaaknummer ${zaak.identifier} loopt binnenkort af, ${url ? `<a href="${url}" rel="noopener noreferrer">vraag zonodig een nieuwe aan</a>` : 'vraag zonodig een nieuwe aan'}.`,
        };
      }

      // Afgehandeld
      return {
        ...baseNotification,
        datePublished,
        title: `Aanvraag ${zaak.title} afgehandeld`,
        description: `Wij hebben uw aanvraag ${zaak.title} met zaaknummer ${zaak.identifier} afgehandeld.`,
      };
    }
    case 'Verlopen':
      return {
        ...baseNotification,
        datePublished,
        title: `${zaak.title} verlopen`,
        description: `Uw ${documentType}${zaak.title} met zaaknummer ${zaak.identifier} is verlopen.`,
      };
  }

  return null;
}

export function getVergunningNotifications(
  vergunningen: ZaakFrontendCombined[],
  themaID: string,
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
    themaConfig.detailPage.route.path
  );

  if (VERGUNNINGEN.status === 'OK') {
    const notifications = getVergunningNotifications(
      VERGUNNINGEN.content,
      themaConfig.id,
      themaConfig.title
    );

    return apiSuccessResult({
      notifications,
    });
  }

  return apiDependencyError({ VERGUNNINGEN });
}
