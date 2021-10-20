import { subMonths } from 'date-fns';
import { dateFormat } from '../../../universal/helpers';
import { NOTIFICATION_REMINDER_FROM_MONTHS_NEAR_END } from '../../../universal/helpers/vergunningen';
import { CaseType } from '../../../universal/types/vergunningen';
import { Vergunning, VergunningExpirable } from './vergunningen';

type NotificationPartContents = (item: Vergunning) => string;
type NotificationPartExpirable = (item: VergunningExpirable) => string;
type NotificationLinks = {
  [key in Vergunning['caseType']]?: string;
};

interface ContentItem {
  title: NotificationPartContents;
  description: NotificationPartContents;
  datePublished: NotificationPartContents;
  linkTo: NotificationPartContents;
  cta: string;
}

interface ContentItemExpirable {
  title: NotificationPartExpirable;
  description: NotificationPartExpirable;
  datePublished: NotificationPartExpirable;
  linkTo: NotificationPartExpirable;
  cta: string;
}

interface NotificatonContentItems {
  almostExpired?: ContentItemExpirable;
  isExpired?: ContentItemExpirable;
  requested?: ContentItem;
  inProgress?: ContentItem;
  done?: ContentItem;
}

interface NotificationContent {
  [CaseType.TVMRVVObject]: NotificatonContentItems;
  [CaseType.GPK]: NotificatonContentItems;
  [CaseType.GPP]: NotificatonContentItems;
  [CaseType.EvenementMelding]: NotificatonContentItems;
  [CaseType.EvenementVergunning]: NotificatonContentItems;
  [CaseType.Omzettingsvergunning]: NotificatonContentItems;
  [CaseType.ERVV]: NotificatonContentItems;
  [CaseType.BZB]: NotificatonContentItems;
  [CaseType.BZP]: NotificatonContentItems;
  [CaseType.VakantieVerhuur]: NotificatonContentItems;
  [CaseType.BBVergunning]: NotificatonContentItems;
  [CaseType.VakantieverhuurVergunningaanvraag]: NotificatonContentItems;
}

const notificationLinks: NotificationLinks = {
  [CaseType.BZB]:
    'https://www.amsterdam.nl/veelgevraagd/?productid=%7B1153113D-FA40-4EB0-8132-84E99746D7B0%7D',
  [CaseType.BZP]:
    'https://www.amsterdam.nl/veelgevraagd/?productid=%7B1153113D-FA40-4EB0-8132-84E99746D7B0%7D', // Not yet available in RD
  [CaseType.GPK]:
    'https://formulieren.amsterdam.nl/TripleForms/DirectRegelen/formulier/nl-NL/evAmsterdam/GehandicaptenParkeerKaartAanvraag.aspx',
};

const almostExpiredContent: ContentItemExpirable = {
  title: (item) => `Uw ${item.caseType} loopt af`,
  description: (item) => `Uw ${item.title} loopt binnenkort af.`,
  cta: `Vraag tijdig een nieuwe vergunning aan`,
  datePublished: (item) =>
    dateFormat(
      subMonths(
        new Date(item.dateEnd ?? item.dateRequest),
        NOTIFICATION_REMINDER_FROM_MONTHS_NEAR_END
      ),
      'yyyy-MM-dd'
    ),
  linkTo: (item) => notificationLinks[item.caseType] || item.link.to,
};

const isExpiredContent: ContentItemExpirable = {
  title: (item) => `Uw ${item.caseType} is verlopen`,
  description: (item) => `Uw ${item.title} is verlopen.`,
  cta: `Vraag zonodig een nieuwe vergunning aan`,
  datePublished: (item) => item.dateEnd ?? item.dateRequest,
  linkTo: (item) => notificationLinks[item.caseType] || item.link.to,
};

const requestedContent: ContentItem = {
  title: (item) => `${item.caseType} ontvangen`,
  description: (item) => `Uw vergunningsaanvraag ${item.title} is ontvangen.`,
  datePublished: (item) => item.dateRequest,
  linkTo: (item) => item.link.to,
  cta: 'Bekijk details',
};

const inProgressContent: ContentItem = {
  title: (item) => `Uw ${item.caseType} is in behandeling`,
  description: (item) =>
    `Uw vergunningsaanvraag voor ${item.title} is in behandeling genomen.`,
  datePublished: (item) => item.dateRequest,
  linkTo: (item) => item.link.to,
  cta: 'Bekijk details',
};

const doneContent: ContentItem = {
  title: (item) => `${item.caseType} afgehandeld`,
  description: (item) =>
    `Uw vergunningsaanvraag voor een ${item.title} is afgehandeld.`,
  datePublished: (item) => item.dateDecision ?? item.dateRequest,
  linkTo: (item) => item.link.to,
  cta: 'Bekijk details',
};

export const notificationContent: NotificationContent = {
  [CaseType.BZB]: {
    almostExpired: {
      ...almostExpiredContent,
    },
    isExpired: {
      ...isExpiredContent,
    },
    inProgress: {
      ...inProgressContent,
    },
    done: {
      ...doneContent,
    },
  },
  [CaseType.BZP]: {
    almostExpired: {
      ...almostExpiredContent,
    },
    isExpired: {
      ...isExpiredContent,
    },
    inProgress: {
      ...inProgressContent,
    },
    done: {
      ...doneContent,
    },
  },
  [CaseType.GPK]: {
    almostExpired: {
      ...almostExpiredContent,
    },
    isExpired: {
      ...isExpiredContent,
    },
    inProgress: {
      ...inProgressContent,
    },
    done: {
      ...doneContent,
    },
  },
  [CaseType.GPP]: {
    inProgress: {
      ...inProgressContent,
    },
    done: {
      ...doneContent,
    },
  },
  [CaseType.ERVV]: {
    inProgress: {
      ...inProgressContent,
      title: (item) => `Uw ${item.title} is in behandeling`,
    },
    done: {
      ...doneContent,
      title: (item) => `Uw ${item.title} is afgehandeld`,
    },
  },
  [CaseType.TVMRVVObject]: {
    inProgress: {
      ...inProgressContent,
      title: (item) => `Uw ${item.title} is in behandeling`,
    },
    done: {
      ...doneContent,
      title: (item) => `Uw ${item.title} is afgehandeld`,
    },
  },
  [CaseType.EvenementVergunning]: {
    inProgress: {
      ...inProgressContent,
      title: (item) => `${item.title} ontvangen`,
      description: (item) =>
        `Uw vergunningsaanvraag ${item.title} is ontvangen.`,
    },
    done: {
      ...doneContent,
      title: (item) => `${item.title} afgehandeld`,
      description: (item) =>
        `Uw vergunningsaanvraag ${item.title} is afgehandeld.`,
    },
  },
  [CaseType.EvenementMelding]: {
    inProgress: {
      ...inProgressContent,
      title: (item) => `${item.title} in behandeling`,
      description: (item) => `Uw ${item.title} is in behandeling genomen.`,
    },
    done: {
      ...doneContent,
      title: (item) => `${item.title} afgehandeld`,
      description: (item) => `Uw ${item.title} is afgehandeld.`,
    },
  },
  [CaseType.Omzettingsvergunning]: {
    requested: {
      ...requestedContent,
      title: (item) => `Aanvraag ${item.title.toLocaleLowerCase()} ontvangen`,
      description: (item) =>
        `Uw vergunningsaanvraag ${item.title.toLocaleLowerCase()} is geregistreerd.`,
    },
    inProgress: {
      ...inProgressContent,
      title: (item) =>
        `Aanvraag ${item.title.toLocaleLowerCase()} in behandeling`,
      description: (item) =>
        `Uw vergunningsaanvraag ${item.title} is in behandeling genomen.`,
      datePublished: (item) => item.dateWorkflowActive ?? item.dateRequest,
    },
    done: {
      ...doneContent,
      title: (item) => `Aanvraag ${item.title.toLocaleLowerCase()} afgehandeld`,
    },
  },
  //TODO: Add those eventually later
  [CaseType.VakantieVerhuur]: {},
  [CaseType.BBVergunning]: {},
  [CaseType.VakantieverhuurVergunningaanvraag]: {},
};
