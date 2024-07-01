import { subMonths } from 'date-fns';
import { dateFormat } from '../../../universal/helpers';
import { NOTIFICATION_REMINDER_FROM_MONTHS_NEAR_END } from '../../../universal/helpers/vergunningen';
import { CaseTypeV2 } from '../../../universal/types/vergunningen';
import {
  NotificationLabels,
  NotificationLinks,
  RVVSloterweg,
  VergunningExpirable,
  VergunningFrontendV2,
} from './config-and-types';

const notificationLinks: NotificationLinks = {
  [CaseTypeV2.GPK]:
    'https://formulieren.amsterdam.nl/TripleForms/DirectRegelen/formulier/nl-NL/evAmsterdam/GehandicaptenParkeerKaartAanvraag.aspx',
  [CaseTypeV2.BZP]:
    'https://formulieren.amsterdam.nl/TriplEforms/DirectRegelen/formulier/nl-NL/evAmsterdam/Ontheffingblauwezone.aspx',
};

const link = (vergunning: VergunningFrontendV2) => ({
  title: 'Bekijk details',
  to: vergunning.link.to,
});

const statusAanvraag: NotificationLabels = {
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
    vergunning.dateInBehandeling
      ? vergunning.dateInBehandeling
      : vergunning.dateRequest,
  link,
};

const statusAfgehandeld: NotificationLabels = {
  title: (vergunning) => `Aanvraag ${vergunning.title} afgehandeld`,
  description: (vergunning) =>
    `Wij hebben uw aanvraag ${vergunning.title} afgehandeld.`,
  datePublished: (vergunning) =>
    vergunning.dateDecision ?? vergunning.dateRequest,
  link,
};

const verlooptBinnenkort: NotificationLabels = {
  title: (vergunning) => `Uw ${vergunning.title} loopt af`,
  description: (vergunning) => `Uw ${vergunning.title} loopt binnenkort af.`,
  datePublished: (vergunning: VergunningExpirable) =>
    dateFormat(
      subMonths(
        new Date(vergunning.dateEnd ?? vergunning.dateRequest),
        NOTIFICATION_REMINDER_FROM_MONTHS_NEAR_END
      ),
      'yyyy-MM-dd'
    ),
  link: (vergunning) => ({
    title: `Vraag tijdig een nieuwe vergunning aan`,
    to: notificationLinks[vergunning.caseType] || vergunning.link.to,
  }),
};

const isVerlopen: NotificationLabels = {
  title: (vergunning) => `Uw ${vergunning.caseType} is verlopen`,
  description: (vergunning) => `Uw ${vergunning.title} is verlopen.`,
  datePublished: (vergunning: VergunningExpirable) =>
    vergunning.dateEnd ?? vergunning.dateRequest,
  link: (vergunning) => ({
    title: `Vraag zonodig een nieuwe vergunning aan`,
    to: notificationLinks[vergunning.caseType] || vergunning.link.to,
  }),
};

const isIngetrokken: NotificationLabels = {
  ...statusAfgehandeld,
  title: (vergunning) =>
    `Aanvraag${
      (vergunning as RVVSloterweg).requestType === 'Wijziging'
        ? ' kentekenwijziging'
        : ''
    } ${vergunning.title} ingetrokken`,
  description: (vergunning) =>
    `Wij hebben uw aanvraag voor een${
      (vergunning as RVVSloterweg).requestType === 'Wijziging'
        ? ' kentekenwijziging'
        : ''
    } RVV ontheffing ${(vergunning as RVVSloterweg).area}
        ${
          (vergunning as RVVSloterweg).requestType === 'Wijziging'
            ? `van (${(vergunning as RVVSloterweg).vorigeKentekens}) naar `
            : ''
        }
        (${(vergunning as RVVSloterweg).kentekens}) ingetrokken.`,
};

export const caseNotificationLabelsDefault = {
  statusAanvraag,
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
