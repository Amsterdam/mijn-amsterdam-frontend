import axios from 'axios';
import * as jose from 'jose';
import memoizee from 'memoizee';
import { generatePath } from 'react-router-dom';
import { AppRoutes, Chapters } from '../../../universal/config';
import {
  apiDependencyError,
  apiErrorResult,
  apiSuccessResult,
  dateSort,
  getFailedDependencies,
  getSettledResult,
  isRecentNotification,
} from '../../../universal/helpers';
import { decrypt, encrypt } from '../../../universal/helpers/encrypt-decrypt';
import { MyNotification } from '../../../universal/types';
import { BffEndpoints, getApiConfig } from '../../config';
import { requestData } from '../../helpers';
import { AuthProfileAndToken } from '../../helpers/app';
import { captureException } from '../monitoring';
import {
  Bezwaar,
  BezwaarDocument,
  BezwaarResponse,
  BezwaarSourceData,
  BezwaarSourceDocument,
  BezwaarSourceStatus,
  BezwaarStatus,
  BezwarenSourceResponse,
  Kenmerk,
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

function transformBezwarenDocumentsResults(
  sessionID: AuthProfileAndToken['profile']['sid'],
  response: BezwarenSourceResponse<BezwaarSourceDocument>
): BezwaarDocument[] {
  if (Array.isArray(response.results)) {
    return response.results.map(
      ({ bestandsnaam, identificatie, dossiertype, verzenddatum }) => {
        const [documentIdEncrypted] = encrypt(`${sessionID}:${identificatie}`);
        return {
          id: documentIdEncrypted,
          title: bestandsnaam,
          datePublished: verzenddatum,
          url: `${process.env.BFF_OIDC_BASE_URL}/api/v1${generatePath(
            BffEndpoints.BEZWAREN_DOCUMENT_DOWNLOAD,
            { id: documentIdEncrypted }
          )}`,
          dossiertype,
        };
      }
    );
  }
  return [];
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
  zaakId: string,
  authProfileAndToken: AuthProfileAndToken
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
    zaakId
  );

  return statusResponse;
}

export async function fetchBezwarenDocuments(
  zaakId: string,
  authProfileAndToken: AuthProfileAndToken
) {
  const params = {
    identifier: zaakId,
  };

  return requestData<BezwaarDocument[]>(
    getApiConfig('BEZWAREN_DOCUMENTS', {
      params,
      transformResponse: (responseData) =>
        transformBezwarenDocumentsResults(
          authProfileAndToken.profile.sid,
          responseData
        ),
      headers: await getBezwarenApiHeaders(authProfileAndToken),
    }),
    zaakId
  );
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
): BezwaarResponse {
  const results = response.results;

  if (Array.isArray(results)) {
    return {
      bezwaren: results
        .map((bezwaarBron) => {
          const besluitdatum = getKenmerkValue(
            bezwaarBron.kenmerken,
            'besluitdatum'
          );

          const [idEncrypted] = encrypt(`${sessionID}:${bezwaarBron.uuid}`);

          const bezwaar: Bezwaar = {
            identificatie: bezwaarBron.identificatie,
            zaakkenmerk:
              getKenmerkValue(bezwaarBron.kenmerken, 'zaakkenmerk') ?? '',
            uuid: bezwaarBron.uuid,
            uuidEncrypted: idEncrypted,
            startdatum: bezwaarBron.startdatum,
            ontvangstdatum: bezwaarBron.registratiedatum,
            omschrijving: bezwaarBron.omschrijving,
            toelichting: bezwaarBron.toelichting,
            status: getKenmerkValue(bezwaarBron.kenmerken, 'statustekst'),
            statusdatum: getKenmerkValue(bezwaarBron.kenmerken, 'statusdatum'),
            statussen: [],
            datumbesluit: besluitdatum,
            datumIntrekking: getKenmerkValue(
              bezwaarBron.kenmerken,
              'datumintrekking'
            ),
            einddatum: bezwaarBron.einddatum,
            primairbesluit: getKenmerkValue(bezwaarBron.kenmerken, 'besluitnr'),
            primairbesluitdatum: getKenmerkValue(
              bezwaarBron.kenmerken,
              'besluitdatum'
            ),
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
        .filter((bezwaar) => !!bezwaar.identificatie) // Filter bezwaren die nog niet inbehandeling zijn genomen (geen identificatie hebben)
        .sort(dateSort('ontvangstdatum', 'desc')),
      count: response.count,
    };
  }

  return {
    bezwaren: [],
    count: 0,
  };
}

export async function fetchBezwaren(
  requestID: requestID,
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

  let result: Bezwaar[] = [];
  let bezwarenResponse = await requestData<BezwaarResponse>(
    requestConfig,
    requestID
  );

  if (bezwarenResponse.status === 'OK' && bezwarenResponse.content) {
    result = result.concat(bezwarenResponse.content.bezwaren);

    while (
      result.length < bezwarenResponse.content.count &&
      bezwarenResponse.content.bezwaren.length > 0 &&
      requestConfig.params.page < MAX_PAGE_COUNT
    ) {
      requestConfig.params.page += 1; //Fetch next page
      bezwarenResponse = await requestData<BezwaarResponse>(
        requestConfig,
        requestID
      );

      if (bezwarenResponse.status === 'OK') {
        result = result.concat(bezwarenResponse.content.bezwaren);
      } else {
        return bezwarenResponse;
      }
    }

    return apiSuccessResult(result);
  }

  // Return the likely error response otherwise. This will make sure the front-end knows to show an error message to the user.
  return bezwarenResponse;
}

function createBezwaarNotification(bezwaar: Bezwaar) {
  const notification: MyNotification = {
    chapter: Chapters.BEZWAREN,
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
  requestID: requestID,
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
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken,
  zaakIdEncrypted: string
) {
  let sessionID;
  let zaakId;
  try {
    [sessionID, zaakId] = decrypt(zaakIdEncrypted).split(':');
  } catch (error) {
    captureException(error);
  }

  if (!zaakId || sessionID !== authProfileAndToken.profile.sid) {
    return apiErrorResult('Not authorized', null, 401);
  }

  const bezwaarStatusRequest = fetchBezwaarStatus(zaakId, authProfileAndToken);
  const bezwaarDocumentsRequest = fetchBezwarenDocuments(
    zaakId,
    authProfileAndToken
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

export async function fetchBezwaarDocument(
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken,
  documentIdEncrypted: string,
  isDownload: boolean = true
) {
  let sessionID: string = '';
  let documentId: string = '';

  try {
    [sessionID, documentId] = decrypt(documentIdEncrypted).split(':');
  } catch (error) {
    captureException(error);
  }

  if (!documentId || sessionID !== authProfileAndToken.profile.sid) {
    return apiErrorResult('Not authorized', null, 401);
  }

  const url = generatePath(
    `${process.env.BFF_BEZWAREN_API}/zgw/v1/enkelvoudiginformatieobjecten/:id${
      isDownload ? '/download' : ''
    }`,
    { id: documentId }
  );

  return axios({
    url,
    headers: await getBezwarenApiHeaders(authProfileAndToken),
    responseType: isDownload ? 'stream' : 'json',
  });
}
