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

export const toeristischeVerhuurVergunningTypes: Array<
  VergunningBase['caseType']
> = [
  'Vakantieverhuur',
  'Vakantieverhuur vergunningsaanvraag',
  'B&B - vergunning',
];

export interface VergunningBase {
  caseType: string;
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
  caseType: 'TVM - RVV - Object';
  dateStart: string | null;
  dateEnd: string | null;
  timeStart: string | null;
  timeEnd: string | null;
  location: string | null;
}

export interface GPK extends VergunningBase {
  caseType: 'GPK';
  cardtype: 'driver' | 'passenger';
  cardNumber: string | null;
  dateEnd: string | null;
  location: string | null;
  requestReason: string | null;
}

export interface GPP extends VergunningBase {
  caseType: 'GPP';
  location: string | null;
  kenteken: string | null;
}

export interface EvenementMelding extends VergunningBase {
  caseType: 'Evenement melding';
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
  caseType: 'Omzettingsvergunning';
  location: string | null;
}

export interface ERVV extends VergunningBase {
  caseType: 'E-RVV - TVM';
  dateStart: string | null;
  dateEnd: string | null;
  location: string | null;
}

export interface Vakantieverhuur extends VergunningBase {
  caseType: 'Vakantieverhuur';
  dateStart: string | null;
  dateEnd: string | null;
  location: string | null;
  cancelled?: boolean;
  dateCancelled?: string;
}

export interface VakantieverhuurVergunningaanvraag extends VergunningBase {
  caseType: 'Vakantieverhuur vergunningsaanvraag';
  dateStart: string | null;
  dateEnd: string | null;
  decision: string | null;
  location: string | null;
}

export interface BBVergunning extends VergunningBase {
  caseType: 'B&B - vergunning';
  location: string | null;
  dateStart: string | null;
  dateEnd: string | null;
  decision: string | null;
  requester: string | null;
  owner: string | null;
  hasTransitionAgreement: boolean;
}

export type Vergunning =
  | TVMRVVObject
  | GPK
  | GPP
  | EvenementMelding
  | Omzettingsvergunning
  | ERVV
  | Vakantieverhuur
  | BBVergunning
  | VakantieverhuurVergunningaanvraag;

export type VergunningenSourceData = {
  content?: Vergunning[];
  status: 'OK' | 'ERROR';
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

export function isNearEndDate(vergunning: ToeristischeVerhuurVergunning | GPK) {
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

export function isExpired(vergunning: ToeristischeVerhuurVergunning | GPK) {
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
  items: ToeristischeVerhuurVergunning[] | GPK[],
  item: ToeristischeVerhuurVergunning | GPK
): boolean {
  return items.some(
    (otherVergunning: ToeristischeVerhuurVergunning | GPK) =>
      otherVergunning.caseType === item.caseType &&
      otherVergunning.identifier !== item.identifier &&
      !isExpired(otherVergunning)
  );
}

export function createVergunningNotification(
  item: Vergunning,
  items: Vergunning[]
): MyNotification {
  let title = 'Vergunningsaanvraag';
  let description = 'Er is een update in uw vergunningsaanvraag.';
  let datePublished = item.dateRequest;
  let linkTo = item.link.to;
  let cta = 'Bekijk details';

  if (item.caseType === 'GPK') {
    const allGPKItems = items.filter(
      (item: Vergunning): item is GPK => item.caseType === 'GPK'
    );
    const GPKForm =
      'https://formulieren.amsterdam.nl/TripleForms/DirectRegelen/formulier/nl-NL/evAmsterdam/GehandicaptenParkeerKaartAanvraag.aspx/Inleiding';
    const fullName = item.title; // change this later to title property
    switch (true) {
      case item.decision === 'Verleend' &&
        isNearEndDate(item) &&
        !hasOtherValidVergunningOfSameType(allGPKItems, item):
        title = `${item.caseType} loopt af`;
        description = `Uw ${item.title} loopt binnenkort af. Vraag tijdig een nieuwe vergunning aan.`;
        cta = `Vraag op tijd een nieuwe ${item.caseType} aan`;
        linkTo = GPKForm;
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
        !hasOtherValidVergunningOfSameType(allGPKItems, item):
        title = `${item.caseType} is verlopen`;
        description = `Uw ${fullName} is verlopen.`;
        cta = `Vraag een nieuwe ${item.caseType} aan`;
        linkTo = GPKForm;
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
