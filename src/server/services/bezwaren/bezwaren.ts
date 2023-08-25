import jose from 'jose';
import { generatePath } from 'react-router-dom';
import { AppRoutes, Chapters } from '../../../universal/config';
import {
  ApiSuccessResponse,
  apiDependencyError,
  apiSuccessResult,
  defaultDateFormat,
  getSettledResult,
} from '../../../universal/helpers';
import { GenericDocument, MyNotification } from '../../../universal/types';
import { BffEndpoints, getApiConfig } from '../../config';
import { requestData } from '../../helpers';
import { AuthProfileAndToken } from '../../helpers/app';
import {
  Bezwaar,
  BezwaarSourceData,
  BezwaarSourceDocument,
  BezwaarSourceStatus,
  BezwaarStatus,
  BezwarenSourceResponse,
  Kenmerk,
  kenmerkKey,
} from './types';
import { decrypt, encrypt } from '../../../universal/helpers/encrypt-decrypt';
import axios from 'axios';

function getIdAttribute(authProfileAndToken: AuthProfileAndToken) {
  return authProfileAndToken.profile.profileType === 'commercial'
    ? 'rol__betrokkeneIdentificatie__nietNatuurlijkPersoon__innNnpId'
    : 'rol__betrokkeneIdentificatie__natuurlijkPersoon__inpBsn';
}

function getZaakUrl(zaakId: string) {
  return `${process.env.BFF_BEZWAREN_API}/zaken/${zaakId}`;
}

function transformBezwarenDocumentsResults(
  documents: BezwaarSourceDocument[]
): GenericDocument[] {
  if (Array.isArray(documents)) {
    return documents.map(({ titel, registratiedatum, uuid }) => {
      const [documentIdEncrypted] = encrypt(
        uuid,
        process.env.BFF_GENERAL_ENCRYPTION_KEY ?? ''
      );
      return {
        id: documentIdEncrypted,
        title: titel,
        datePublished: defaultDateFormat(registratiedatum),
        url: `${process.env.BFF_OIDC_BASE_URL}/api/v1${generatePath(
          BffEndpoints.BEZWAREN_ATTACHMENTS,
          { id: documentIdEncrypted }
        )}`,
      };
    });
  }
  return [];
}

export async function fetchBezwarenDocuments(
  zaakId: string,
  authProfileAndToken: AuthProfileAndToken
) {
  const params = {
    // We need to pass the entire url as query parameter
    zaak: getZaakUrl(zaakId),
  };

  const bezwarenDocumentsResponse = requestData<GenericDocument[]>(
    getApiConfig('BEZWAREN_DOCUMENTS', {
      params,
      transformResponse: transformBezwarenDocumentsResults,
      headers: getBezwarenApiHeaders(authProfileAndToken),
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
): Bezwaar[] {
  const results = response.results;
  if (Array.isArray(results)) {
    return results
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
          omschrijving: bezwaarBron.omschrijving,
          toelichting: bezwaarBron.toelichting,
          status: getKenmerkValue(bezwaarBron.kenmerken, 'statustekst'),
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
      .sort((a, b) => {
        const aStart = new Date(a.startdatum);
        const bStart = new Date(b.startdatum);

        return aStart < bStart ? 1 : aStart > bStart ? -1 : 0;
      });
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
    headers: getBezwarenApiHeaders(authProfileAndToken),
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
    headers: getBezwarenApiHeaders(authProfileAndToken, isDownload),
    responseType: isDownload ? 'stream' : 'json',
  });
}

async function enrichBezwaarResponse(
  bezwarenResponse: ApiSuccessResponse<Bezwaar[]>,
  authProfileAndToken: AuthProfileAndToken
) {
  const rs = [];

  // Go through the list of returned bezwaren and use the uuid property to call other api's
  for (const bezwaar of bezwarenResponse.content) {
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
  return apiSuccessResult(enrichedBezwaren);
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
    headers: getBezwarenApiHeaders(authProfileAndToken),
  });

  const bezwarenResponse = await requestData<Bezwaar[]>(
    requestConfig,
    requestID
  );

  // If the main call to bezwaren is ok, proceed.
  if (bezwarenResponse.status === 'OK') {
    return enrichBezwaarResponse(bezwarenResponse, authProfileAndToken);
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
  const isDone = !!bezwaar.einddatum && !!bezwaar.resultaat;
  const isWithdrawn = !!bezwaar.datumIntrekking;

  const notification: MyNotification = {
    chapter: Chapters.BEZWAREN,
    id: bezwaar.identificatie,
    title: 'Bezwaar in behandeling',
    description: `Wij hebben uw bezwaar ${bezwaar.identificatie} in behandeling genomen.`,
    datePublished: bezwaar.startdatum,
    link: {
      to: bezwaar.link.to,
      title: 'Bekijk uw bezwaar',
    },
  };

  if (isDone) {
    notification.title = 'Bezwaar afgehandeld';
    notification.description = `Er is een besluit over uw bezwaar ${bezwaar.identificatie}.`;
    notification.datePublished = bezwaar.einddatum!;
  }

  if (isWithdrawn) {
    notification.title = 'Bezwaar ingetrokken';
    notification.description = `U hebt uw bezwaar ${bezwaar.identificatie} ingetrokken.`;
    notification.datePublished = bezwaar.datumIntrekking!;
  }

  return notification;
}

function getBezwarenApiHeaders(
  authProfileAndToken: AuthProfileAndToken,
  isDocumentDownload: boolean = false
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

  const header = {
    'Content-Type': isDocumentDownload ? 'aplication/pdf' : 'application/json',
    apikey: process.env.BFF_BEZWAREN_APIKEY ?? '',
    Authorization: `Bearer ${jose.JWT.sign(
      tokenData,
      process.env.BFF_BEZWAREN_TOKEN_KEY ?? '',
      {
        algorithm: 'HS256',
        header: {
          typ: 'JWT',
        },
      }
    )}`,
  };

  return header;
}
