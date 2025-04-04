import { generatePath } from 'react-router';
import slug from 'slugme';

import { HLIRegeling, HLIresponseData } from './hli-regelingen-types';
import { hliStatusLineItemsConfig } from './hli-status-line-items';
import { fetchZorgnedAanvragenHLI } from './hli-zorgned-service';
import { fetchStadspas } from './stadspas';
import {
  filterCombineRtmData,
  heeftDeel2VanDeRegelingNietVoltooid,
} from './status-line-items/regeling-rtm';
import { AppRoutes } from '../../../universal/config/routes';
import {
  apiSuccessResult,
  getFailedDependencies,
  getSettledResult,
} from '../../../universal/helpers/api';
import { capitalizeFirstLetter } from '../../../universal/helpers/text';
import { GenericDocument, StatusLineItem } from '../../../universal/types';
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
import { FeatureToggle } from '../../../universal/config/feature-toggles';

function getDisplayStatus(
  aanvraag: ZorgnedAanvraagWithRelatedPersonsTransformed,
  statusLineItems: StatusLineItem[]
) {
  const hasEindeRecht = statusLineItems.some(
    (regeling) => regeling.status === 'Einde recht'
  );
  switch (true) {
    // NOTE: Special status for PCVergoedingen.
    case isWorkshopNietGevolgd(aanvraag):
      return 'Afgewezen';

    // NOTE: Special status for RTM regelingen.
    case heeftDeel2VanDeRegelingNietVoltooid(aanvraag):
      return 'Afgewezen';

    case (aanvraag.isActueel || !hasEindeRecht) &&
      aanvraag.resultaat === 'toegewezen':
      return 'Toegewezen';

    case !aanvraag.isActueel && aanvraag.resultaat === 'toegewezen':
      return 'Einde recht';

    case !aanvraag.isActueel && aanvraag.resultaat !== 'toegewezen':
      return 'Afgewezen';
  }

  return statusLineItems[statusLineItems.length - 1]?.status ?? 'Onbekend';
}

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
      url: generateFullApiUrlBFF(BffEndpoints.HLI_DOCUMENT_DOWNLOAD, {
        id: idEncrypted,
      }),
      id: idEncrypted,
    };
  });
}

async function transformRegelingForFrontend(
  sessionID: SessionID,
  aanvraag: ZorgnedAanvraagWithRelatedPersonsTransformed,
  statusLineItems: StatusLineItem[]
) {
  const id = aanvraag.id;

  const route = generatePath(AppRoutes['HLI/REGELING'], {
    id,
    regeling: slug(aanvraag.titel),
  });

  const displayStatus = getDisplayStatus(aanvraag, statusLineItems);

  // Override isActueel for Afgewezen (RTM* / UPC*) regelingen.
  let isActual = aanvraag.isActueel;

  if (displayStatus === 'Afgewezen' && aanvraag.isActueel) {
    isActual = false;
  }

  const regelingFrontend: HLIRegeling = {
    id,
    title: capitalizeFirstLetter(aanvraag.titel),
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
    receiver:
      aanvraag.betrokkenPersonen?.map((person) => person.name).join(', ') ?? '',
    documents: getDocumentsFrontend(sessionID, aanvraag.documenten),
  };

  return regelingFrontend;
}

async function transformRegelingenForFrontend(
  authProfileAndToken: AuthProfileAndToken,
  aanvragen: ZorgnedAanvraagWithRelatedPersonsTransformed[],
  today: Date
): Promise<HLIRegeling[]> {
  const regelingenFrontend: HLIRegeling[] = [];

  let aanvragenWithDocumentsCombined = filterCombineUpcPcvData(aanvragen);
  aanvragenWithDocumentsCombined = filterCombineRtmData(
    aanvragenWithDocumentsCombined
  );

  for (const aanvraag of aanvragenWithDocumentsCombined) {
    const statusLineItems =
      getStatusLineItems<ZorgnedAanvraagWithRelatedPersonsTransformed>(
        'HLI',
        hliStatusLineItemsConfig,
        aanvraag,
        aanvragen,
        today
      );

    if (!Array.isArray(statusLineItems) || !statusLineItems.length) {
      continue;
    }

    const regelingForFrontend = await transformRegelingForFrontend(
      authProfileAndToken.profile.sid,
      aanvraag,
      statusLineItems
    );

    regelingenFrontend.push(regelingForFrontend);
  }

  return regelingenFrontend;
}

async function fetchRegelingen(
  requestID: RequestID,
  authProfileAndToken: AuthProfileAndToken
) {
  if (!FeatureToggle.hliThemaRegelingenActive) {
    return apiSuccessResult([]);
  }

  const aanvragenResponse = await fetchZorgnedAanvragenHLI(
    requestID,
    authProfileAndToken
  );
  if (aanvragenResponse.status === 'OK') {
    const regelingen = await transformRegelingenForFrontend(
      authProfileAndToken,
      aanvragenResponse.content,
      new Date()
    );
    return apiSuccessResult(regelingen);
  }
  return aanvragenResponse;
}

export async function fetchHLI(
  requestID: RequestID,
  authProfileAndToken: AuthProfileAndToken
) {
  const [stadspasResult, regelingenResult] = await Promise.allSettled([
    fetchStadspas(requestID, authProfileAndToken),
    fetchRegelingen(requestID, authProfileAndToken),
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
};
