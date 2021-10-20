import { generatePath } from 'react-router-dom';

import { Chapters } from '../../../universal/config/index';
import { AppRoutes } from '../../../universal/config/routes';
import { apiDependencyError } from '../../../universal/helpers';
import { apiSuccesResult } from '../../../universal/helpers/api';
import { dateSort } from '../../../universal/helpers/date';
import { hash, isRecentCase } from '../../../universal/helpers/utils';
import {
  hasOtherValidVergunningOfSameType,
  isActualNotification,
  isExpireable,
  isExpired,
  isNearEndDate,
  isWorkflowItem,
} from '../../../universal/helpers/vergunningen';
import {
  GenericDocument,
  LinkProps,
  MyCase,
  MyNotification,
} from '../../../universal/types/App.types';
import { CaseType } from '../../../universal/types/vergunningen';
import { getApiConfig } from '../../config';
import { requestData } from '../../helpers';
import { ToeristischeVerhuurVergunning } from '../toeristische-verhuur';
import { notificationContent } from './vergunningen-content';

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
  dateWorkflowActive: string | null;
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
  cardNumber: number | null;
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
  timeStart: string | null;
  timeEnd: string | null;
  dateStart: string | null;
  dateEnd: string | null;
}

export interface EvenementVergunning extends VergunningBase {
  caseType: CaseType.EvenementVergunning;
  location: string | null;
  timeStart: string | null;
  timeEnd: string | null;
  dateStart: string | null;
  dateEnd: string | null;
}

export interface Omzettingsvergunning extends VergunningBase {
  caseType: CaseType.Omzettingsvergunning;
  location: string | null;
  dateWorkflowActive: string | null;
}

export interface ERVV extends VergunningBase {
  caseType: CaseType.ERVV;
  dateStart: string | null;
  dateEnd: string | null;
  location: string | null;
  timeStart: string | null;
  timeEnd: string | null;
}

export interface Vakantieverhuur extends VergunningBase {
  caseType: CaseType.VakantieVerhuur;
  title: 'Geplande verhuur' | 'Geannuleerde verhuur' | 'Afgelopen verhuur';
  decision: 'Verleend';
  dateStart: string | null;
  dateEnd: string | null;
  location: string | null;
}

export interface VakantieverhuurVergunningaanvraag extends VergunningBase {
  caseType: CaseType.VakantieverhuurVergunningaanvraag;
  title: 'Vergunning vakantieverhuur';
  dateStart: string | null;
  dateEnd: string | null;
  decision: 'Verleend' | 'Ingetrokken';
  location: string | null;
}

export interface BBVergunning extends VergunningBase {
  caseType: CaseType.BBVergunning;
  title: 'Vergunning bed & breakfast';
  decision: 'Verleend' | 'Geweigerd' | 'Ingetrokken';
  location: string | null;
  dateStart: string | null;
  dateEnd: string | null;
  requester: string | null;
  owner: string | null;
  hasTransitionAgreement: boolean;
  dateWorkflowActive: string | null;
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
  | EvenementVergunning
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

export type VergunningExpirable =
  | GPK
  | ToeristischeVerhuurVergunning
  | BZP
  | BZB;

export interface VergunningDocument extends GenericDocument {
  sequence: number;
}

export type VergunningenData = Vergunning[];

export interface VergunningOptions {
  filter?: (vergunning: Vergunning) => boolean;
  appRoute: string | ((vergunning: Vergunning) => string);
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
          title: `Bekijk hoe het met uw aanvraag staat`,
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
    title: `Vergunningsaanvraag ${item.caseType} ${item.identifier}`,
    link: item.link,
    chapter: Chapters.VERGUNNINGEN,
    datePublished: item.dateRequest,
  };
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
  const allItems = items.filter(
    (caseItem: Vergunning): caseItem is VergunningExpirable =>
      caseItem.caseType === item.caseType
  );

  switch (true) {
    case isExpireable(item.caseType) &&
      item.decision === 'Verleend' &&
      isNearEndDate(item as VergunningExpirable) &&
      !hasOtherValidVergunningOfSameType(allItems, item as VergunningExpirable):
      title =
        notificationContent[item.caseType]?.almostExpired?.title(
          item as VergunningExpirable
        ) || title;
      description =
        notificationContent[item.caseType]?.almostExpired?.description(
          item as VergunningExpirable
        ) || description;
      cta = notificationContent[item.caseType]?.almostExpired?.cta || cta;
      linkTo =
        notificationContent[item.caseType]?.almostExpired?.linkTo(
          item as VergunningExpirable
        ) || linkTo;
      datePublished =
        notificationContent[item.caseType]?.almostExpired?.datePublished(
          item as VergunningExpirable
        ) || datePublished;

      break;
    case isExpireable(item.caseType) &&
      item.decision === 'Verleend' &&
      isExpired(item as VergunningExpirable) &&
      !hasOtherValidVergunningOfSameType(allItems, item as VergunningExpirable):
      title =
        notificationContent[item.caseType]?.isExpired?.title(
          item as VergunningExpirable
        ) || title;
      description =
        notificationContent[item.caseType]?.isExpired?.description(
          item as VergunningExpirable
        ) || description;
      cta = notificationContent[item.caseType]?.isExpired?.cta || cta;
      linkTo =
        notificationContent[item.caseType]?.isExpired?.linkTo(
          item as VergunningExpirable
        ) || linkTo;
      datePublished =
        notificationContent[item.caseType]?.isExpired?.datePublished(
          item as VergunningExpirable
        ) || datePublished;
      break;
    case item.status !== 'Afgehandeld' &&
      isWorkflowItem(item.caseType) &&
      !item.dateWorkflowActive:
      title =
        notificationContent[item.caseType]?.requested?.title(item) || title;
      description =
        notificationContent[item.caseType]?.requested?.description(item) ||
        description;
      cta = notificationContent[item.caseType]?.requested?.cta || cta;
      linkTo =
        notificationContent[item.caseType]?.requested?.linkTo(item) || linkTo;
      datePublished =
        notificationContent[item.caseType]?.requested?.datePublished(item) ||
        datePublished;
      break;
    case item.status !== 'Afgehandeld':
      title =
        notificationContent[item.caseType]?.inProgress?.title(item) || title;
      description =
        notificationContent[item.caseType]?.inProgress?.description(item) ||
        description;
      cta = notificationContent[item.caseType]?.inProgress?.cta || cta;
      linkTo =
        notificationContent[item.caseType]?.inProgress?.linkTo(item) || linkTo;
      datePublished =
        notificationContent[item.caseType]?.inProgress?.datePublished(item) ||
        datePublished;
      break;
    case item.status === 'Afgehandeld':
      title = notificationContent[item.caseType]?.done?.title(item) || title;
      description =
        notificationContent[item.caseType]?.done?.description(item) ||
        description;
      cta = notificationContent[item.caseType]?.done?.cta || cta;
      linkTo = notificationContent[item.caseType]?.done?.linkTo(item) || linkTo;
      datePublished =
        notificationContent[item.caseType]?.done?.datePublished(item) ||
        datePublished;
      break;
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
