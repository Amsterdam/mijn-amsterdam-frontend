import axios from 'axios';
import memoizee from 'memoizee';
import { generatePath } from 'react-router-dom';
import slug from 'slugme';

import {
  NotificationLabels,
  notificationContent,
} from './vergunningen-content';
import { AppRoutes } from '../../../universal/config/routes';
import { Themas } from '../../../universal/config/thema';
import {
  ApiResponse_DEPRECATED,
  apiDependencyError,
  apiSuccessResult,
} from '../../../universal/helpers/api';
import { defaultDateFormat } from '../../../universal/helpers/date';
import {
  hash,
  isRecentNotification,
  sortAlpha,
} from '../../../universal/helpers/utils';
import {
  hasOtherActualVergunningOfSameType,
  hasWorkflow,
  isExpired,
  isNearEndDate,
} from '../../../universal/helpers/vergunningen';
import {
  GenericDocument,
  LinkProps,
  MyNotification,
} from '../../../universal/types/App.types';
import { CaseType } from '../../../universal/types/vergunningen';
import { AuthProfileAndToken } from '../../auth/auth-types';
import { DEFAULT_API_CACHE_TTL_MS } from '../../config/source-api';
import { getApiConfig } from '../../helpers/source-api-helpers';
import { requestData } from '../../helpers/source-api-request';
import { BffEndpoints } from '../../routing/bff-routes';
import { generateFullApiUrlBFF } from '../../routing/route-helpers';

export const toeristischeVerhuurVergunningTypes: Array<
  VergunningBase['caseType']
> = [CaseType.VakantieverhuurVergunning];

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
  dateRequestFormatted: string | null;
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

export interface VakantieverhuurVergunning extends VergunningWithLocation {
  caseType: CaseType.VakantieverhuurVergunning;
  title: 'Vergunning vakantieverhuur';
  dateStart: string | null;
  dateEnd: string | null;
  decision: 'Verleend' | 'Ingetrokken';
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
  dateWorkflowVerleend: string | null;
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
  requestTypes: requestType[];
}

type requestType =
  | 'Nieuwe aanvraag'
  | 'Autodeelbedrijf'
  | 'Kentekenwijziging'
  | 'Verhuizing'
  | 'Verlenging';

export interface EigenParkeerplaatsOpheffen
  extends Parkeerplaats,
    VergunningBase {
  caseType: CaseType.EigenParkeerplaatsOpheffen;
  licensePlates: string | null;
  isCarsharingpermit: string | null;
  location: Parkeerplaats;
  dateEnd: string | null;
}

export interface WerkzaamhedenEnVervoerOpStraat extends VergunningWithLocation {
  caseType: CaseType.WVOS;
  dateStart: string | null;
  dateEnd: string | null;
  licensePlates: string | null;
  block: boolean;
  eblock: boolean;
  bicycleRack: boolean;
  eParkingspace: boolean;
  filming: boolean;
  night: boolean;
  object: boolean;
  parkingspace: boolean;
  eRvv: boolean;
  rvv: boolean;
  vezip: boolean;
  movingLocations: boolean;
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
  | VakantieverhuurVergunning
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
  | EigenParkeerplaatsOpheffen
  | TouringcarDagontheffing
  | TouringcarJaarontheffing
  | WerkzaamhedenEnVervoerOpStraat;

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

  const vergunningen: Vergunning[] = responseData.content.map((item) => {
    const id = hash(
      `vergunning-${(item.identifier || item.caseType) + item.dateRequest}`
    );
    // documentsUrl is added by Koppel Api
    const idEncrypted = item.documentsUrl?.split('/').pop();

    const vergunning: Vergunning = Object.assign({}, item, {
      id,
      dateRequestFormatted: defaultDateFormat(item.dateRequest),
      documentsUrl: idEncrypted
        ? generateFullApiUrlBFF(BffEndpoints.VERGUNNINGEN_LIST_DOCUMENTS, {
            id: idEncrypted,
          })
        : (item.documentsUrl ?? null),
    });
    return vergunning;
  });

  return vergunningen.sort(sortAlpha('identifier', 'desc'));
}

export function fetchAllVergunningen(
  requestID: RequestID,
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
  ): vergunning is VakantieverhuurVergunning | HorecaVergunningen =>
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
          caseType: slug(vergunning.caseType, {
            lower: true,
          }),
          id: vergunning.id,
        }),
        title: `Bekijk hoe het met uw aanvraag staat`,
      },
    };
  });
}

async function fetchVergunningen_(
  requestID: RequestID,
  authProfileAndToken: AuthProfileAndToken,
  options: VergunningOptions = vergunningOptionsDefault
) {
  const response = await fetchAllVergunningen(requestID, authProfileAndToken);

  if (response.status === 'OK') {
    let { content: vergunningen } = response;

    if (options?.filter) {
      vergunningen = vergunningen.filter(options.filter);
    }

    vergunningen = addLinks(vergunningen, options.appRoute);

    return apiSuccessResult(vergunningen);
  }

  return response;
}

export const fetchVergunningen = memoizee(fetchVergunningen_, {
  maxAge: DEFAULT_API_CACHE_TTL_MS,
  length: 3,
});

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
    case item.caseType === CaseType.GPK && item.decision === 'Verleend' && isNearEndDate(item.dateEnd, compareToDate) && !hasOtherActualVergunningOfSameType(allItemsOfSameType, item):
      return notificationContent[item.caseType]?.almostExpired;

    // prettier-ignore
    case item.caseType === CaseType.GPK && item.decision === 'Verleend' && isExpired(item, compareToDate) && !hasOtherActualVergunningOfSameType(allItemsOfSameType, item):
      return notificationContent[item.caseType]?.isExpired;

    // NOTE: For permits you can have more than one of.
    // prettier-ignore
    case [CaseType.BZB, CaseType.BZP].includes(item.caseType) && item.decision === 'Verleend' && isExpired(item, compareToDate):
      return notificationContent[item.caseType]?.isExpired;

    case (CaseType.BZB === item.caseType || CaseType.BZP === item.caseType) &&
      item.decision === 'Verleend' &&
      isNearEndDate(item.dateEnd, compareToDate):
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
    thema: Themas.VERGUNNINGEN,
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

function getVergunningNotifications_(
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
          isRecentNotification(notification.datePublished, compareDate));

      return isActual;
    })
    .map(([notification]) => notification);
}

export const getVergunningNotifications = memoizee(
  getVergunningNotifications_,
  {
    maxAge: DEFAULT_API_CACHE_TTL_MS,
  }
);

export async function fetchVergunningenNotifications(
  requestID: RequestID,
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

export async function fetchVergunningenDocument(
  requestID: RequestID,
  authProfileAndToken: AuthProfileAndToken,
  documentIdEncrypted: string
) {
  const url = `${process.env.BFF_VERGUNNINGEN_API_BASE_URL}/decosjoin/document/${documentIdEncrypted}`;

  return axios({
    url,
    headers: {
      Authorization: `Bearer ${authProfileAndToken.token}`,
    },
    responseType: 'stream',
  });
}

export async function fetchVergunningenDocumentsList(
  requestID: RequestID,
  authProfileAndToken: AuthProfileAndToken,
  documentIdEncrypted: string
) {
  const url = `${process.env.BFF_VERGUNNINGEN_API_BASE_URL}/decosjoin/listdocuments/${documentIdEncrypted}`;

  return requestData(
    {
      url,
      passthroughOIDCToken: true,
      transformResponse: (
        responseData: ApiResponse_DEPRECATED<GenericDocument[]>
      ) => {
        if (responseData.status === 'OK') {
          const documents: GenericDocument[] = responseData.content.map(
            (document) => {
              const id = document.url.split('/').pop();
              const doc = Object.assign({}, document, {
                id,
                url: generateFullApiUrlBFF(
                  BffEndpoints.VERGUNNINGEN_DOCUMENT_DOWNLOAD,
                  {
                    id: id ?? '',
                  }
                ),
              });
              return doc;
            }
          );
          return documents;
        }
        return responseData.content;
      },
    },
    requestID,
    authProfileAndToken
  );
}
