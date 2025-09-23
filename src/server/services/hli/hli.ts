import { isAfter, parseISO } from 'date-fns';
import { generatePath } from 'react-router';
import slug from 'slugme';

import { HLIRegelingFrontend, HLIresponseData } from './hli-regelingen-types';
import { hliStatusLineItemsConfig } from './hli-status-line-items';
import { fetchZorgnedAanvragenHLI } from './hli-zorgned-service';
import { fetchStadspas } from './stadspas';
import {
  filterCombineRtmData,
  isRTMDeel1,
  isRTMDeel2,
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

    case isRTMDeel1(aanvraag) && aanvraag.resultaat === 'toegewezen':
      return RTM_STATUS_IN_BEHANDELING;

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

function transformRegelingForFrontend(
  sessionID: SessionID,
  aanvraag: ZorgnedAanvraagWithRelatedPersonsTransformed,
  statusLineItems: StatusLineItem[]
) {
  const id = aanvraag.id;

  const route = generatePath(routeConfig.detailPage.path, {
    id,
    regeling: slug(aanvraag.titel),
  });

  const displayStatus = getDisplayStatus(aanvraag, statusLineItems);

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
  };

  return regelingFrontend;
}

function transformRegelingenForFrontend(
  authProfileAndToken: AuthProfileAndToken,
  aanvragen: ZorgnedAanvraagWithRelatedPersonsTransformed[],
  today: Date
): HLIRegelingFrontend[] {
  const [remainder, rtmAanvragenCombined] = filterCombineRtmData(aanvragen);
  const aanvragenCombined = filterCombineUpcPcvData(remainder);
  const aanvragenWithDocumentsCombined = [
    ...rtmAanvragenCombined,
    ...aanvragenCombined,
  ];

  const regelingenFrontend: HLIRegelingFrontend[] = [];

  for (const aanvraag of aanvragenWithDocumentsCombined) {
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

    const [updatedAanvraag, updatedStatusLineItems] =
      addDocumentsToRTMStatusLineItems(statusLineItems, aanvraag);

    const regelingForFrontend = transformRegelingForFrontend(
      authProfileAndToken.profile.sid,
      updatedAanvraag,
      updatedStatusLineItems
    );

    regelingenFrontend.push(regelingForFrontend);
  }

  return dedupeDocumentsInDataSets(regelingenFrontend, 'documents');
}

function addDocumentsToRTMStatusLineItems(
  statusLineItems: StatusLineItem[],
  aanvraag: ZorgnedAanvraagWithRelatedPersonsTransformed
): [ZorgnedAanvraagWithRelatedPersonsTransformed, StatusLineItem[]] {
  if (!(isRTMDeel1(aanvraag) || isRTMDeel2(aanvraag))) {
    return [aanvraag, statusLineItems];
  }

  type DocumentGroups = {
    rtm: {
      aanvraag: GenericDocument[];
    };
    other: GenericDocument[];
  };

  const initial: DocumentGroups = {
    rtm: {
      aanvraag: [],
    },
    other: [],
  };

  const documents = aanvraag.documenten.reduce((documentGroups, document) => {
    if (document.title === 'AV-RTM Info aan klant GGD') {
      documentGroups.rtm.aanvraag.push(document);
    } else {
      documentGroups.other.push(document);
    }
    return documentGroups;
  }, initial);

  const updatedAanvraag = {
    ...aanvraag,
    documenten: documents.other,
  };

  const updatedStatusLineItems = statusLineItems.map((item) => {
    if (item.status === 'Aanvraag') {
      return {
        ...item,
        documents: documents.rtm.aanvraag,
      };
    }
    return item;
  });

  return [updatedAanvraag, updatedStatusLineItems];
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
