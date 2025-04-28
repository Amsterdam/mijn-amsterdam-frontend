import { subMonths } from 'date-fns';

import {
  NotificationLabels,
  VergunningFrontend,
  NOTIFICATION_REMINDER_FROM_MONTHS_NEAR_END,
} from './config-and-types';
import { dateFormat } from '../../../universal/helpers/date';
import { getStatusDate } from '../decos/decos-helpers';

const link = (vergunning: VergunningFrontend) => ({
  title: 'Bekijk details',
  to: vergunning.link.to,
});

const statusOntvangen: NotificationLabels = {
  title: (vergunning) => `Aanvraag ${vergunning.title} ontvangen`,
  description: (vergunning) =>
    `Wij hebben uw aanvraag ${vergunning.title} ontvangen.`,
  datePublished: (vergunning) => vergunning.dateRequest,
  link,
};

const statusInBehandeling: NotificationLabels = {
  title: (vergunning) => `Aanvraag ${vergunning.title} in behandeling`,
  description: (vergunning) =>
    `Wij hebben uw aanvraag ${vergunning.title} in behandeling genomen.`,
  datePublished: (vergunning) =>
    getStatusDate('In behandeling', vergunning) ?? vergunning.dateRequest,
  link,
};

const statusAfgehandeld: NotificationLabels = {
  title: (vergunning) => `Aanvraag ${vergunning.title} afgehandeld`,
  description: (vergunning) =>
    `Wij hebben uw aanvraag ${vergunning.title} afgehandeld.`,
  datePublished: (vergunning) => vergunning.dateDecision ?? '',
  link,
};

const verlooptBinnenkort: NotificationLabels = {
  title: (vergunning) => `Uw ${vergunning.title} loopt af`,
  description: (vergunning) => `Uw ${vergunning.title} loopt binnenkort af.`,
  datePublished: (vergunning) =>
    vergunning.dateEnd
      ? dateFormat(
          subMonths(
            new Date(vergunning.dateEnd),
            NOTIFICATION_REMINDER_FROM_MONTHS_NEAR_END
          ),
          'yyyy-MM-dd'
        )
      : '',
  link: (vergunning) => ({
    title: `Vraag tijdig een nieuwe vergunning aan`,
    to: vergunning.link.to,
  }),
};

const isVerlopen: NotificationLabels = {
  title: (vergunning) => `Uw ${vergunning.caseType} is verlopen`,
  description: (vergunning) => `Uw ${vergunning.title} is verlopen.`,
  datePublished: (vergunning) => vergunning.dateEnd ?? '',
  link: (vergunning) => ({
    title: `Vraag zonodig een nieuwe vergunning aan`,
    to: vergunning.link.to,
  }),
};

const isIngetrokken: NotificationLabels = {
  ...statusAfgehandeld,
  title: (vergunning) =>
    `Aanvraag${
      'requestType' in vergunning && vergunning.requestType === 'Wijziging'
        ? ' kentekenwijziging'
        : ''
    } ${vergunning.title} ingetrokken`,
  description: (vergunning) =>
    `Wij hebben uw aanvraag voor een${
      'requestType' in vergunning && vergunning.requestType === 'Wijziging'
        ? ' kentekenwijziging'
        : ''
    } RVV ontheffing ${'area' in vergunning ? vergunning.area : ''}
        ${
          'requestType' in vergunning &&
          'vorigeKentekens' in vergunning &&
          vergunning.requestType === 'Wijziging'
            ? `van (${vergunning.vorigeKentekens}) naar `
            : ''
        }
        (${'kentekens' in vergunning ? vergunning.kentekens : ''}) ingetrokken.`,
};

export const caseNotificationLabelsDefault = {
  statusOntvangen,
  statusInBehandeling,
  statusAfgehandeld,
};

export const caseNotificationLabelsExpirables = {
  ...caseNotificationLabelsDefault,
  verlooptBinnenkort,
  isVerlopen,
};

export const caseNotificationLabelsRevoke = {
  ...caseNotificationLabelsDefault,
  isIngetrokken,
};
