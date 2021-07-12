import { differenceInMonths, subMonths } from 'date-fns';
import { generatePath } from 'react-router-dom';
import { Chapters } from '../../universal/config/index';
import { AppRoutes } from '../../universal/config/routes';
import { apiDependencyError } from '../../universal/helpers';
import { apiSuccesResult } from '../../universal/helpers/api';
import {
  dateFormat,
  dateSort,
  isDateInPast,
  monthsFromNow,
} from '../../universal/helpers/date';
import { hash, isRecentCase } from '../../universal/helpers/utils';
import {
  GenericDocument,
  LinkProps,
  MyCase,
  MyNotification,
} from '../../universal/types/App.types';
import { getApiConfig } from '../config';
import { requestData } from '../helpers';
import { ToeristischeVerhuurVergunning } from './toeristische-verhuur';

const MONTHS_TO_KEEP_NOTIFICATIONS = 3;

enum CaseType {
  TVMRVVObject = 'TVM - RVV - Object',
  GPK = 'GPK',
  GPP = 'GPP',
  EvenementMelding = 'Evenement melding',
  Omzettingsvergunning = 'Omzettingsvergunning',
  ERVV = 'E-RVV - TVM',
  VakantieVerhuur = 'Vakantieverhuur',
  VakantieverhuurVergunningaanvraag = 'Vakantieverhuur vergunningsaanvraag',
  BBVergunning = 'B&B - vergunning',
  BZP = 'Parkeerontheffingen Blauwe zone particulieren',
  BZB = 'Parkeerontheffingen Blauwe zone bedrijven',
}

export const toeristischeVerhuurVergunningTypes: Array<
  VergunningBase['caseType']
> = [
  CaseType.VakantieVerhuur,
  CaseType.VakantieverhuurVergunningaanvraag,
  CaseType.BBVergunning,
];

export interface VergunningBase {
  caseType: CaseType;
  status: 'Toewijzen' | 'Afgehandeld' | 'Ontvangen' | string;
  title: string;
  description: string;
  identifier: string;
  dateRequest: string;
  decision: string | null;
  dateDecision?: string | null;
  isActual: boolean;
  documentsUrl: string | null;
  id: string;
  link: LinkProps;
}

export interface TVMRVVObject extends VergunningBase {
  caseType: CaseType.TVMRVVObject;
  dateStart: string | null;
  dateEnd: string | null;
  timeStart: string | null;
  timeEnd: string | null;
  location: string | null;
}

export interface GPK extends VergunningBase {
  caseType: CaseType.GPK;
  cardtype: 'driver' | 'passenger';
  cardNumber: string | null;
  dateEnd: string | null;
  location: string | null;
  requestReason: string | null;
}

export interface GPP extends VergunningBase {
  caseType: CaseType.GPP;
  location: string | null;
  kenteken: string | null;
}

export interface EvenementMelding extends VergunningBase {
  caseType: CaseType.EvenementMelding;
  location: string | null;
  visitorCount: number | null;
  activities: string | null;
  eventType: string | null;
  timeStart: string | null;
  timeEnd: string | null;
  dateStart: string | null;
  dateEnd: string | null;
}

export interface Omzettingsvergunning extends VergunningBase {
  caseType: CaseType.Omzettingsvergunning;
  location: string | null;
}

export interface ERVV extends VergunningBase {
  caseType: CaseType.ERVV;
  dateStart: string | null;
  dateEnd: string | null;
  location: string | null;
}

export interface Vakantieverhuur extends VergunningBase {
  caseType: CaseType.VakantieVerhuur;
  dateStart: string | null;
  dateEnd: string | null;
  location: string | null;
  cancelled?: boolean;
  dateCancelled?: string;
}

export interface VakantieverhuurVergunningaanvraag extends VergunningBase {
  caseType: CaseType.VakantieverhuurVergunningaanvraag;
  dateStart: string | null;
  dateEnd: string | null;
  decision: string | null;
  location: string | null;
}

export interface BBVergunning extends VergunningBase {
  caseType: CaseType.BBVergunning;
  location: string | null;
  dateStart: string | null;
  dateEnd: string | null;
  decision: string | null;
  requester: string | null;
  owner: string | null;
  hasTransitionAgreement: boolean;
}

// BZB is short for Parkeerontheffingen Blauwe zone bedrijven
export interface BZB extends VergunningBase {
  caseType: CaseType.BZB;
  companyName: string | null;
  dateStart: string | null;
  dateEnd: string | null;
  decision: string | null;
}

// BZP is short for Parkeerontheffingen Blauwe zone particulieren
export interface BZP extends VergunningBase {
  caseType: CaseType.BZP;
  kenteken: string | null;
  dateStart: string | null;
  dateEnd: string | null;
  decision: string | null;
}

export type Vergunning =
  | TVMRVVObject
  | GPK
  | GPP
  | EvenementMelding
  | Omzettingsvergunning
  | ERVV
  | BZB
  | BZP
  | Vakantieverhuur
  | BBVergunning
  | VakantieverhuurVergunningaanvraag;

export type VergunningenSourceData = {
  content?: Vergunning[];
  status: 'OK' | 'ERROR';
};

type NotificationItems = Exclude<
  Vergunning,
  | TVMRVVObject
  | Vakantieverhuur
  | BBVergunning
  | ERVV
  | VakantieverhuurVergunningaanvraag
  | GPP
  | EvenementMelding
  | Omzettingsvergunning
>;

type NotificationLinks = {
  [key in NotificationItems['caseType']]: string;
};

export interface VergunningDocument extends GenericDocument {
  sequence: number;
}

export type VergunningenData = Vergunning[];

export interface VergunningOptions {
  filter?: (vergunning: Vergunning) => boolean;
  appRoute: string | ((vergunning: Vergunning) => string);
}

export const NOTIFICATION_REMINDER_FROM_MONTHS_NEAR_END = 3;

export function transformVergunningenData(
  responseData: VergunningenSourceData
): VergunningenData {
  if (!Array.isArray(responseData?.content)) {
    return [];
  }

  let vergunningen: Vergunning[] = responseData?.content?.map((item) => {
    const id = hash(
      `vergunning-${item.identifier || item.caseType + item.dateRequest}`
    );
    const vergunning = Object.assign({}, item, {
      id,
    });
    return vergunning;
  });

  return vergunningen.sort(dateSort('dateRequest', 'desc'));
}

export function fetchAllVergunningen(
  sessionID: SessionID,
  passthroughRequestHeaders: Record<string, string>
) {
  return requestData<VergunningenData>(
    getApiConfig('VERGUNNINGEN', {
      transformResponse: transformVergunningenData,
    }),
    sessionID,
    passthroughRequestHeaders
  );
}

const vergunningOptionsDefault: VergunningOptions = {
  appRoute: AppRoutes['VERGUNNINGEN/DETAIL'],
  filter: (vergunning) =>
    !toeristischeVerhuurVergunningTypes.includes(vergunning.caseType),
};

export async function fetchVergunningen(
  sessionID: SessionID,
  passthroughRequestHeaders: Record<string, string>,
  options: VergunningOptions = vergunningOptionsDefault
) {
  const response = await fetchAllVergunningen(
    sessionID,
    passthroughRequestHeaders
  );

  if (response.status === 'OK') {
    let { content: vergunningen } = response;
    vergunningen = vergunningen.map((vergunning) => {
      const appRoute =
        typeof options.appRoute === 'function'
          ? options.appRoute(vergunning)
          : options.appRoute;
      return {
        ...vergunning,
        link: {
          to: options?.appRoute
            ? generatePath(appRoute, {
                id: vergunning.id,
              })
            : '/',
          title: vergunning.identifier,
        },
      };
    });

    if (options?.filter) {
      vergunningen = vergunningen.filter(options.filter);
    }

    return apiSuccesResult(vergunningen);
  }

  return response;
}

export function isNearEndDate(
  vergunning: ToeristischeVerhuurVergunning | GPK | BZP | BZB
) {
  if (!vergunning.dateEnd) {
    return false;
  }

  const monthsTillEnd = monthsFromNow(vergunning.dateEnd);

  return (
    !isExpired(vergunning) &&
    monthsTillEnd < NOTIFICATION_REMINDER_FROM_MONTHS_NEAR_END &&
    monthsTillEnd >= 0
  );
}

export function isExpired(
  vergunning: ToeristischeVerhuurVergunning | GPK | BZP | BZB
) {
  if (!vergunning.dateEnd) {
    return false;
  }

  return isDateInPast(vergunning.dateEnd);
}

export function createVergunningRecentCase(item: Vergunning): MyCase {
  return {
    id: `vergunning-${item.id}-case`,
    title: `Vergunningsaanvraag ${item.identifier}`,
    link: item.link,
    chapter: Chapters.VERGUNNINGEN,
    datePublished: item.dateRequest,
  };
}

export function hasOtherValidVergunningOfSameType(
  items: Array<ToeristischeVerhuurVergunning | GPK | BZP | BZB>,
  item: ToeristischeVerhuurVergunning | GPK | BZP | BZB
): boolean {
  return items.some(
    (otherVergunning: ToeristischeVerhuurVergunning | GPK | BZP | BZB) =>
      otherVergunning.caseType === item.caseType &&
      otherVergunning.identifier !== item.identifier &&
      !isExpired(otherVergunning)
  );
}

export function createVergunningNotification(
  item: Vergunning,
  items: Vergunning[]
): MyNotification {
  const notificationLinks: NotificationLinks = {
    'Parkeerontheffingen Blauwe zone bedrijven':
      'https://www.amsterdam.nl/veelgevraagd/?productid=%7B1153113D-FA40-4EB0-8132-84E99746D7B0%7D',
    'Parkeerontheffingen Blauwe zone particulieren':
      'https://www.amsterdam.nl/veelgevraagd/?productid=%7B1153113D-FA40-4EB0-8132-84E99746D7B0%7D', // Not yet available in RD
    GPK: 'https://formulieren.amsterdam.nl/TripleForms/DirectRegelen/formulier/nl-NL/evAmsterdam/GehandicaptenParkeerKaartAanvraag.aspx/Inleiding',
  };
  let title = 'Vergunningsaanvraag';
  let description = 'Er is een update in uw vergunningsaanvraag.';
  let datePublished = item.dateRequest;
  let linkTo = item.link.to;
  let cta = 'Bekijk details';

  if (
    item.caseType === 'GPK' ||
    item.caseType === 'Parkeerontheffingen Blauwe zone bedrijven' ||
    item.caseType === 'Parkeerontheffingen Blauwe zone particulieren'
  ) {
    const allItems = items.filter(
      (caseItem: Vergunning): caseItem is GPK => caseItem.caseType === 'GPK'
    );

    const notificationLink = notificationLinks[item.caseType];
    const fullName = item.title;
    switch (true) {
      case item.decision === 'Verleend' &&
        isNearEndDate(item) &&
        !hasOtherValidVergunningOfSameType(allItems, item):
        title = `${item.caseType} loopt af`;
        description = `Uw ${item.title} loopt binnenkort af. Vraag tijdig een nieuwe vergunning aan.`;
        cta = `Vraag op tijd een nieuwe ${item.caseType} aan`;
        linkTo = notificationLink;
        datePublished = dateFormat(
          subMonths(
            new Date(item.dateEnd!),
            NOTIFICATION_REMINDER_FROM_MONTHS_NEAR_END
          ),
          'yyyy-MM-dd'
        );
        break;
      case item.decision === 'Verleend' &&
        isExpired(item) &&
        !hasOtherValidVergunningOfSameType(allItems, item):
        title = `${item.caseType} is verlopen`;
        description = `Uw ${fullName} is verlopen.`;
        cta = `Vraag een nieuwe ${item.caseType} aan`;
        linkTo = notificationLink;
        datePublished = item.dateEnd!;
        break;
      case item.status !== 'Afgehandeld':
        description = `Uw aanvraag voor een ${fullName} is in behandeling.`;
        break;
      case item.status === 'Afgehandeld':
        description = `Uw aanvraag voor een ${fullName} is afgehandeld.`;
        break;
    }
  } else {
    let fullName: string = item.title;
    let shortName: string = item.title;
    switch (item.caseType) {
      case 'GPP':
        shortName = item.caseType;
        break;
    }
    switch (true) {
      case item.status !== 'Afgehandeld':
        title = `${shortName} in behandeling`;
        description = `Uw vergunningsaanvraag ${fullName} is in behandeling.`;
        break;
      case item.status === 'Afgehandeld':
        title = `${shortName} afgehandeld`;
        description = `Uw vergunningsaanvraag ${fullName} is afgehandeld.`;
        break;
    }
  }

  return {
    id: `vergunning-${item.id}-notification`,
    datePublished,
    chapter: Chapters.VERGUNNINGEN,
    title,
    description,
    link: {
      to: linkTo,
      title: cta,
    },
  };
}

export function isActualNotification(
  datePublished: string,
  compareDate: Date
): boolean {
  return (
    differenceInMonths(compareDate, new Date(datePublished)) <
    MONTHS_TO_KEEP_NOTIFICATIONS
  );
}

export async function fetchVergunningenGenerated(
  sessionID: SessionID,
  passthroughRequestHeaders: Record<string, string>,
  compareDate?: Date
) {
  const VERGUNNINGEN = await fetchVergunningen(
    sessionID,
    passthroughRequestHeaders
  );

  if (VERGUNNINGEN.status === 'OK') {
    const compareToDate = compareDate || new Date();

    const cases: MyCase[] = Array.isArray(VERGUNNINGEN.content)
      ? VERGUNNINGEN.content
          .filter(
            (vergunning) =>
              vergunning.status !== 'Afgehandeld' ||
              (vergunning.dateDecision &&
                isRecentCase(vergunning.dateDecision, compareToDate))
          )
          .map(createVergunningRecentCase)
      : [];

    const notifications: MyNotification[] = Array.isArray(VERGUNNINGEN.content)
      ? VERGUNNINGEN.content
          .filter(
            (vergunning) =>
              vergunning.status !== 'Afgehandeld' ||
              (vergunning.dateDecision &&
                isActualNotification(vergunning.dateDecision, compareToDate))
          )
          .map((vergunning) =>
            createVergunningNotification(vergunning, VERGUNNINGEN.content)
          )
      : [];

    return apiSuccesResult({
      cases,
      notifications,
    });
  }

  return apiDependencyError({ VERGUNNINGEN });
}
