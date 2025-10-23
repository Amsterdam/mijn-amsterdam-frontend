import { isAfter, parseISO } from 'date-fns';
import { generatePath } from 'react-router';
import slug from 'slugme';

import {
  HLIRegelingFrontend,
  HLIresponseData,
  ZorgnedHLIRegeling,
} from './hli-regelingen-types';
import { hliStatusLineItemsConfig } from './hli-status-line-items';
import { fetchZorgnedAanvragenHLI } from './hli-zorgned-service';
import { fetchStadspas } from './stadspas';
import {
  filterCombineRtmData,
  RTM_STATUS_IN_BEHANDELING,
} from './status-line-items/regeling-rtm';
import {
  featureToggle,
  routeConfig,
} from '../../../client/pages/Thema/HLI/HLI-thema-config';
import {
  apiSuccessResult,
  getFailedDependencies,
  getSettledResult,
} from '../../../universal/helpers/api';
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
  filterCombineUpcPcvData,
  isWorkshopNietGevolgd,
} from './status-line-items/regeling-pcvergoeding';
import { toDateFormatted } from '../../../universal/helpers/utils';

type GenericDisplayStatus =
  | 'Toegewezen'
  | 'Afgewezen'
  | 'Einde recht'
  | 'Onbekend';

type GetDisplayStatusFn<T extends string, x = T | GenericDisplayStatus> = (
  regeling: ZorgnedHLIRegeling,
  statusLineItems: StatusLineItem[]
) => x;

const getDisplayStatus: GetDisplayStatusFn<GenericDisplayStatus> = (
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

const getRTMDisplayStatus: GetDisplayStatusFn<
  GenericDisplayStatus | 'In behandeling genomen'
> = (regeling: ZorgnedHLIRegeling, statusLineItems: StatusLineItem[]) => {
  const isInBehandelingGenomen = statusLineItems.some((item) => {
    return item.status === RTM_STATUS_IN_BEHANDELING && item.isActive;
  });
  if (isInBehandelingGenomen) {
    return RTM_STATUS_IN_BEHANDELING;
  }
  return getDisplayStatus(regeling, statusLineItems);
};

function getDocumentsFrontend(
  sessionID: SessionID,
  documents: GenericDocument[]
) {
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

function transformRegelingForFrontend<T extends string>(
  sessionID: SessionID,
  aanvraag: ZorgnedAanvraagWithRelatedPersonsTransformed,
  statusLineItems: StatusLineItem[],
  getDisplayStatusFn?: GetDisplayStatusFn<T>
) {
  const id = aanvraag.id;

  const route = generatePath(routeConfig.detailPage.path, {
    id,
    regeling: slug(aanvraag.titel),
  });

  const displayStatus = getDisplayStatusFn
    ? getDisplayStatusFn(aanvraag, statusLineItems)
    : getDisplayStatus(aanvraag, statusLineItems);

  // Override isActueel for Afgewezen (RTM* / UPC*) regelingen.
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
  const [remainder, rtmAanvragenCombined] = filterCombineRtmData(
    aanvragen,
    authProfileAndToken.profile.id
  );
  const aanvragenCombined = filterCombineUpcPcvData(remainder);

  const regelingenFrontend: HLIRegelingFrontend[] = [];

  for (const [regeling, statusLineItems_] of rtmAanvragenCombined) {
    const statusLineItems = statusLineItems_.map((item) => {
      return {
        ...item,
        documents:
          item.documents &&
          getDocumentsFrontend(authProfileAndToken.profile.sid, item.documents),
      };
    });
    const regelingFrontend = transformRegelingForFrontend(
      authProfileAndToken.profile.sid,
      regeling,
      statusLineItems,
      getRTMDisplayStatus
    );
    regelingenFrontend.push(regelingFrontend);
  }

  for (const aanvraag of aanvragenCombined) {
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

export async function fetchHLI(authProfileAndToken: AuthProfileAndToken) {
  const [stadspasResult, regelingenResult] = await Promise.allSettled([
    fetchStadspas(authProfileAndToken),
    fetchRegelingen(authProfileAndToken),
  ]);

  const regelingenResponseData = getSettledResult(regelingenResult);
  const stadspasResponseData = getSettledResult(stadspasResult);

  const HLIResponseData: HLIresponseData = {
    regelingen: regelingenResponseData.content ?? [],
    stadspas: stadspasResponseData.content,
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
  getDisplayStatus,
  getDocumentsFrontend,
  transformRegelingenForFrontend,
  transformRegelingForFrontend,
  transformRegelingTitle,
};
