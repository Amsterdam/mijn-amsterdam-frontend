import { generatePath } from 'react-router-dom';
import slug from 'slugme';
import { Chapters } from '../../../universal/config/index';
import { AppRoutes } from '../../../universal/config/routes';
import { apiDependencyError } from '../../../universal/helpers';
import { apiSuccessResult } from '../../../universal/helpers/api';
import { dateSort } from '../../../universal/helpers/date';
import { hash } from '../../../universal/helpers/utils';
import {
  hasOtherActualVergunningOfSameType,
  hasWorkflow,
  isActualNotification,
  isExpired,
  isNearEndDate,
} from '../../../universal/helpers/vergunningen';
import {
  GenericDocument,
  LinkProps,
  MyNotification,
} from '../../../universal/types/App.types';
import { CaseType } from '../../../universal/types/vergunningen';
import { getApiConfig } from '../../config';
import { requestData } from '../../helpers';
import { AuthProfileAndToken } from '../../helpers/app';
import {
  notificationContent,
  NotificationLabels,
} from './vergunningen-content';

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

export interface Flyeren extends VergunningBase {
  caseType: CaseType.Flyeren;
  decision: 'Verleend' | 'Niet verleend' | 'Ingetrokken';
  location: string | null;
  dateStart: string | null;
  dateEnd: string | null;
  timeStart: string | null;
  timeEnd: string | null;
}

export interface AanbiedenDiensten extends VergunningBase {
  caseType: CaseType.AanbiedenDiensten;
  location: string | null;
  dateStart: string | null;
  dateEnd: string | null;
}

export interface Nachtwerkontheffing extends VergunningBase {
  caseType: CaseType.NachtwerkOntheffing;
  location: string | null;
  dateStart: string | null;
  dateEnd: string | null;
  timeStart: string | null;
  timeEnd: string | null;
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
  | VakantieverhuurVergunningaanvraag
  | Flyeren
  | AanbiedenDiensten
  | Nachtwerkontheffing;

export type VergunningenSourceData = {
  content?: Vergunning[];
  status: 'OK' | 'ERROR';
};

export type VergunningExpirable = Vergunning & { dateEnd?: string | null };

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
      `vergunning-${(item.identifier || item.caseType) + item.dateRequest}`
    );
    const vergunning = Object.assign({}, item, {
      id,
    });
    return vergunning;
  });

  return vergunningen.sort(dateSort('dateRequest', 'desc'));
}

export function fetchAllVergunningen(
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken
) {
  return requestData<VergunningenData>(
    getApiConfig('VERGUNNINGEN', {
      transformResponse: transformVergunningenData,
    }),
    requestID,
    authProfileAndToken
  );
}

const vergunningOptionsDefault: VergunningOptions = {
  appRoute: AppRoutes['VERGUNNINGEN/DETAIL'],
  filter: (vergunning) =>
    !toeristischeVerhuurVergunningTypes.includes(vergunning.caseType),
};

export async function fetchVergunningen(
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken,
  options: VergunningOptions = vergunningOptionsDefault
) {
  const response = await fetchAllVergunningen(requestID, authProfileAndToken);

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
                title: slug(vergunning.caseType, {
                  lower: true,
                }),
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

    return apiSuccessResult(vergunningen);
  }

  return response;
}

function getNotificationLabels(item: Vergunning, items: Vergunning[]) {
  const allItems = items.filter(
    (caseItem: Vergunning) => caseItem.caseType === item.caseType
  );
  // Ignore formatting of the switch case statements for readability
  switch (true) {
    // NOTE: For permits you can only have one of.
    // prettier-ignore
    case item.caseType === CaseType.GPK && item.decision === 'Verleend' && isNearEndDate(item) && !hasOtherActualVergunningOfSameType(allItems, item):
      return notificationContent[item.caseType]?.almostExpired;

    // prettier-ignore
    case item.caseType === CaseType.GPK && item.decision === 'Verleend' && isExpired(item) && !hasOtherActualVergunningOfSameType(allItems, item):
      return notificationContent[item.caseType]?.isExpired;

    // NOTE: For permits you can have multiple of.
    // prettier-ignore
    case [CaseType.BZB, CaseType.BZP].includes(item.caseType) && item.decision === 'Verleend' && isExpired(item):
      return notificationContent[item.caseType]?.isExpired;

    case [CaseType.BZB, CaseType.BZP].includes(item.caseType) &&
      item.decision === 'Verleend' &&
      isNearEndDate(item):
      return notificationContent[item.caseType]?.isExpired;

    // prettier-ignore
    case item.status !== 'Afgehandeld' && hasWorkflow(item.caseType) && !item.dateWorkflowActive:
      return notificationContent[item.caseType]?.requested;

    case item.status !== 'Afgehandeld':
      return notificationContent[item.caseType]?.inProgress;

    case item.status === 'Afgehandeld':
      return notificationContent[item.caseType]?.done;
  }
}

function assignNotificationProperties(
  notification: MyNotification,
  content: NotificationLabels,
  vergunning: Vergunning
) {
  if (content) {
    type Key = keyof NotificationLabels;
    for (const [key, getValue] of Object.entries(content)) {
      notification[key as Key] = getValue(vergunning);
    }
  }
}

export function createVergunningNotification(
  item: Vergunning,
  items: Vergunning[]
): MyNotification {
  const notification: MyNotification = {
    chapter: Chapters.VERGUNNINGEN,
    id: `vergunning-${item.id}-notification`,
    title: 'Vergunningsaanvraag',
    description: 'Er is een update in uw vergunningsaanvraag.',
    datePublished: item.dateRequest,
    link: {
      to: item.link.to,
      title: 'Bekijk details',
    },
  };

  const labels = getNotificationLabels(item, items);

  if (labels) {
    assignNotificationProperties(notification, labels, item);
  }

  return notification;
}

export async function fetchVergunningenNotifications(
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken,
  compareDate?: Date
) {
  const VERGUNNINGEN = await fetchVergunningen(requestID, authProfileAndToken);

  if (VERGUNNINGEN.status === 'OK') {
    const compareToDate = compareDate || new Date();

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

    return apiSuccessResult({
      notifications,
    });
  }

  return apiDependencyError({ VERGUNNINGEN });
}
