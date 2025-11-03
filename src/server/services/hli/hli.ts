import { isAfter, parseISO } from 'date-fns';
import { generatePath } from 'react-router';
import slug from 'slugme';

import {
  HLIRegelingFrontend,
  HLIresponseData,
  ZorgnedHLIRegeling,
  HLIRegelingSpecificatieFrontend,
} from './hli-regelingen-types';
import { hliStatusLineItemsConfig } from './hli-status-line-items';
import { fetchZorgnedAanvragenHLI } from './hli-zorgned-service';
import { transformRTMAanvragen, isRTMAanvraag } from './rtm/regeling-rtm';
import { fetchStadspas } from './stadspas';
import {
  featureToggle,
  routeConfig,
} from '../../../client/pages/Thema/HLI/HLI-thema-config';
import {
  ApiResponse,
  apiSuccessResult,
  getFailedDependencies,
  getSettledResult,
} from '../../../universal/helpers/api';
import { defaultDateFormat } from '../../../universal/helpers/date';
import { dedupeDocumentsInDataSets } from '../../../universal/helpers/document';
import { capitalizeFirstLetter } from '../../../universal/helpers/text';
import {
  GenericDocument,
  StatusLineItem,
} from '../../../universal/types/App.types';
import { AuthProfileAndToken } from '../../auth/auth-types';
import { encryptSessionIdWithRouteIdParam } from '../../helpers/encrypt-decrypt';
import { BffEndpoints } from '../../routing/bff-routes';
import { generateFullApiUrlBFF } from '../../routing/route-helpers';
import { getStatusLineItems } from '../zorgned/zorgned-status-line-items';
import { ZorgnedAanvraagWithRelatedPersonsTransformed } from '../zorgned/zorgned-types';
import {
  transformPCVergoedingAanvragen,
  isPcAanvraag,
  isWorkshopNietGevolgd,
} from './status-line-items/regeling-pcvergoeding';
import { sortAlpha, toDateFormatted } from '../../../universal/helpers/utils';

export const RTM_SPECIFICATIE_TITLE = 'AV-RTM Specificatie';

export type GenericDisplayStatus =
  | 'Toegewezen'
  | 'Afgewezen'
  | 'Einde recht'
  | 'Onbekend';

export type GetDisplayStatusFn<
  T extends string,
  x = T | GenericDisplayStatus,
> = (regeling: ZorgnedHLIRegeling, statusLineItems: StatusLineItem[]) => x;

export const getDisplayStatus: GetDisplayStatusFn<GenericDisplayStatus> = (
  regeling: ZorgnedHLIRegeling,
  statusLineItems: StatusLineItem[]
) => {
  const hasEindeRecht = statusLineItems.some(
    (regeling) => regeling.status === 'Einde recht'
  );
  switch (true) {
    // Special case for PC-vergoeding.
    case isWorkshopNietGevolgd(regeling):
      return 'Afgewezen';

    case (regeling.isActueel || !hasEindeRecht) &&
      regeling.resultaat === 'toegewezen':
      return 'Toegewezen';

    case !regeling.isActueel && regeling.resultaat === 'toegewezen':
      return 'Einde recht';

    case !regeling.isActueel && regeling.resultaat !== 'toegewezen':
      return 'Afgewezen';
  }

  return (
    (statusLineItems[statusLineItems.length - 1]
      ?.status as GenericDisplayStatus) ?? 'Onbekend'
  );
};

export function getDocumentsFrontend(
  sessionID: SessionID,
  documents: GenericDocument[]
): GenericDocument[] {
  return documents.map((document) => {
    const idEncrypted = encryptSessionIdWithRouteIdParam(
      sessionID,
      document.id
    );
    return {
      ...document,
      url: generateFullApiUrlBFF(BffEndpoints.HLI_DOCUMENT_DOWNLOAD, [
        {
          id: idEncrypted,
        },
      ]),
      id: idEncrypted,
    };
  });
}

function transformRegelingTitle(
  aanvraag: ZorgnedAanvraagWithRelatedPersonsTransformed
): string {
  switch (true) {
    case aanvraag.titel.toLowerCase().includes('stadspas'): {
      const startDate = aanvraag.datumIngangGeldigheid
        ? parseISO(aanvraag.datumIngangGeldigheid)
        : null;
      const fromIndication =
        startDate &&
        isAfter(startDate, new Date()) &&
        aanvraag.resultaat === 'toegewezen'
          ? ` (vanaf ${toDateFormatted(startDate)})`
          : '';
      return `Stadspas${startDate ? ` ${startDate.getFullYear()}-${startDate.getFullYear() + 1}${fromIndication}` : ''}`;
    }
    default:
      return capitalizeFirstLetter(aanvraag.titel);
  }
}

export function transformRegelingForFrontend<T extends string>(
  sessionID: SessionID,
  aanvraag: ZorgnedAanvraagWithRelatedPersonsTransformed,
  statusLineItems: StatusLineItem[],
  getDisplayStatusFn: GetDisplayStatusFn<T> = getDisplayStatus
) {
  const id = aanvraag.id;

  const route = generatePath(routeConfig.detailPage.path, {
    id,
    regeling: slug(aanvraag.titel),
  });

  const displayStatus = getDisplayStatusFn(aanvraag, statusLineItems);

  // Override isActueel for Afgewezen (UPC*) regelingen.
  let isActual = aanvraag.isActueel;

  if (displayStatus === 'Afgewezen' && aanvraag.isActueel) {
    isActual = false;
  }

  const regelingFrontend: HLIRegelingFrontend = {
    id,
    title: transformRegelingTitle(aanvraag),
    isActual,
    link: {
      title: 'Meer informatie',
      to: route,
    },
    steps: statusLineItems,
    dateDecision: aanvraag.datumBesluit,
    dateStart: aanvraag.datumIngangGeldigheid,
    dateEnd: aanvraag.datumEindeGeldigheid,
    decision: aanvraag.resultaat,
    displayStatus,
    documents: getDocumentsFrontend(sessionID, aanvraag.documenten),
    betrokkenen: aanvraag.betrokkenPersonen.length
      ? aanvraag.betrokkenPersonen.map((persoon) => persoon.name).join(', ')
      : '-',
  };

  return regelingFrontend;
}

function transformRegelingenForFrontend(
  authProfileAndToken: AuthProfileAndToken,
  aanvragen: ZorgnedAanvraagWithRelatedPersonsTransformed[],
  today: Date
): HLIRegelingFrontend[] {
  const [remainingAanvragen, RTMAanvragen] = extractAanvragen(
    aanvragen,
    isRTMAanvraag
  );
  const RTMRegelingenFrontend = transformRTMAanvragen(
    authProfileAndToken.profile.id,
    RTMAanvragen
  );
  const [remainingAanvragen_, PCVergoedingAanvragen_pre2026] = extractAanvragen(
    remainingAanvragen,
    isPcAanvraag
  );
  const PCVergoedingAanvragenCombined = filterCombineUpcPcvData_pre2026(
    PCVergoedingAanvragen_pre2026
  );

  // Transform PC and remaining aanvragen to HLIRegelingFrontend.
  const allAanvragen = [
    ...PCVergoedingAanvragenCombined,
    ...remainingAanvragen_,
  ].toSorted(sortAlpha('id', 'desc'));

  // RTM aanvragen are already completely transformed to HLIRegelingFrontend and do not need further processing.
  const regelingenFrontend = [...RTMRegelingenFrontend];

  for (const aanvraag of allAanvragen) {
    const statusLineItems = getStatusLineItems(
      'HLI',
      hliStatusLineItemsConfig,
      aanvraag,
      aanvragen,
      today
    );

    if (!Array.isArray(statusLineItems) || !statusLineItems.length) {
      continue;
    }

    const regelingForFrontend = transformRegelingForFrontend(
      authProfileAndToken.profile.sid,
      aanvraag,
      statusLineItems
    );

    regelingenFrontend.push(regelingForFrontend);
  }

  return dedupeDocumentsInDataSets(regelingenFrontend, 'documents');
}

type IsTargetAanvraagFn = (
  aanvraag: ZorgnedAanvraagWithRelatedPersonsTransformed
) => boolean;

function extractAanvragen(
  aanvragen: ZorgnedAanvraagWithRelatedPersonsTransformed[],
  isTargetAanvraag: IsTargetAanvraagFn
): [
  ZorgnedAanvraagWithRelatedPersonsTransformed[],
  ZorgnedAanvraagWithRelatedPersonsTransformed[],
] {
  const remainder = [];
  const targetAanvragen = [];

  for (const aanvraag of aanvragen) {
    if (isTargetAanvraag(aanvraag)) {
      targetAanvragen.push(aanvraag);
    } else {
      remainder.push(aanvraag);
    }
  }

  return [remainder, targetAanvragen];
}

async function fetchRegelingen(authProfileAndToken: AuthProfileAndToken) {
  if (!featureToggle.hliThemaRegelingenActive) {
    return apiSuccessResult([]);
  }

  const aanvragenResponse = await fetchZorgnedAanvragenHLI(
    authProfileAndToken.profile.id
  );

  if (aanvragenResponse.status === 'OK') {
    const regelingen = transformRegelingenForFrontend(
      authProfileAndToken,
      aanvragenResponse.content,
      new Date()
    );
    return apiSuccessResult(regelingen);
  }
  return aanvragenResponse;
}

async function fetchSpecificaties(
  authProfileAndToken: AuthProfileAndToken
): Promise<ApiResponse<HLIRegelingSpecificatieFrontend[]>> {
  const response = await fetchZorgnedAanvragenHLI(
    authProfileAndToken.profile.id
  );
  if (response.status !== 'OK') {
    return response;
  }

  const aanvragen = response.content.reduce(
    (
      filteredAanvragen: ZorgnedAanvraagWithRelatedPersonsTransformed[],
      aanvraag
    ) => {
      const documents = aanvraag.documenten.filter(
        (d) => d.title === RTM_SPECIFICATIE_TITLE
      );
      if (!documents.length) {
        return filteredAanvragen;
      }
      filteredAanvragen.push({ ...aanvraag, documenten: documents });
      return filteredAanvragen;
    },
    [] as ZorgnedAanvraagWithRelatedPersonsTransformed[]
  );

  const specificaties: HLIRegelingSpecificatieFrontend[] = aanvragen.flatMap(
    (aanvraag) => {
      const specificaties = getDocumentsFrontend(
        authProfileAndToken.profile.sid,
        aanvraag.documenten
      ).map((doc) => {
        const specificatie: HLIRegelingSpecificatieFrontend = {
          ...doc,
          category: aanvraag.titel,
          datePublishedFormatted: defaultDateFormat(doc.datePublished),
        };
        return specificatie;
      });
      return specificaties;
    }
  );

  return apiSuccessResult(specificaties);
}

export async function fetchHLI(authProfileAndToken: AuthProfileAndToken) {
  const [stadspasResult, regelingenResult, specificatieResult] =
    await Promise.allSettled([
      fetchStadspas(authProfileAndToken),
      fetchRegelingen(authProfileAndToken),
      fetchSpecificaties(authProfileAndToken),
    ]);

  const regelingenResponseData = getSettledResult(regelingenResult);
  const stadspasResponseData = getSettledResult(stadspasResult);
  const specificatieResponseData = getSettledResult(specificatieResult);

  const HLIResponseData: HLIresponseData = {
    regelingen: regelingenResponseData.content ?? [],
    stadspas: stadspasResponseData.content,
    specificaties: specificatieResponseData.content ?? [],
  };

  return apiSuccessResult(
    HLIResponseData,
    getFailedDependencies({
      regelingen: regelingenResponseData,
      stadspas: stadspasResponseData,
    })
  );
}

export const forTesting = {
  fetchRegelingen,
  fetchSpecificaties,
  getDisplayStatus,
  transformRegelingenForFrontend,
  transformRegelingTitle,
};
