import { generatePath } from 'react-router-dom';
import slug from 'slugme';
import { Chapters } from '../../../universal/config/index';
import { AppRoutes } from '../../../universal/config/routes';
import { apiDependencyError } from '../../../universal/helpers';
import { apiSuccessResult } from '../../../universal/helpers/api';
import { dateSort } from '../../../universal/helpers/date';
import { hash, sortAlpha } from '../../../universal/helpers/utils';
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
  NotificationLabels,
  notificationContent,
} from './vergunningen-content';

export const toeristischeVerhuurVergunningTypes: Array<
  VergunningBase['caseType']
> = [CaseType.VakantieverhuurVergunningaanvraag, CaseType.BBVergunning];

export const horecaVergunningTypes: Array<VergunningBase['caseType']> = [
  CaseType.ExploitatieHorecabedrijf,
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
  documentsUrl: string | null;
  id: string;
  link: LinkProps;
  processed: boolean;
}

export interface VergunningWithLocation extends VergunningBase {
  location: string | null;
}

export interface TVMRVVObject extends VergunningWithLocation {
  caseType: CaseType.TVMRVVObject;
  dateStart: string | null;
  dateEnd: string | null;
  timeStart: string | null;
  timeEnd: string | null;
  kenteken: string | null;
}

export interface GPK extends VergunningWithLocation {
  caseType: CaseType.GPK;
  cardtype: 'driver' | 'passenger';
  cardNumber: number | null;
  dateEnd: string | null;
  requestReason: string | null;
}

export interface GPP extends VergunningWithLocation {
  caseType: CaseType.GPP;
  kenteken: string | null;
}

export interface EvenementMelding extends VergunningWithLocation {
  caseType: CaseType.EvenementMelding;
  timeStart: string | null;
  timeEnd: string | null;
  dateStart: string | null;
  dateEnd: string | null;
}

export interface EvenementVergunning extends VergunningWithLocation {
  caseType: CaseType.EvenementVergunning;
  timeStart: string | null;
  timeEnd: string | null;
  dateStart: string | null;
  dateEnd: string | null;
}

export interface Omzettingsvergunning extends VergunningWithLocation {
  caseType: CaseType.Omzettingsvergunning;
  dateWorkflowActive: string | null;
}

export interface ERVV extends VergunningWithLocation {
  caseType: CaseType.ERVV;
  dateStart: string | null;
  dateEnd: string | null;
  timeStart: string | null;
  timeEnd: string | null;
}

export interface VakantieverhuurVergunningaanvraag
  extends VergunningWithLocation {
  caseType: CaseType.VakantieverhuurVergunningaanvraag;
  title: 'Vergunning vakantieverhuur';
  dateStart: string | null;
  dateEnd: string | null;
  decision: 'Verleend' | 'Ingetrokken';
}

export interface BBVergunning extends VergunningWithLocation {
  caseType: CaseType.BBVergunning;
  title: 'Vergunning bed & breakfast';
  decision: 'Verleend' | 'Geweigerd' | 'Ingetrokken';
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
  numberOfPermits: string | null;
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

export interface Flyeren extends VergunningWithLocation {
  caseType: CaseType.Flyeren;
  decision: 'Verleend' | 'Niet verleend' | 'Ingetrokken';
  dateStart: string | null;
  dateEnd: string | null;
  timeStart: string | null;
  timeEnd: string | null;
}

export interface AanbiedenDiensten extends VergunningWithLocation {
  caseType: CaseType.AanbiedenDiensten;
  dateStart: string | null;
  dateEnd: string | null;
}

export interface Nachtwerkontheffing extends VergunningWithLocation {
  caseType: CaseType.NachtwerkOntheffing;
  dateStart: string | null;
  dateEnd: string | null;
  timeStart: string | null;
  timeEnd: string | null;
}

export interface ZwaarVerkeer extends VergunningBase {
  caseType: CaseType.ZwaarVerkeer;
  exemptionKind: string | null;
  licensePlates: string | null;
  dateStart: string | null;
  dateEnd: string | null;
}

export interface RVVHeleStad extends VergunningBase {
  caseType: CaseType.RVVHeleStad;
  licensePlates: string | null;
  dateStart: string | null;
  dateEnd: string | null;
}

export interface RVVSloterweg extends VergunningBase {
  caseType: CaseType.RVVSloterweg;
  licensePlates: string | null;
  previousLicensePlates: string | null;
  dateWorkflowVerleend: string | null; // TODO: Mogelijk wordt een zaak niet afgesloten en hebben we deze datum nodig voor de status Afgehandeld/Verleend
  dateStart: string | null;
  dateEnd: string | null;
  requestType: 'Nieuw' | 'Wijziging';
  area: 'Sloterweg-West' | 'Laan van Vlaanderen' | 'Sloterweg-Oost';
  decision: 'Verlopen' | 'Ingetrokken' | 'Vervallen';
  status: 'Afgehandeld' | 'Actief' | 'Ontvangen';
}

export interface TouringcarDagontheffing extends VergunningBase {
  caseType: CaseType.TouringcarDagontheffing;
  dateStart: string | null;
  timeStart: string | null;
  dateEnd: string | null;
  timeEnd: string | null;
  licensePlate: string | null;
  destination: string | null;
}

export interface TouringcarJaarontheffing extends VergunningBase {
  caseType: CaseType.TouringcarJaarontheffing;
  dateStart: string | null;
  dateEnd: string | null;
  licensePlates: string | null;
  destination: string | null;
  routetest: boolean;
}

export interface Samenvoegingsvergunning extends VergunningWithLocation {
  caseType: CaseType.Samenvoegingsvergunning;
}

export interface Onttrekkingsvergunning extends VergunningWithLocation {
  caseType: CaseType.Onttrekkingsvergunning;
}

export interface OnttrekkingsvergunningSloop extends VergunningWithLocation {
  caseType: CaseType.OnttrekkingsvergunningSloop;
}

export interface VormenVanWoonruimte extends VergunningWithLocation {
  caseType: CaseType.VormenVanWoonruimte;
}

export interface Splitsingsvergunning extends VergunningWithLocation {
  caseType: CaseType.Splitsingsvergunning;
}

export interface ExploitatieHorecabedrijf extends VergunningWithLocation {
  caseType: CaseType.ExploitatieHorecabedrijf;
  dateStart: string | null;
  dateEnd: string | null;
  dateStartPermit: string | null;
  numberOfPermits: string | null;
}

export interface Ligplaatsvergunning extends VergunningWithLocation {
  caseType: CaseType.VOB;
  requestKind: string | null;
  reason: string | null;
  vesselKind: string | null;
  vesselName: string | null;
}

interface Parkeerplaats {
  fiscalNumber: string;
  houseNumber: number;
  street: string;
  type: string;
  url: string;
}

export interface EigenParkeerplaats extends VergunningBase {
  caseType: CaseType.EigenParkeerplaats;
  licensePlates: string | null;
  previousLicensePlates: string | null;
  dateStart: string | null;
  dateEnd: string | null;
  locations: Parkeerplaats[] | null;
  requestType:
    | 'Nieuwe aanvraag'
    | 'Autodeelbedrijf'
    | 'Kentekenwijziging'
    | 'Verhuizing'
    | 'Verlenging';
}

export interface EigenParkeerplaatsOpheffen
  extends Parkeerplaats,
    VergunningBase {
  caseType: CaseType.EigenParkeerplaatsOpheffen;
  isCarsharingpermit: string | null;
  location: Parkeerplaats;
  dateEnd: string | null;
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
  | BBVergunning
  | VakantieverhuurVergunningaanvraag
  | Flyeren
  | AanbiedenDiensten
  | Nachtwerkontheffing
  | ZwaarVerkeer
  | Samenvoegingsvergunning
  | Onttrekkingsvergunning
  | OnttrekkingsvergunningSloop
  | VormenVanWoonruimte
  | Splitsingsvergunning
  | Ligplaatsvergunning
  | ExploitatieHorecabedrijf
  | RVVHeleStad
  | RVVSloterweg
  | EigenParkeerplaats
  | EigenParkeerplaatsOpheffen;

export type HorecaVergunningen = ExploitatieHorecabedrijf;

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

  let vergunningen: Vergunning[] = responseData.content.map((item) => {
    const id = hash(
      `vergunning-${(item.identifier || item.caseType) + item.dateRequest}`
    );
    const vergunning = Object.assign({}, item, {
      id,
    });
    return vergunning;
  });

  return vergunningen.sort(sortAlpha('identifier', 'desc'));
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
  filter: (
    vergunning: Vergunning
  ): vergunning is VakantieverhuurVergunningaanvraag | HorecaVergunningen =>
    ![...toeristischeVerhuurVergunningTypes, ...horecaVergunningTypes].includes(
      vergunning.caseType
    ),
};

export function addLinks(
  vergunningen: VergunningenData,
  appRoute: VergunningOptions['appRoute']
) {
  return vergunningen.map((vergunning) => {
    const route =
      typeof appRoute === 'function' ? appRoute(vergunning) : appRoute;
    return {
      ...vergunning,
      link: {
        to: generatePath(route, {
          title: slug(vergunning.caseType, {
            lower: true,
          }),
          id: vergunning.id,
        }),
        title: `Bekijk hoe het met uw aanvraag staat`,
      },
    };
  });
}

export async function fetchVergunningen(
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken,
  options: VergunningOptions = vergunningOptionsDefault
) {
  const response = await fetchAllVergunningen(requestID, authProfileAndToken);

  if (response.status === 'OK') {
    let { content: vergunningen } = response;
    vergunningen = addLinks(vergunningen, options.appRoute);

    if (options?.filter) {
      vergunningen = vergunningen.filter(options.filter);
    }

    return apiSuccessResult(vergunningen);
  }

  return response;
}

export function getNotificationLabels(
  item: Vergunning,
  items: Vergunning[],
  compareToDate: Date = new Date()
) {
  const allItemsOfSameType = items.filter(
    (caseItem: Vergunning) => caseItem.caseType === item.caseType
  );

  // Ignore formatting of the switch case statements for readability
  switch (true) {
    // NOTE: For permits you can only have one of.
    // prettier-ignore
    case item.caseType === CaseType.GPK && item.decision === 'Verleend' && isNearEndDate(item, compareToDate) && !hasOtherActualVergunningOfSameType(allItemsOfSameType, item):
      return notificationContent[item.caseType]?.almostExpired;

    // prettier-ignore
    case item.caseType === CaseType.GPK && item.decision === 'Verleend' && isExpired(item, compareToDate) && !hasOtherActualVergunningOfSameType(allItemsOfSameType, item):
      return notificationContent[item.caseType]?.isExpired;

    // NOTE: For permits you can have more than one of.
    // prettier-ignore
    case [CaseType.BZB, CaseType.BZP].includes(item.caseType) && item.decision === 'Verleend' && isExpired(item, compareToDate):
      return notificationContent[item.caseType]?.isExpired;

    case [CaseType.BZB, CaseType.BZP].includes(item.caseType) &&
      item.decision === 'Verleend' &&
      isNearEndDate(item, compareToDate):
      return notificationContent[item.caseType]?.almostExpired;

    case item.caseType === CaseType.RVVSloterweg &&
      item.decision === 'Ingetrokken':
      return notificationContent[item.caseType]?.revoked;

    // prettier-ignore
    case !item.processed && hasWorkflow(item.caseType) && !item.dateWorkflowActive:
      return notificationContent[item.caseType]?.requested;

    case !item.processed:
      return notificationContent[item.caseType]?.inProgress;

    case item.processed:
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
      notification[key as Key] = getValue(
        vergunning,
        vergunning.title.toLocaleLowerCase()
      );
    }
  }
}

export function createVergunningNotification(
  item: Vergunning,
  items: Vergunning[],
  dateNow?: Date
): MyNotification | null {
  const notification: MyNotification = {
    chapter: Chapters.VERGUNNINGEN,
    id: `vergunning-${item.id}-notification`,
    title: 'Vergunningsaanvraag',
    description: 'Er is een update in uw vergunningsaanvraag.',
    datePublished: item.dateRequest,
    subject: item.id,
    link: {
      to: item.link.to,
      title: 'Bekijk details',
    },
  };

  const labels = getNotificationLabels(item, items, dateNow);

  if (labels) {
    assignNotificationProperties(notification, labels, item);

    return notification;
  }

  return null;
}

export function getVergunningNotifications(
  vergunningen: Vergunning[],
  compareDate: Date = new Date()
) {
  return vergunningen
    .map(
      (vergunning, index, allVergunningen) =>
        [
          createVergunningNotification(
            vergunning,
            allVergunningen,
            compareDate
          ),
          vergunning,
        ] as const
    )
    .filter(([notification, vergunning]) => {
      // NOTE: See MIJN-7048
      if (notification === null) {
        return false;
      }

      const isActual =
        !vergunning.processed ||
        (!!notification &&
          isActualNotification(notification.datePublished, compareDate));

      return isActual;
    })
    .map(([notification]) => notification);
}

export async function fetchVergunningenNotifications(
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken,
  compareDate?: Date
) {
  const VERGUNNINGEN = await fetchVergunningen(requestID, authProfileAndToken);

  if (VERGUNNINGEN.status === 'OK') {
    const notifications = getVergunningNotifications(
      VERGUNNINGEN.content ?? [],
      compareDate
    );

    return apiSuccessResult({
      notifications,
    });
  }

  return apiDependencyError({ VERGUNNINGEN });
}
