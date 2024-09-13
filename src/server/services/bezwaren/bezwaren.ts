import * as jose from 'jose';
import memoizee from 'memoizee';
import { generatePath } from 'react-router-dom';

import { MyNotification } from '../../../universal/types';
import { BffEndpoints, DataRequestConfig, getApiConfig } from '../../config';
import { encrypt } from '../../helpers/encrypt-decrypt';

import { AppRoutes } from '../../../universal/config/routes';
import { Themas } from '../../../universal/config/thema';
import {
  apiDependencyError,
  apiSuccessResult,
  getFailedDependencies,
  getSettledResult,
} from '../../../universal/helpers/api';
import { isRecentNotification } from '../../../universal/helpers/utils';
import { AuthProfileAndToken } from '../../auth/auth-types';
import { generateFullApiUrlBFF } from '../../helpers/app';
import { requestData } from '../../helpers/source-api-request';
import { decryptEncryptedRouteParamAndValidateSessionID } from '../shared/decrypt-route-param';
import { DocumentDownloadData } from '../shared/document-download-route-handler';
import {
  Bezwaar,
  BezwaarDocument,
  BezwaarSourceData,
  BezwaarSourceDocument,
  BezwaarSourceStatus,
  BezwaarStatus,
  BezwarenSourceResponse,
  Kenmerk,
  OctopusApiResponse,
  kenmerkKey,
} from './types';

const MAX_PAGE_COUNT = 5; // Should amount to 5 * 20 (per page) = 100 bezwaren

async function getBezwarenApiHeaders_(
  authProfileAndToken: AuthProfileAndToken
) {
  const now = new Date();

  const tokenData = {
    unique_name: process.env.BFF_BEZWAREN_EMAIL,
    actort: process.env.BFF_BEZWAREN_USER,
    email: process.env.BFF_BEZWAREN_EMAIL,
    userId: process.env.BFF_BEZWAREN_USER,
    userLogin: process.env.BFF_BEZWAREN_EMAIL,
    medewerkerId: parseInt(process.env.BFF_BEZWAREN_EMPLOYEE_ID ?? '-1', 10),
    role: '',
    nameIdentifier: '',
    exp: Math.ceil(now.setMinutes(now.getMinutes() + 5) / 1000),
  };

  if (authProfileAndToken.profile.authMethod === 'digid') {
    tokenData.role = 'natuurlijk_persoon';
    tokenData.nameIdentifier = authProfileAndToken.profile.id ?? '';
  }

  if (authProfileAndToken.profile.authMethod === 'eherkenning') {
    tokenData.role = 'niet_natuurlijk_persoon';
    tokenData.nameIdentifier = authProfileAndToken.profile.id ?? '';
  }

  const secret = new TextEncoder().encode(process.env.BFF_BEZWAREN_TOKEN_KEY);
  const jwt = await new jose.SignJWT(tokenData)
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .sign(secret);

  const header = {
    'Content-Type': 'application/json',
    apikey: process.env.BFF_BEZWAREN_APIKEY ?? '',
    Authorization: `Bearer ${jwt}`,
  };

  return header;
}

export const getBezwarenApiHeaders = memoizee(getBezwarenApiHeaders_);

function getIdAttribute(authProfileAndToken: AuthProfileAndToken) {
  return authProfileAndToken.profile.profileType === 'commercial'
    ? 'rol__betrokkeneIdentificatie__nietNatuurlijkPersoon__innNnpId'
    : 'rol__betrokkeneIdentificatie__natuurlijkPersoon__inpBsn';
}

function getZaakUrl(zaakId: string) {
  return `${process.env.BFF_BEZWAREN_API}/zaken/${zaakId}`;
}

async function fetchMultiple<T>(
  requestID: RequestID,
  requestConfig: DataRequestConfig,
  maxPageCount: number = MAX_PAGE_COUNT
) {
  let response = await requestData<OctopusApiResponse<T>>(
    requestConfig,
    requestID
  );
  let itemsLength = response.content?.items.length ?? 0;
  const resultCount = response.content?.count ?? 0;

  if (response.status === 'OK') {
    let items: T[] = response.content.items;
    if (resultCount > itemsLength) {
      while (
        itemsLength < resultCount &&
        requestConfig.params.page < maxPageCount
      ) {
        requestConfig.params.page += 1; //Fetch next page
        response = await requestData<OctopusApiResponse<T>>(
          requestConfig,
          requestID
        );

        if (response.status === 'OK') {
          items = items.concat(response.content.items);
          itemsLength += response.content.items.length;
        } else {
          return response;
        }
      }
    }
    return apiSuccessResult(items);
  }
  return response;
}

function transformBezwaarStatus(
  response: BezwarenSourceResponse<BezwaarSourceStatus>
): BezwaarStatus[] {
  const results = response.results;
  if (Array.isArray(results)) {
    return results.map((result) => {
      const statusDatum = new Date(result.datumStatusGezet);
      const now = new Date();

      const status = {
        uuid: result.uuid,
        datum: statusDatum <= now ? result.datumStatusGezet : '',
        statustoelichting: result.statustoelichting,
      };

      return status;
    });
  }

  return [];
}

async function fetchBezwaarStatus(
  requestID: RequestID,
  authProfileAndToken: AuthProfileAndToken,
  zaakId: string
) {
  const params = {
    zaak: getZaakUrl(zaakId),
  };

  const requestConfig = getApiConfig('BEZWAREN_STATUS', {
    params,
    transformResponse: transformBezwaarStatus,
    headers: await getBezwarenApiHeaders(authProfileAndToken),
  });

  const statusResponse = await requestData<BezwaarStatus[]>(
    requestConfig,
    requestID,
    authProfileAndToken
  );

  return statusResponse;
}

function transformBezwarenDocumentsResults(
  sessionID: AuthProfileAndToken['profile']['sid'],
  response: BezwarenSourceResponse<BezwaarSourceDocument>
): OctopusApiResponse<BezwaarDocument> {
  if (Array.isArray(response.results)) {
    const items = response.results.map(
      ({ bestandsnaam, identificatie, dossiertype, verzenddatum }) => {
        const [documentIdEncrypted] = encrypt(`${sessionID}:${identificatie}`);
        return {
          id: documentIdEncrypted,
          title: bestandsnaam,
          datePublished: verzenddatum,
          url: generateFullApiUrlBFF(BffEndpoints.BEZWAREN_DOCUMENT_DOWNLOAD, {
            id: documentIdEncrypted,
          }),
          dossiertype,
        };
      }
    );
    return {
      items,
      count: response.count,
    };
  }
  return {
    count: 0,
    items: [],
  };
}

export async function fetchBezwarenDocuments(
  requestID: RequestID,
  authProfileAndToken: AuthProfileAndToken,
  zaakId: string
) {
  const params = {
    page: 1,
    identifier: zaakId,
  };

  const requestConfig = getApiConfig('BEZWAREN_DOCUMENTS', {
    params,
    transformResponse: (responseData) => {
      return transformBezwarenDocumentsResults(
        authProfileAndToken.profile.sid,
        responseData
      );
    },
    headers: await getBezwarenApiHeaders(authProfileAndToken),
  });

  const bezwaarDocumentenResponse = await fetchMultiple<BezwaarDocument>(
    requestID,
    requestConfig
  );

  return bezwaarDocumentenResponse;
}

function getKenmerkValue(kenmerken: Kenmerk[], kenmerk: kenmerkKey) {
  const gevondenKenmerk = kenmerken.find((k) => k.kenmerk === kenmerk);

  if (!gevondenKenmerk) {
    return null;
  }

  return gevondenKenmerk.bron;
}

function transformBezwarenResults(
  sessionID: AuthProfileAndToken['profile']['sid'],
  response: BezwarenSourceResponse<BezwaarSourceData>
): OctopusApiResponse<Bezwaar> {
  const results = response.results;

  if (Array.isArray(results)) {
    const bezwaren = results
      .map((bezwaarBron) => {
        const [idEncrypted] = encrypt(`${sessionID}:${bezwaarBron.uuid}`);

        const bezwaar: Bezwaar = {
          identificatie: bezwaarBron.identificatie,
          uuid: bezwaarBron.uuid,
          uuidEncrypted: idEncrypted,

          // Wanneer het bezwaar is ontvangen
          ontvangstdatum: bezwaarBron.registratiedatum,
          // Wanneer het bezwaar in behandeling is genomen
          startdatum: bezwaarBron.startdatum,
          // Wanneer het bezwaar is afgehandeld
          einddatum: bezwaarBron.einddatum,

          omschrijving: bezwaarBron.omschrijving,
          toelichting: bezwaarBron.toelichting,

          // Laatste status van het bezwaar
          status: getKenmerkValue(bezwaarBron.kenmerken, 'statustekst'),
          statusdatum: getKenmerkValue(bezwaarBron.kenmerken, 'statusdatum'),

          // Placeholder voor alle (historische) statussen van het bezwaar
          statussen: [],

          // Gerelateerd aan het besluit waarop het bezwaar is ingediend.
          primairbesluit: getKenmerkValue(bezwaarBron.kenmerken, 'besluitnr'),
          primairbesluitdatum: getKenmerkValue(
            bezwaarBron.kenmerken,
            'besluitdatum'
          ),

          // Het resultaat van het bezwaar
          datumResultaat:
            bezwaarBron.publicatiedatum &&
            !['01-01-1753', '1753-01-01'].includes(bezwaarBron.publicatiedatum) // Empty date in Octopus is a date! :D
              ? bezwaarBron.publicatiedatum
              : null,
          resultaat: getKenmerkValue(bezwaarBron.kenmerken, 'resultaattekst'),

          documenten: [],
          link: {
            title: 'Bekijk details',
            to: generatePath(AppRoutes['BEZWAREN/DETAIL'], {
              uuid: bezwaarBron.uuid,
            }),
          },
        };

        return bezwaar;
      })
      .filter((bezwaar) => !!bezwaar.identificatie); // Filter bezwaren die nog niet inbehandeling zijn genomen (geen identificatie hebben)

    return {
      items: bezwaren,
      count: response.count,
    };
  }

  return {
    items: [],
    count: 0,
  };
}

function sortByBezwaarIdentificatie(item1: Bezwaar, item2: Bezwaar) {
  // strip all non-numeric characters from the string and parse as integer so we can do a proper number sort
  const identificatie1 = parseInt(item1.identificatie.replace(/\D/g, ''), 10);
  const identificatie2 = parseInt(item2.identificatie.replace(/\D/g, ''), 10);
  return identificatie2 - identificatie1;
}

export async function fetchBezwaren(
  requestID: RequestID,
  authProfileAndToken: AuthProfileAndToken
) {
  const requestBody = JSON.stringify({
    [getIdAttribute(authProfileAndToken)]: authProfileAndToken.profile.id,
  });

  const params = {
    page: 1,
  };

  const requestConfig = getApiConfig('BEZWAREN_LIST', {
    data: requestBody,
    params,
    transformResponse: (responseData) =>
      transformBezwarenResults(authProfileAndToken.profile.sid, responseData),
    headers: await getBezwarenApiHeaders(authProfileAndToken),
  });

  const bezwarenResponse = await fetchMultiple<Bezwaar>(
    requestID,
    requestConfig
  );

  if (bezwarenResponse.status === 'OK') {
    const bezwarenSorted = bezwarenResponse.content.sort(
      sortByBezwaarIdentificatie
    );
    return apiSuccessResult(bezwarenSorted);
  }

  // Return the likely error response otherwise. This will make sure the front-end knows to show an error message to the user.
  return bezwarenResponse;
}

function createBezwaarNotification(bezwaar: Bezwaar) {
  const notification: MyNotification = {
    thema: Themas.BEZWAREN,
    id: bezwaar.identificatie,
    title: 'Bezwaar ontvangen',
    description: `Wij hebben uw bezwaar ${bezwaar.identificatie} ontvangen.`,
    datePublished: bezwaar.statusdatum ?? bezwaar.startdatum,
    link: {
      to: bezwaar.link.to,
      title: 'Bekijk uw bezwaar',
    },
  };

  switch (bezwaar.status) {
    case 'Beoordeling bezwaarschrift':
      notification.title = 'Beoordeling in behandeling nemen bezwaar';
      notification.description = `Wij kijken of we uw bezwaar ${bezwaar.identificatie} inhoudelijk in behandeling kunnen nemen.`;
      break;

    case 'In behandeling':
      notification.title = 'Bezwaar in behandeling';
      notification.description = `Wij hebben uw bezwaar ${bezwaar.identificatie} in behandeling genomen.`;
      break;

    case 'Afgehandeld':
      notification.title = 'Bezwaar afgehandeld';
      notification.description = `Wij hebben uw bezwaar ${bezwaar.identificatie} afgehandeld.`;
      break;
  }

  return notification;
}

export async function fetchBezwarenNotifications(
  requestID: RequestID,
  authProfileAndToken: AuthProfileAndToken
) {
  const bezwaren = await fetchBezwaren(requestID, authProfileAndToken);

  if (bezwaren.status === 'OK') {
    const notifications: MyNotification[] = Array.isArray(bezwaren.content)
      ? bezwaren.content
          .map(createBezwaarNotification)
          .filter((bezwaar) => isRecentNotification(bezwaar.datePublished))
      : [];

    return apiSuccessResult({
      notifications,
    });
  }

  return apiDependencyError({ bezwaren });
}

export type BezwaarDetail = {
  statussen: BezwaarStatus[] | null;
  documents: BezwaarDocument[] | null;
};

export async function fetchBezwaarDetail(
  requestID: RequestID,
  authProfileAndToken: AuthProfileAndToken,
  zaakIdEncrypted: string
) {
  const decryptResult = decryptEncryptedRouteParamAndValidateSessionID(
    zaakIdEncrypted,
    authProfileAndToken
  );

  if (decryptResult.status === 'OK') {
    const zaakId = decryptResult.content;

    const bezwaarStatusRequest = fetchBezwaarStatus(
      requestID,
      authProfileAndToken,
      zaakId
    );

    const bezwaarDocumentsRequest = fetchBezwarenDocuments(
      requestID,
      authProfileAndToken,
      zaakId
    );

    const [statussenResponse, documentsResponse] = await Promise.allSettled([
      bezwaarStatusRequest,
      bezwaarDocumentsRequest,
    ]);

    const statussen = getSettledResult(statussenResponse);
    const documents = getSettledResult(documentsResponse);

    const failedDependencies = getFailedDependencies({
      statussen,
      documents,
    });

    return apiSuccessResult(
      {
        statussen: statussen.content,
        documents: documents.content,
      },
      failedDependencies
    );
  }

  return decryptResult;
}

export async function fetchBezwaarDocument(
  requestID: RequestID,
  authProfileAndToken: AuthProfileAndToken,
  documentId: string
) {
  const url =
    process.env.BFF_BEZWAREN_API +
    generatePath('/zgw/v1/enkelvoudiginformatieobjecten/:id/download', {
      id: documentId,
    });

  return requestData<DocumentDownloadData>(
    {
      url,
      responseType: 'stream',
      headers: await getBezwarenApiHeaders(authProfileAndToken),
      transformResponse: (documentResponseData) => {
        return {
          data: documentResponseData,
        };
      },
    },
    requestID,
    authProfileAndToken
  );
}

export const forTesting = {
  fetchMultiple,
};
