import { generatePath } from 'react-router-dom';
import { AppRoutes, IS_OT, IS_TEST } from '../../../universal/config';
import {
  apiSuccessResult,
  capitalizeFirstLetter,
  dateSort,
  getFailedDependencies,
  getSettledResult,
} from '../../../universal/helpers';
import { AuthProfileAndToken } from '../../helpers/app';
import { ZorgnedAanvraagTransformed } from '../zorgned/zorgned-config-and-types';
import { getStatusLineItems } from '../zorgned/zorgned-status-line-items';
import { hliStatusLineItemsConfig } from './hli-status-line-items';
import {
  fetchNamenBetrokkenen,
  fetchZorgnedAanvragenHLI,
} from './hli-zorgned-service';
import { HLIRegeling, HLIresponseData } from './regelingen-types';
import { fetchStadspas } from './stadspas';
import { GenericDocument, StatusLineItem } from '../../../universal/types';
import slug from 'slugme';
import { encrypt } from '../../../universal/helpers/encrypt-decrypt';
import { BFF_BASE_PATH, BffEndpoints } from '../../config';

function getDisplayStatus(
  aanvraag: ZorgnedAanvraagTransformed,
  statusLineItems: StatusLineItem[]
) {
  switch (true) {
    case aanvraag.isActueel && aanvraag.resultaat === 'toegewezen':
      return 'Toegewezen';
    case !aanvraag.isActueel && aanvraag.resultaat === 'toegewezen':
      return 'Einde recht';
    case !aanvraag.isActueel && aanvraag.resultaat !== 'toegewezen':
      return 'Afgewezen';
  }
  return statusLineItems[statusLineItems.length - 1].status ?? 'NNB';
}

function getDocumentsFrontend(
  sessionID: AuthProfileAndToken['profile']['sid'],
  documents: GenericDocument[]
) {
  return documents.map((document) => {
    const [idEncrypted] = encrypt(`${sessionID}:${document.id}`);
    return {
      ...document,
      url: `${process.env.BFF_OIDC_BASE_URL}${BFF_BASE_PATH}${generatePath(
        BffEndpoints.HLI_DOCUMENT_DOWNLOAD,
        {
          id: idEncrypted,
        }
      )}`,
      id: idEncrypted,
    };
  });
}

export async function transformRegelingenForFrontend(
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken,
  aanvragen: ZorgnedAanvraagTransformed[],
  today: Date
): Promise<HLIRegeling[]> {
  const regelingenFrontend: HLIRegeling[] = [];

  for (const aanvraag of aanvragen) {
    const id = aanvraag.id;

    const statusLineItems = getStatusLineItems(
      'HLI',
      hliStatusLineItemsConfig,
      aanvraag,
      today
    );

    if (!Array.isArray(statusLineItems) || !statusLineItems.length) {
      continue;
    }

    const route = generatePath(AppRoutes['HLI/REGELING'], {
      id,
      regeling: slug(aanvraag.titel),
    });

    if (statusLineItems) {
      let namen: string[] = [];
      if (aanvraag.betrokkenen?.length) {
        const namenResponse = await fetchNamenBetrokkenen(
          requestID,
          authProfileAndToken,
          aanvraag.betrokkenen
        );
        if (namenResponse.status === 'OK') {
          namen = namenResponse.content;
        }
      }
      const regelingFrontend: HLIRegeling = {
        id,
        title: capitalizeFirstLetter(aanvraag.titel),
        supplier: aanvraag.leverancier,
        isActual: aanvraag.isActueel,
        link: {
          title: 'Meer informatie',
          to: route,
        },
        steps: statusLineItems,
        dateDescision: aanvraag.datumBesluit,
        dateStart: aanvraag.datumIngangGeldigheid,
        dateEnd: aanvraag.datumEindeGeldigheid,
        displayStatus: getDisplayStatus(aanvraag, statusLineItems),
        receiver: namen.join('\n'),
        documents: getDocumentsFrontend(
          authProfileAndToken.profile.sid,
          aanvraag.documenten
        ),
      };

      regelingenFrontend.push(regelingFrontend);
    }
  }

  regelingenFrontend.sort(dateSort('dateStart', 'desc'));

  return regelingenFrontend;
}

async function fetchRegelingen(
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken
) {
  const aanvragenResponse = await fetchZorgnedAanvragenHLI(
    requestID,
    authProfileAndToken
  );
  if (aanvragenResponse.status === 'OK') {
    const regelingen = await transformRegelingenForFrontend(
      requestID,
      authProfileAndToken,
      aanvragenResponse.content,
      new Date()
    );
    return apiSuccessResult(regelingen);
  }
  return aanvragenResponse;
}

export async function fetchHLI(
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken
) {
  const [stadspasResult, regelingenResult] = await Promise.allSettled([
    fetchStadspas(requestID, authProfileAndToken),
    fetchRegelingen(requestID, authProfileAndToken),
  ]);

  const HLIResponseData: HLIresponseData = {
    regelingen: getSettledResult(regelingenResult).content ?? [],
    stadspas: getSettledResult(stadspasResult).content,
  };

  return apiSuccessResult(
    HLIResponseData,
    getFailedDependencies(HLIResponseData)
  );
}
