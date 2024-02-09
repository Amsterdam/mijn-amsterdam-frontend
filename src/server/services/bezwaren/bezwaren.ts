import * as Sentry from '@sentry/node';
import axios from 'axios';
import * as jose from 'jose';
import { generatePath } from 'react-router-dom';
import { AppRoutes, Chapters } from '../../../universal/config';
import {
  apiDependencyError,
  apiSuccessResult,
  dateSort,
  defaultDateFormat,
  getSettledResult,
} from '../../../universal/helpers';
import { decrypt, encrypt } from '../../../universal/helpers/encrypt-decrypt';
import { GenericDocument, MyNotification } from '../../../universal/types';
import { BffEndpoints, getApiConfig } from '../../config';
import { requestData } from '../../helpers';
import { AuthProfileAndToken } from '../../helpers/app';
import {
  Bezwaar,
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

function getIdAttribute(authProfileAndToken: AuthProfileAndToken) {
  return authProfileAndToken.profile.profileType === 'commercial'
    ? 'rol__betrokkeneIdentificatie__nietNatuurlijkPersoon__innNnpId'
    : 'rol__betrokkeneIdentificatie__natuurlijkPersoon__inpBsn';
}

function getZaakUrl(zaakId: string) {
  return `${process.env.BFF_BEZWAREN_API}/zaken/${zaakId}`;
}

function transformBezwarenDocumentsResults(
  response: BezwarenSourceResponse<BezwaarSourceDocument>
): GenericDocument[] {
  if (Array.isArray(response.results)) {
    try {
      return response.results.map(
        ({ bestandsnaam, identificatie, dossiertype, verzenddatum }) => {
          const [documentIdEncrypted] = encrypt(
            identificatie,
            process.env.BFF_GENERAL_ENCRYPTION_KEY ?? ''
          );
          return {
            id: documentIdEncrypted,
            title: bestandsnaam,
            datePublished: defaultDateFormat(verzenddatum),
            url: `${process.env.BFF_OIDC_BASE_URL}/api/v1${generatePath(
              BffEndpoints.BEZWAREN_ATTACHMENTS,
              { id: documentIdEncrypted }
            )}`,
            dossiertype,
          };
        }
      );
    } catch (error) {
      Sentry.captureException(error);
    }
  }
  return [];
}

export async function fetchBezwarenDocuments(
  zaakId: string,
  authProfileAndToken: AuthProfileAndToken
) {
  const params = {
    identifier: zaakId,
  };

  const bezwarenDocumentsResponse = requestData<GenericDocument[]>(
    getApiConfig('BEZWAREN_DOCUMENTS', {
      params,
      transformResponse: transformBezwarenDocumentsResults,
      headers: await getBezwarenApiHeaders(authProfileAndToken),
    }),
    zaakId
  );

  return bezwarenDocumentsResponse;
}

function getKenmerkValue(kenmerken: Kenmerk[], kenmerk: kenmerkKey) {
  const gevondenKenmerk = kenmerken.find((k) => k.kenmerk === kenmerk);

  if (!gevondenKenmerk) {
    return null;
  }

  return gevondenKenmerk.bron;
}

function transformBezwarenResults(
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

          const bezwaar: Bezwaar = {
            identificatie: bezwaarBron.identificatie,
            zaakkenmerk:
              getKenmerkValue(bezwaarBron.kenmerken, 'zaakkenmerk') ?? '',
            uuid: bezwaarBron.uuid,
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
        .filter((bezwaar) => !!bezwaar.identificatie), // Filter bezwaren die nog niet inbehandeling zijn genomen (geen identificatie hebben)
      count: response.count,
    };
  }

  return {
    bezwaren: [],
    count: 0,
  };
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

  const bezwarenStatusResponse = await requestData<BezwaarStatus[]>(
    requestConfig,
    zaakId
  );

  return bezwarenStatusResponse;
}

export async function fetchBezwaarDocument(
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken,
  documentIdEncrypted: string,
  isDownload: boolean = true
) {
  const documentId = decrypt(
    documentIdEncrypted,
    process.env.BFF_GENERAL_ENCRYPTION_KEY ?? ''
  );

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

async function enrichBezwaarResponse(
  bezwaren: Bezwaar[],
  authProfileAndToken: AuthProfileAndToken
) {
  const rs = [];

  // Go through the list of returned bezwaren and use the uuid property to call other api's
  for (const bezwaar of bezwaren) {
    // non-blocking fetch of statusses
    const statussenPromise = fetchBezwaarStatus(
      bezwaar.uuid,
      authProfileAndToken
    );

    // non-blocking fetch of documents
    const documentenPromise = fetchBezwarenDocuments(
      bezwaar.uuid,
      authProfileAndToken
    );

    // combine all the data into one promise per bezwaar
    rs.push(
      Promise.all([
        Promise.resolve(bezwaar),
        statussenPromise,
        documentenPromise,
      ]).then((results) => apiSuccessResult(results))
    );
  }

  // Wait for all the promises to settle
  const results = await Promise.allSettled(rs);
  const enrichedBezwaren: Bezwaar[] = [];

  for (const result of results) {
    const settledResult = getSettledResult(result);

    if (settledResult.status === 'OK') {
      const [bezwaar, { content: statusses }, { content: documents }] =
        settledResult.content;

      // Combine the results
      const enrichedBezwaar: Bezwaar = {
        ...bezwaar,
        statussen: statusses ?? [],
        documenten: documents ?? [],
      };

      enrichedBezwaren.push(enrichedBezwaar);
    }
  }

  // Always return success regardless of potential errors in the additional api calls. These errors will be captured and sent to Sentry, not bugging the customer.
  // In this case at least the bezwaar is visible (possibly without status and/or documents)
  return apiSuccessResult(
    enrichedBezwaren.sort(dateSort('ontvangstdatum', 'desc'))
  );
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
    transformResponse: transformBezwarenResults,
    headers: await getBezwarenApiHeaders(authProfileAndToken),
  });

  let result: Bezwaar[] = [];

  let bezwarenResponse = await requestData<BezwaarResponse>(
    requestConfig,
    requestID
  );

  if (bezwarenResponse.status === 'OK' && bezwarenResponse.content) {
    result = result.concat(bezwarenResponse.content.bezwaren);

    // Need more data ?
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
  }

  // If the main call to bezwaren is ok, proceed.
  if (bezwarenResponse.status === 'OK') {
    return enrichBezwaarResponse(result, authProfileAndToken);
  }

  // Return the likely error response otherwise. This will make sure the front-end knows to show an error message to the user.
  return bezwarenResponse;
}

export async function fetchBezwarenNotifications(
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken
) {
  const bezwaren = await fetchBezwaren(requestID, authProfileAndToken);

  if (bezwaren.status === 'OK') {
    const notifications: MyNotification[] = Array.isArray(bezwaren.content)
      ? bezwaren.content.map(createBezwaarNotification)
      : [];

    return apiSuccessResult({
      notifications,
    });
  }

  return apiDependencyError({ bezwaren });
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

async function getBezwarenApiHeaders(authProfileAndToken: AuthProfileAndToken) {
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
