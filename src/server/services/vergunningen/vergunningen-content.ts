import { subMonths } from 'date-fns';
import { LinkProps } from 'react-router-dom';
import { dateFormat, defaultDateFormat } from '../../../universal/helpers/date';
import {
  NOTIFICATION_REMINDER_FROM_MONTHS_NEAR_END,
  getCustomTitleForVergunningWithLicensePlates,
  hasWorkflow,
} from '../../../universal/helpers/vergunningen';
import { CaseType } from '../../../universal/types/vergunningen';
import {
  BZB,
  BZP,
  RVVSloterweg,
  TouringcarDagontheffing,
  TouringcarJaarontheffing,
  Vergunning,
  VergunningExpirable,
} from './vergunningen';

type NotificationStatusType =
  | 'almostExpired'
  | 'isExpired'
  | 'requested'
  | 'inProgress'
  | 'done'
  | 'revoked';

type NotificationProperty = 'title' | 'description' | 'datePublished' | 'link';
type NotificationPropertyValue = (
  item: Vergunning,
  titleLower: string
) => string;
type NotificationLink = (item: Vergunning) => LinkProps;

type NotificationLinks = {
  [key in Vergunning['caseType']]?: string;
};

type NotificationLabelsBase = {
  [key in Exclude<NotificationProperty, 'link'>]: NotificationPropertyValue;
};

export interface NotificationLabels extends NotificationLabelsBase {
  link: NotificationLink;
}

export type NotificatonContentLabels = {
  [type in NotificationStatusType]?: NotificationLabels;
};

type NotificationContent = {
  [key in CaseType]?: NotificatonContentLabels;
};

const notificationLinks: NotificationLinks = {
  [CaseType.GPK]:
    'https://formulieren.amsterdam.nl/TripleForms/DirectRegelen/formulier/nl-NL/evAmsterdam/GehandicaptenParkeerKaartAanvraag.aspx',
  [CaseType.BZP]:
    'https://formulieren.amsterdam.nl/TriplEforms/DirectRegelen/formulier/nl-NL/evAmsterdam/Ontheffingblauwezone.aspx',
};

const almostExpired: NotificationLabels = {
  title: (item) => `Uw ${item.title.toLocaleLowerCase()} loopt af`,
  description: (item) => `Uw ${item.title} loopt binnenkort af.`,
  datePublished: (item: VergunningExpirable) =>
    dateFormat(
      subMonths(
        new Date(item.dateEnd ?? item.dateRequest),
        NOTIFICATION_REMINDER_FROM_MONTHS_NEAR_END
      ),
      'yyyy-MM-dd'
    ),
  link: (item) => ({
    title: `Vraag tijdig een nieuwe vergunning aan`,
    to: notificationLinks[item.caseType] || item.link.to,
  }),
};

const isExpired: NotificationLabels = {
  title: (item) => `Uw ${item.caseType} is verlopen`,
  description: (item) => `Uw ${item.title} is verlopen.`,
  datePublished: (item: VergunningExpirable) =>
    item.dateEnd ?? item.dateRequest,
  link: (item) => ({
    title: `Vraag zonodig een nieuwe vergunning aan`,
    to: notificationLinks[item.caseType] || item.link.to,
  }),
};

const link = (item: Vergunning) => ({
  title: 'Bekijk details',
  to: item.link.to,
});

const requested: NotificationLabels = {
  title: (item, titleLower) => `Aanvraag ${titleLower} ontvangen`,
  description: (item, titleLower) =>
    `Uw vergunningsaanvraag ${titleLower} is ontvangen.`,
  datePublished: (item) => item.dateRequest,
  link,
};

const inProgress: NotificationLabels = {
  title: (item, titleLower) => `Aanvraag ${titleLower} in behandeling`,
  description: (item, titleLower) =>
    `Uw vergunningsaanvraag ${titleLower} is in behandeling genomen.`,
  datePublished: (item) =>
    hasWorkflow(item.caseType) && item.dateWorkflowActive
      ? item.dateWorkflowActive
      : item.dateRequest,
  link,
};

const done: NotificationLabels = {
  title: (item, titleLower) => `Aanvraag ${titleLower} afgehandeld`,
  description: (item, titleLower) =>
    `Uw vergunningsaanvraag ${titleLower} is afgehandeld.`,
  datePublished: (item) => item.dateDecision ?? item.dateRequest,
  link,
};

const requestedShort: NotificationLabels = {
  title: requested.title,
  description: (item, titleLower) =>
    `Wij hebben uw aanvraag voor een ${titleLower} ontvangen.`,
  datePublished: requested.datePublished,
  link,
};

const inProgressShort: NotificationLabels = {
  title: inProgress.title,
  description: (item, titleLower) =>
    `Wij hebben uw aanvraag voor een ${titleLower} in behandeling genomen.`,
  datePublished: inProgress.datePublished,
  link,
};

const doneShort: NotificationLabels = {
  title: done.title,
  description: (item, titleLower) =>
    `Wij hebben uw aanvraag voor een ${titleLower} afgehandeld.`,
  datePublished: done.datePublished,
  link,
};

const defaultNotificationLabels: Record<string, NotificatonContentLabels> = {
  long: {
    requested,
    inProgress,
    done,
  },
  short: {
    requested: requestedShort,
    inProgress: inProgressShort,
    done: doneShort,
  },
};

function touringcarTitle(
  vergunning: TouringcarDagontheffing | TouringcarJaarontheffing,
  status: 'ontvangen' | 'in behandeling' | 'afgehandeld'
) {
  const titleBase = getCustomTitleForVergunningWithLicensePlates(vergunning);
  return `${titleBase} ${status}`;
}

function touringcarDescription(
  item: TouringcarDagontheffing | TouringcarJaarontheffing,
  status: 'ontvangen' | 'in behandeling genomen' | 'afgehandeld'
) {
  if (item.caseType === CaseType.TouringcarDagontheffing) {
    return `Wij hebben uw aanvraag ${item.title} ${status}.`;
  } else {
    if (item.routetest) {
      return `Wij hebben uw aanvraag ${item.title} ${status}.`;
    }
    return `Wij hebben uw aanvraag ${item.title} ${status}.`;
  }
}

const touringcarLabels = {
  requested: {
    ...requestedShort,
    title: (item: TouringcarDagontheffing | TouringcarJaarontheffing) =>
      `Aanvraag ${touringcarTitle(item, 'ontvangen')}`,

    description: (item: TouringcarDagontheffing | TouringcarJaarontheffing) =>
      touringcarDescription(item, 'ontvangen'),
  },
  inProgress: {
    ...inProgressShort,
    title: (item: TouringcarDagontheffing | TouringcarJaarontheffing) =>
      `Aanvraag ${touringcarTitle(item, 'in behandeling')}`,

    description: (item: TouringcarDagontheffing | TouringcarJaarontheffing) =>
      touringcarDescription(item, 'in behandeling genomen'),
  },
  done: {
    ...doneShort,
    title: (item: TouringcarDagontheffing | TouringcarJaarontheffing) =>
      `Aanvraag ${touringcarTitle(item, 'afgehandeld')}`,
    description: (item: TouringcarDagontheffing | TouringcarJaarontheffing) =>
      touringcarDescription(item, 'afgehandeld'),
  },
};

export const notificationContent: NotificationContent = {
  [CaseType.BZB]: {
    ...defaultNotificationLabels.short,
    almostExpired: {
      ...almostExpired,
      title: () => 'Uw ontheffing blauwe zone verloopt binnenkort',
      description: (item: BZB | any) =>
        `Uw ontheffing blauwe zone bedrijven (${item.identifier}) loopt ${
          item.dateEnd ? `op ${defaultDateFormat(item.dateEnd)}` : 'binnenkort'
        } af.`,
      link: (item) => ({
        title: 'Bekijk details',
        to: notificationLinks[item.caseType] || item.link.to,
      }),
    },
    isExpired: {
      ...isExpired,
      title: () => 'Uw ontheffing blauwe zone is verlopen',
      description: (item: BZB | any) =>
        `Uw ontheffing blauwe zone bedrijven (${item.identifier}) is ${
          item.dateEnd ? `op ${defaultDateFormat(item.dateEnd)}` : ''
        } verlopen.`,
      link: (item) => ({
        title: 'Bekijk details',
        to: notificationLinks[item.caseType] || item.link.to,
      }),
    },
  },
  [CaseType.BZP]: {
    ...defaultNotificationLabels.short,
    almostExpired: {
      ...almostExpired,
      title: () => 'Uw ontheffing blauwe zone verloopt binnenkort',
      description: (item: BZP | any) =>
        `Uw ontheffing blauwe zone (${item.kenteken}) loopt ${
          item.dateEnd ? `op ${defaultDateFormat(item.dateEnd)}` : 'binnenkort'
        } af.`,
      link: (item) => ({
        title: `Vraag op tijd een nieuwe ontheffing aan`,
        to: notificationLinks[item.caseType] || item.link.to,
      }),
    },
    isExpired: {
      ...isExpired,
      title: () => 'Uw ontheffing blauwe zone is verlopen',
      description: (item: BZP | any) =>
        `Uw ontheffing blauwe zone (${item.kenteken}) is ${
          item.dateEnd ? `op ${defaultDateFormat(item.dateEnd)}` : ''
        } verlopen.`,
      link: (item) => ({
        title: `Vraag een nieuwe ontheffing aan`,
        to: notificationLinks[item.caseType] || item.link.to,
      }),
    },
  },
  [CaseType.GPK]: {
    ...defaultNotificationLabels.long,
    almostExpired,
    isExpired,
  },
  [CaseType.GPP]: defaultNotificationLabels.long,
  [CaseType.ERVV]: defaultNotificationLabels.long,
  [CaseType.TVMRVVObject]: defaultNotificationLabels.long,
  [CaseType.EvenementVergunning]: defaultNotificationLabels.short,
  [CaseType.EvenementMelding]: defaultNotificationLabels.short,
  [CaseType.Omzettingsvergunning]: defaultNotificationLabels.short,
  [CaseType.AanbiedenDiensten]: defaultNotificationLabels.long,
  [CaseType.Flyeren]: defaultNotificationLabels.long,
  [CaseType.NachtwerkOntheffing]: defaultNotificationLabels.short,
  [CaseType.ZwaarVerkeer]: defaultNotificationLabels.short,
  [CaseType.VOB]: defaultNotificationLabels.short,
  [CaseType.Splitsingsvergunning]: defaultNotificationLabels.short,
  [CaseType.Samenvoegingsvergunning]: defaultNotificationLabels.short,
  [CaseType.Onttrekkingsvergunning]: defaultNotificationLabels.short,
  [CaseType.OnttrekkingsvergunningSloop]: defaultNotificationLabels.short,
  [CaseType.VormenVanWoonruimte]: defaultNotificationLabels.long,
  [CaseType.ExploitatieHorecabedrijf]: defaultNotificationLabels.short,
  [CaseType.EigenParkeerplaats]: {
    requested: {
      ...requestedShort,
      title: () => 'Aanvraag Eigen parkeerplaats ontvangen',
      description: () =>
        'Wij hebben uw aanvraag Eigen parkeerplaats ontvangen.',
    },
    inProgress: {
      ...inProgressShort,
      title: () => 'Aanvraag Eigen parkeerplaats in behandeling',
      description: () =>
        'Wij hebben uw aanvraag Eigen parkeerplaats in behandeling genomen.',
    },
    done: {
      ...doneShort,
      title: () => 'Aanvraag Eigen parkeerplaats in afgehandeld',
      description: () =>
        'Wij hebben uw aanvraag Eigen parkeerplaats afgehandeld.',
    },
  },
  [CaseType.EigenParkeerplaatsOpheffen]: {
    requested: {
      ...requestedShort,
      title: () => 'Opzegging Eigen parkeerplaats ontvangen',
      description: () =>
        'Wij hebben uw opzegging Eigen parkeerplaats ontvangen.',
    },
    inProgress: {
      ...inProgressShort,
      title: () => 'Opzegging Eigen parkeerplaats in behandeling',
      description: () =>
        'Wij hebben uw opzegging Eigen parkeerplaats in behandeling genomen.',
    },
    done: {
      ...doneShort,
      title: () => 'Opzegging Eigen parkeerplaats afgehandeld',
      description: () => 'Uw Eigen parkeerplaats is opgezegd.',
    },
  },
  [CaseType.RVVHeleStad]: {
    requested: {
      ...requestedShort,
      title: (item) => `Aanvraag ${item.title} ontvangen`,
      description: (item) => `Uw aanvraag voor een ${item.title} is ontvangen.`,
    },
    inProgress: {
      ...inProgressShort,
      title: (item) => `Aanvraag ${item.title} in behandeling`,
      description: (item) =>
        `Uw aanvraag voor een ${item.title} is in behandeling genomen.`,
    },
    done: {
      ...doneShort,
      title: (item) => `Aanvraag ${item.title} afgehandeld`,
      description: (item) =>
        `Uw aanvraag voor een ${item.title} is afgehandeld.`,
    },
  },
  [CaseType.RVVSloterweg]: {
    requested: {
      ...requestedShort,
      title: (item) =>
        `Aanvraag${
          (item as RVVSloterweg).requestType === 'Wijziging'
            ? ' kentekenwijziging'
            : ''
        } ${item.title} ontvangen`,
      description: (item) =>
        `Wij hebben uw aanvraag voor een${
          (item as RVVSloterweg).requestType === 'Wijziging'
            ? ' kentekenwijziging'
            : ''
        }
        RVV ontheffing ${(item as RVVSloterweg).area}
        ${
          (item as RVVSloterweg).requestType === 'Wijziging'
            ? `van (${(item as RVVSloterweg).previousLicensePlates}) naar `
            : ''
        }
        (${(item as RVVSloterweg).licensePlates}) ontvangen.`,
    },
    inProgress: {
      ...inProgressShort,
      title: (item) =>
        `Aanvraag${
          (item as RVVSloterweg).requestType === 'Wijziging'
            ? ' kentekenwijziging'
            : ''
        } ${item.title} in behandeling`,
      description: (item) =>
        `Wij hebben uw aanvraag voor een${
          (item as RVVSloterweg).requestType === 'Wijziging'
            ? ' kentekenwijziging'
            : ''
        }
        RVV ontheffing ${(item as RVVSloterweg).area}
        ${
          (item as RVVSloterweg).requestType === 'Wijziging'
            ? `van (${(item as RVVSloterweg).previousLicensePlates}) naar `
            : ''
        }
        (${(item as RVVSloterweg).licensePlates}) in behandeling genomen.`,
    },
    done: {
      ...doneShort,
      title: (item) =>
        `Aanvraag${
          (item as RVVSloterweg).requestType === 'Wijziging'
            ? ' kentekenwijziging'
            : ''
        } ${item.title} verleend`,
      datePublished: (item) =>
        (!!item.dateDecision
          ? item.dateDecision
          : !!(item as RVVSloterweg).dateWorkflowVerleend
            ? (item as RVVSloterweg).dateWorkflowVerleend
            : item.dateRequest) ?? '',
      description: (item) =>
        `Wij hebben uw aanvraag voor een${
          (item as RVVSloterweg).requestType === 'Wijziging'
            ? ' kentekenwijziging'
            : ''
        }
        RVV ontheffing ${(item as RVVSloterweg).area}
        ${
          (item as RVVSloterweg).requestType === 'Wijziging'
            ? `van (${(item as RVVSloterweg).previousLicensePlates}) naar `
            : ''
        }
        (${(item as RVVSloterweg).licensePlates}) verleend.`,
    },
    revoked: {
      ...doneShort,
      title: (item) =>
        `Aanvraag${
          (item as RVVSloterweg).requestType === 'Wijziging'
            ? ' kentekenwijziging'
            : ''
        } ${item.title} ingetrokken`,
      description: (item) =>
        `Wij hebben uw aanvraag voor een${
          (item as RVVSloterweg).requestType === 'Wijziging'
            ? ' kentekenwijziging'
            : ''
        } RVV ontheffing ${(item as RVVSloterweg).area}
        ${
          (item as RVVSloterweg).requestType === 'Wijziging'
            ? `van (${(item as RVVSloterweg).previousLicensePlates}) naar `
            : ''
        }
        (${(item as RVVSloterweg).licensePlates}) ingetrokken.`,
    },
  },
  [CaseType.TouringcarDagontheffing]:
    touringcarLabels as NotificatonContentLabels,
  [CaseType.TouringcarJaarontheffing]:
    touringcarLabels as NotificatonContentLabels,
  [CaseType.WVOS]: {
    requested: {
      ...requested,
      title: (item) => `Aanvraag ${item.title} ontvangen`,
      description: (item) => `Uw aanvraag voor ${item.title} is ontvangen.`,
    },
    inProgress: {
      ...inProgress,
      title: (item) => `Aanvraag ${item.title} in behandeling`,
      description: (item) =>
        `Uw aanvraag voor ${item.title} is in behandeling genomen.`,
    },
    done: {
      ...done,
      title: (item) => `Aanvraag ${item.title} afgehandeld`,
      description: (item) => `Uw aanvraag voor ${item.title} is afgehandeld.`,
    },
  },
};
