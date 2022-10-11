import { subMonths } from 'date-fns';
import { LinkProps } from 'react-router-dom';
import { dateFormat, defaultDateFormat } from '../../../universal/helpers';
import { NOTIFICATION_REMINDER_FROM_MONTHS_NEAR_END } from '../../../universal/helpers/vergunningen';
import { CaseType } from '../../../universal/types/vergunningen';
import { BZB, BZP, Vergunning, VergunningExpirable } from './vergunningen';

type NotificationStatusType =
  | 'almostExpired'
  | 'isExpired'
  | 'requested'
  | 'inProgress'
  | 'done';

type NotificationProperty = 'title' | 'description' | 'datePublished' | 'link';
type NotificationPropertyValue = (item: Vergunning) => string;
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
  title: (item) => `Uw ${item.caseType} loopt af`,
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

const requested: NotificationLabels = {
  title: (item) => `${item.caseType} ontvangen`,
  description: (item) => `Uw vergunningsaanvraag ${item.title} is ontvangen.`,
  datePublished: (item) => item.dateRequest,
  link: (item) => ({
    title: 'Bekijk details',
    to: item.link.to,
  }),
};

const inProgress: NotificationLabels = {
  title: (item) => `Uw ${item.caseType} is in behandeling`,
  description: (item) =>
    `Uw vergunningsaanvraag voor ${item.title} is in behandeling genomen.`,
  datePublished: (item) => item.dateRequest,
  link: (item) => ({
    title: 'Bekijk details',
    to: item.link.to,
  }),
};

const done: NotificationLabels = {
  title: (item) => `${item.caseType} afgehandeld`,
  description: (item) =>
    `Uw vergunningsaanvraag voor een ${item.title} is afgehandeld.`,
  datePublished: (item) => item.dateDecision ?? item.dateRequest,
  link: (item) => ({
    title: 'Bekijk details',
    to: item.link.to,
  }),
};

export const notificationContent: NotificationContent = {
  [CaseType.BZB]: {
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
    inProgress: {
      ...inProgress,
      title: () => 'Aanvraag ontheffing blauwe zone',
      description: (item: BZB | any) =>
        `Uw aanvraag ontheffing blauwe zone bedrijven (${item.identifier}) is in behandeling genomen.`,
    },
    done: {
      ...done,
      title: () => 'Aanvraag ontheffing blauwe zone',
      description: (item: BZB | any) =>
        `Uw aanvraag ontheffing blauwe zone bedrijven (${item.identifier}) is afgehandeld.`,
    },
  },
  [CaseType.BZP]: {
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
    inProgress: {
      ...inProgress,
      title: () => 'Aanvraag ontheffing blauwe zone',
      description: (item: BZP | any) =>
        `Uw aanvraag ontheffing blauwe zone (${item.kenteken}) is in behandeling genomen.`,
    },
    done: {
      ...done,
      title: () => 'Aanvraag ontheffing blauwe zone',
      description: (item: BZP | any) =>
        `Uw aanvraag ontheffing blauwe zone (${item.kenteken}) is afgehandeld.`,
    },
  },
  [CaseType.GPK]: {
    almostExpired,
    isExpired,
    inProgress,
    done,
  },
  [CaseType.GPP]: {
    inProgress,
    done,
  },
  [CaseType.ERVV]: {
    inProgress: {
      ...inProgress,
      title: (item) => `Uw ${item.title} is in behandeling`,
    },
    done: {
      ...done,
      title: (item) => `Uw ${item.title} is afgehandeld`,
    },
  },
  [CaseType.TVMRVVObject]: {
    inProgress: {
      ...inProgress,
      title: (item) => `Uw ${item.title} is in behandeling`,
    },
    done: {
      ...done,
      title: (item) => `Uw ${item.title} is afgehandeld`,
    },
  },
  [CaseType.EvenementVergunning]: {
    inProgress: {
      ...inProgress,
      title: (item) => `${item.title} ontvangen`,
      description: (item) =>
        `Uw vergunningsaanvraag ${item.title} is ontvangen.`,
    },
    done: {
      ...done,
      title: (item) => `${item.title} afgehandeld`,
      description: (item) =>
        `Uw vergunningsaanvraag ${item.title} is afgehandeld.`,
    },
  },
  [CaseType.EvenementMelding]: {
    inProgress: {
      ...inProgress,
      title: (item) => `${item.title} in behandeling`,
      description: (item) => `Uw ${item.title} is in behandeling genomen.`,
    },
    done: {
      ...done,
      title: (item) => `${item.title} afgehandeld`,
      description: (item) => `Uw ${item.title} is afgehandeld.`,
    },
  },
  [CaseType.Omzettingsvergunning]: {
    requested: {
      ...requested,
      title: (item) => `Aanvraag ${item.title.toLocaleLowerCase()} ontvangen`,
      description: (item) =>
        `Uw vergunningsaanvraag ${item.title} is geregistreerd.`,
    },
    inProgress: {
      ...inProgress,
      title: (item) =>
        `Aanvraag ${item.title.toLocaleLowerCase()} in behandeling`,
      description: (item) =>
        `Uw vergunningsaanvraag ${item.title} is in behandeling genomen.`,
      datePublished: (item) => item.dateWorkflowActive ?? item.dateRequest,
    },
    done: {
      ...done,
      title: (item) => `Aanvraag ${item.title.toLocaleLowerCase()} afgehandeld`,
      description: (item) =>
        `Uw vergunningsaanvraag ${item.title} is afgehandeld`,
    },
  },
  [CaseType.AanbiedenDiensten]: {
    inProgress: {
      ...inProgress,
      title: (item) => `${item.caseType} in behandeling`,
      description: (item) =>
        `Uw ontheffingsaanvraag ${item.title} is in behandeling genomen.`,
    },
    done: {
      ...done,
      description: (item) =>
        `Uw ontheffingsaanvraag ${item.title} is afgehandeld.`,
    },
  },
  [CaseType.Flyeren]: {
    inProgress: {
      ...inProgress,
      title: (item) => `${item.title} in behandeling`,
      description: (item) =>
        `Uw ontheffingsaanvraag voor ${item.title.toLocaleLowerCase()} is in behandeling genomen.`,
    },
    done: {
      ...done,
      title: (item) => `${item.title} afgehandeld`,
      description: (item) =>
        `Uw ontheffingsaanvraag voor ${item.title.toLocaleLowerCase()} is afgehandeld.`,
    },
  },
};
