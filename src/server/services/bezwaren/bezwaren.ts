import * as jose from 'jose';
import { generatePath } from 'react-router';

import { EMPTY_UUID, MAX_PAGE_COUNT, routes } from './bezwaren-service-config';
import {
  BezwaarFrontend,
  BezwaarDocument,
  BezwaarSourceData,
  BezwaarSourceDocument,
  BezwaarSourceStatus,
  BezwarenSourceResponse,
  Kenmerk,
  OctopusApiResponse,
  kenmerkKey,
} from './types';
import {
  routeConfig,
  themaId,
  themaTitle,
} from '../../../client/pages/Thema/Bezwaren/Bezwaren-thema-config';
import {
  apiDependencyError,
  apiSuccessResult,
  getFailedDependencies,
  getSettledResult,
} from '../../../universal/helpers/api';
import { defaultDateFormat } from '../../../universal/helpers/date';
import { isRecentNotification } from '../../../universal/helpers/utils';
import {
  MyNotification,
  StatusLineItem,
} from '../../../universal/types/App.types';
import { AuthProfileAndToken } from '../../auth/auth-types';
import { ONE_SECOND_MS } from '../../config/app';
import { DataRequestConfig } from '../../config/source-api';
import { encryptSessionIdWithRouteIdParam } from '../../helpers/encrypt-decrypt';
import { getFromEnv } from '../../helpers/env';
import {
  createSessionBasedCacheKey,
  getApiConfig,
} from '../../helpers/source-api-helpers';
import { requestData } from '../../helpers/source-api-request';
import { generateFullApiUrlBFF } from '../../routing/route-helpers';
import { trackEvent } from '../monitoring';
import { DocumentDownloadData } from '../shared/document-download-route-handler';

async function getBezwarenApiHeaders(authProfileAndToken: AuthProfileAndToken) {
  const now = new Date();

  const MINUTES_TO_EXPIRE = 5;
  const tokenData = {
    unique_name: process.env.BFF_BEZWAREN_EMAIL,
    actort: process.env.BFF_BEZWAREN_USER,
    email: process.env.BFF_BEZWAREN_EMAIL,
    userId: process.env.BFF_BEZWAREN_USER,
    userLogin: process.env.BFF_BEZWAREN_EMAIL,
    medewerkerId: parseInt(process.env.BFF_BEZWAREN_EMPLOYEE_ID ?? '-1', 10),
    role: '',
    nameIdentifier: '',
    exp: Math.ceil(
      now.setMinutes(now.getMinutes() + MINUTES_TO_EXPIRE) / ONE_SECOND_MS
    ),
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
    apikey: getFromEnv('BFF_ENABLEU_API_KEY'),
    Authorization: `Bearer ${jwt}`,
  };

  return header;
}

function getIdAttribute(authProfileAndToken: AuthProfileAndToken) {
  return authProfileAndToken.profile.profileType === 'commercial'
    ? 'rol__betrokkeneIdentificatie__nietNatuurlijkPersoon__innNnpId'
    : 'rol__betrokkeneIdentificatie__natuurlijkPersoon__inpBsn';
}

function getZaakUrl(zaakId: BezwaarFrontend['uuid']) {
  return `${process.env.BFF_BEZWAREN_API}/zaken/${zaakId}`;
}

async function fetchMultiple<T>(
  cacheKeyBase: string,
  requestConfigBase: DataRequestConfig,
  maxPageCount: number = MAX_PAGE_COUNT
) {
  const { params } = requestConfigBase;
  let page = params.page;
  let results: T[] = [];

  while (page < maxPageCount) {
    const cacheKey = `${cacheKeyBase}-${page}`;
    const response = await requestData<OctopusApiResponse<T>>({
      ...requestConfigBase,
      params: { ...params, page },
      cacheKey_UNSAFE: cacheKey,
    });

    if (response.status !== 'OK') {
      return response;
    }

    results = results.concat(response.content.results);
    if (results.length >= (response.content.count ?? 0)) {
      break;
    }

    page += 1;
  }

  return apiSuccessResult(results);
}

function transformBezwaarStatus(
  response: BezwarenSourceResponse<BezwaarSourceStatus>
): StatusLineItem[] {
  const statussen = response.results;

  if (Array.isArray(statussen)) {
    const index = statussen.findIndex((s) => s.uuid === EMPTY_UUID);
    const activeIndex =
      index > 0 ? index - 1 : index === 0 ? index : statussen.length - 1;

    return statussen.map((status, index) => {
      const statusDatum = new Date(status.datumStatusGezet);
      const now = new Date();

      const statusLineItem: StatusLineItem = {
        id: status.uuid,
        datePublished: statusDatum <= now ? status.datumStatusGezet : '',
        description: '',
        isChecked: status.uuid !== EMPTY_UUID,
        isActive: activeIndex === index,
        status: status.statustoelichting,
      };

      return statusLineItem;
    });
  }

  return [];
}

async function fetchBezwaarStatus(
  authProfileAndToken: AuthProfileAndToken,
  zaakId: BezwaarFrontend['uuid']
) {
  const params = {
    zaak: getZaakUrl(zaakId),
  };

  const requestConfig_: DataRequestConfig = {
    params,
    transformResponse: transformBezwaarStatus,
    headers: await getBezwarenApiHeaders(authProfileAndToken),
    cacheKey_UNSAFE: zaakId, // zaakId is a UUID, no need to specify additional uniqueness.
  };

  const requestConfig = getApiConfig('BEZWAREN_STATUS', requestConfig_);

  const statusResponse = await requestData<StatusLineItem[]>(
    requestConfig,
    authProfileAndToken
  );

  return statusResponse;
}

function transformBezwarenDocumentsResults(
  sessionID: SessionID,
  response: BezwarenSourceResponse<BezwaarSourceDocument>
): OctopusApiResponse<BezwaarDocument> {
  if (Array.isArray(response.results)) {
    const results = response.results.map(
      ({ bestandsnaam, identificatie, dossiertype, verzenddatum }) => {
        const documentIdEncrypted = encryptSessionIdWithRouteIdParam(
          sessionID,
          identificatie
        );
        return {
          id: documentIdEncrypted,
          title: bestandsnaam,
          datePublished: verzenddatum,
          url: generateFullApiUrlBFF(
            routes.protected.BEZWAREN_DOCUMENT_DOWNLOAD,
            [
              {
                id: documentIdEncrypted,
              },
            ]
          ),
          dossiertype,
        };
      }
    );
    return {
      results,
      count: response.count,
    };
  }
  return {
    count: 0,
    results: [],
  };
}

export async function fetchBezwarenDocuments(
  authProfileAndToken: AuthProfileAndToken,
  zaakId: BezwaarFrontend['uuid']
) {
  const params = {
    page: 1,
    identifier: zaakId,
  };

  const cacheKeyBase = createSessionBasedCacheKey(
    authProfileAndToken.profile.sid,
    zaakId
  );

  const requestConfig_: DataRequestConfig = {
    params,
    transformResponse: (responseData) => {
      return transformBezwarenDocumentsResults(
        authProfileAndToken.profile.sid,
        responseData
      );
    },
    headers: await getBezwarenApiHeaders(authProfileAndToken),
  };

  const requestConfigBase = getApiConfig('BEZWAREN_DOCUMENTS', requestConfig_);

  const bezwaarDocumentenResponse = await fetchMultiple<BezwaarDocument>(
    cacheKeyBase,
    requestConfigBase
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
  sessionID: SessionID,
  response: BezwarenSourceResponse<BezwaarSourceData>
): OctopusApiResponse<BezwaarFrontend> {
  const results = response.results;

  if (Array.isArray(results)) {
    const bezwaren = results
      .map((bezwaarBron) => {
        const idEncrypted = encryptSessionIdWithRouteIdParam(
          sessionID,
          bezwaarBron.uuid
        );

        const datumResultaat =
          bezwaarBron.publicatiedatum &&
          !['01-01-1753', '1753-01-01'].includes(bezwaarBron.publicatiedatum) // Empty date in Octopus is a date! :D
            ? bezwaarBron.publicatiedatum
            : null;

        const primairbesluitdatum = getKenmerkValue(
          bezwaarBron.kenmerken,
          'besluitdatum'
        );

        const bezwaar: BezwaarFrontend = {
          identificatie: bezwaarBron.identificatie,
          id: bezwaarBron.uuid,
          uuid: bezwaarBron.uuid,

          fetchUrl: generateFullApiUrlBFF(routes.protected.BEZWAREN_DETAIL, [
            { id: idEncrypted },
          ]),

          // Wanneer het bezwaar is ontvangen
          ontvangstdatum: bezwaarBron.registratiedatum,
          ontvangstdatumFormatted: bezwaarBron.registratiedatum
            ? defaultDateFormat(bezwaarBron.registratiedatum)
            : null,
          // Wanneer het bezwaar in behandeling is genomen
          startdatum: bezwaarBron.startdatum,
          // Wanneer het bezwaar is afgehandeld
          einddatum: bezwaarBron.einddatum,

          title: `Bezwaar ${bezwaarBron.identificatie}`,
          omschrijving: bezwaarBron.omschrijving,
          toelichting: bezwaarBron.toelichting,

          // Laatste status van het bezwaar
          displayStatus:
            getKenmerkValue(bezwaarBron.kenmerken, 'statustekst') ?? 'Onbekend',
          statusdatum: getKenmerkValue(bezwaarBron.kenmerken, 'statusdatum'),

          // Placeholder voor alle (historische) statussen van het bezwaar
          steps: [],

          // Gerelateerd aan het besluit waarop het bezwaar is ingediend.
          primairbesluit: getKenmerkValue(bezwaarBron.kenmerken, 'besluitnr'),
          primairbesluitdatum,
          primairbesluitdatumFormatted: primairbesluitdatum
            ? defaultDateFormat(primairbesluitdatum)
            : null,

          // Het resultaat van het bezwaar
          datumResultaat,
          datumResultaatFormatted: datumResultaat
            ? defaultDateFormat(datumResultaat)
            : null,
          resultaat: getKenmerkValue(bezwaarBron.kenmerken, 'resultaattekst'),

          documenten: [],
          link: {
            title: 'Bekijk details',
            to: generatePath(routeConfig.detailPage.path, {
              uuid: bezwaarBron.uuid,
            }),
          },
        };

        return bezwaar;
      })
      .filter((bezwaar) => !!bezwaar.identificatie); // Filter bezwaren die nog niet inbehandeling zijn genomen (geen identificatie hebben)

    return {
      results: bezwaren,
      count: response.count,
    };
  }

  return {
    results: [],
    count: 0,
  };
}

function sortByBezwaarIdentificatie(
  item1: BezwaarFrontend,
  item2: BezwaarFrontend
) {
  // strip all non-numeric characters from the string and parse as integer so we can do a proper number sort
  const identificatie1 = parseInt(item1.identificatie.replace(/\D/g, ''), 10);
  const identificatie2 = parseInt(item2.identificatie.replace(/\D/g, ''), 10);
  return identificatie2 - identificatie1;
}

export async function fetchBezwaren(authProfileAndToken: AuthProfileAndToken) {
  const requestBody = JSON.stringify({
    [getIdAttribute(authProfileAndToken)]: authProfileAndToken.profile.id,
  });

  const params = {
    page: 1,
  };

  const cacheKeyBase = createSessionBasedCacheKey(
    authProfileAndToken.profile.sid,
    'bezwaren'
  );

  const requestConfig_: DataRequestConfig = {
    data: requestBody,
    params,
    transformResponse: (responseData) =>
      transformBezwarenResults(authProfileAndToken.profile.sid, responseData),
    headers: await getBezwarenApiHeaders(authProfileAndToken),
  };

  const requestConfig = getApiConfig('BEZWAREN_LIST', requestConfig_);

  const bezwarenResponse = await fetchMultiple<BezwaarFrontend>(
    cacheKeyBase,
    requestConfig
  );

  if (bezwarenResponse.status !== 'OK') {
    return bezwarenResponse;
  }

  if (bezwarenResponse.content?.length) {
    trackEvent('bezwaren-aantal-per-gebruiker', {
      lopend: bezwarenResponse.content.filter(
        (b) => b.displayStatus !== 'Afgehandeld'
      ).length,
      afgehandeld: bezwarenResponse.content.filter(
        (b) => b.displayStatus === 'Afgehandeld'
      ).length,
    });
  }

  const bezwarenSorted = bezwarenResponse.content.sort(
    sortByBezwaarIdentificatie
  );

  return apiSuccessResult(bezwarenSorted);
}

function createBezwaarNotification(bezwaar: BezwaarFrontend) {
  const notification: MyNotification = {
    themaID: themaId,
    themaTitle: themaTitle,
    id: bezwaar.identificatie,
    title: 'Bezwaar ontvangen',
    description: `Wij hebben uw bezwaar ${bezwaar.identificatie} ontvangen.`,
    datePublished: bezwaar.statusdatum ?? bezwaar.startdatum,
    link: {
      to: bezwaar.link.to,
      title: 'Bekijk uw bezwaar',
    },
  };

  switch (bezwaar.displayStatus) {
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
  authProfileAndToken: AuthProfileAndToken
) {
  const bezwaren = await fetchBezwaren(authProfileAndToken);

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
  zaakId: BezwaarFrontend['uuid'];
  statussen: StatusLineItem[] | null;
  documents: BezwaarDocument[] | null;
};

export async function fetchBezwaarDetail(
  authProfileAndToken: AuthProfileAndToken,
  zaakId: BezwaarFrontend['uuid']
) {
  const bezwaarStatusRequest = fetchBezwaarStatus(authProfileAndToken, zaakId);

  const bezwaarDocumentsRequest = fetchBezwarenDocuments(
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
      zaakId,
      statussen: statussen.content,
      documents: documents.content,
    },
    failedDependencies
  );
}

export async function fetchBezwaarDocument(
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
    authProfileAndToken
  );
}

export const forTesting = {
  fetchMultiple,
  transformBezwaarStatus,
};
