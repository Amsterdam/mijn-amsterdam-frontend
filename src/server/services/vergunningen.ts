import { generatePath } from 'react-router-dom';
import { AppRoutes } from '../../universal/config/routes';
import {
  LinkProps,
  MyCase,
  MyNotification,
} from '../../universal/types/App.types';
import { getApiConfig } from '../config';
import { requestData } from '../helpers';
import { hash, isRecentCase } from '../../universal/helpers/utils';
import { dateSort } from '../../universal/helpers/date';
import { Chapters } from '../../universal/config/index';
import { apiDependencyError } from '../../universal/helpers';
import { apiSuccesResult } from '../../universal/helpers/api';
import { GenericDocument } from '../../universal/types/App.types';
import { differenceInMonths } from 'date-fns';

const MONTHS_TO_KEEP_NOTIFICATIONS = 3;

export const toeristischeVerhuurVergunningTypes: Array<
  VergunningBase['caseType']
> = [
  'Vakantieverhuur',
  'Vakantieverhuur afmelding',
  'Vakantieverhuur vergunningsaanvraag',
  'B&B - vergunning',
];

export interface VergunningBase {
  caseType: string;
  status: 'Toewijzen' | 'Afgehandeld' | 'Ontvangen' | string;
  title: string;
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
  driverPassenger: 'driver' | 'passenger';
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
  caseType: 'E-RVV';
  dateStart: string | null;
  dateEnd: string | null;
  location: string | null;
}

export interface Vakantieverhuur extends VergunningBase {
  caseType: 'Vakantieverhuur';
  dateStart: string | null;
  dateEnd: string | null;
  location: string | null;
}

export interface VakantieverhuurAfmelding extends VergunningBase {
  caseType: 'Vakantieverhuur afmelding';
  dateStart: string | null;
  dateEnd: string | null;
  location: string | null;
}

export interface VakantieverhuurVergunningaanvraag extends VergunningBase {
  caseType: 'Vakantieverhuur vergunningsaanvraag';
  dateStart: string | null;
  dateEnd: string | null;
  location: string | null;
}

export interface BBVergunning extends VergunningBase {
  caseType: 'B&B - vergunning';
  location: string | null;
  dateStart: string | null;
  dateEnd: string | null;
  requester: string | null;
  owner: string | null;
}

export type Vergunning =
  | TVMRVVObject
  | GPK
  | GPP
  | EvenementMelding
  | Omzettingsvergunning
  | ERVV
  | Vakantieverhuur
  | VakantieverhuurAfmelding
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
  appRoute?: string;
}

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
      return {
        ...vergunning,
        link: {
          to: options?.appRoute
            ? generatePath(options.appRoute, {
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

export function createVergunningRecentCase(item: Vergunning): MyCase {
  return {
    id: `vergunning-${item.id}-case`,
    title: `Vergunningsaanvraag ${item.identifier}`,
    link: item.link,
    chapter: Chapters.VERGUNNINGEN,
    datePublished: item.dateRequest,
  };
}

export function createVergunningNotification(item: Vergunning): MyNotification {
  let title = 'Vergunningsaanvraag';
  let description = 'Er is een update in uw vergunningsaanvraag.';
  let datePublished = item.dateRequest;

  // let dateEnd = item.dateEnd ? new Date(item.dateEnd) : new Date();

  // switch (item.caseType) {
  //   case 'EvenementenMelding':
  //   case 'TVM - RVV - Object':
  //     dateEnd = new Date(
  //       `${item.dateEnd}${item.timeEnd ? `T${item.timeEnd}` : ''}`
  //     );
  // }

  switch (true) {
    case item.status === 'Afgehandeld' && item.decision === 'Niet verleend':
      description = `Uw vergunningsaanvraag ${item.caseType} is niet verleend`;
      datePublished = item.dateDecision || item.dateRequest;
      break;
    case item.status === 'Afgehandeld' && item.decision === 'Ingetrokken':
      description = `Uw vergunningsaanvraag ${item.caseType} is ingetrokken`;
      datePublished = item.dateDecision || item.dateRequest;
      break;
    case item.status === 'Afgehandeld' && item.decision === 'Verleend':
      description = `Uw vergunningsaanvraag ${item.caseType} is verleend`;
      datePublished = item.dateDecision || item.dateRequest;
      break;
    case item.status !== 'Afgehandeld':
      description = `Uw vergunningsaanvraag ${item.caseType} is geregistreerd`;
      break;
    case item.status === 'Afgehandeld':
      description = `Uw vergunningsaanvraag ${item.caseType} is afgehandeld`;
      break;
    // case new Date() >= dateEnd:
    //   title = 'Uw vergunning is verlopen';
    //   description = `Uw vergunningsaanvraag ${item.caseType} is afgehandeld`;
    //   break;
  }

  return {
    id: `vergunning-${item.id}-notification`,
    datePublished,
    chapter: Chapters.VERGUNNINGEN,
    title,
    description,
    link: {
      to: item.link.to,
      title: 'Bekijk details',
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
          .map(createVergunningNotification)
      : [];

    return apiSuccesResult({
      cases,
      notifications,
    });
  }

  return apiDependencyError({ VERGUNNINGEN });
}
