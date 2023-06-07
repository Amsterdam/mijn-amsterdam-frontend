import jose from 'jose';
import { generatePath } from 'react-router-dom';
import {
  ApiSuccessResponse,
  apiDependencyError,
  apiErrorResult,
  apiSuccessResult,
  defaultDateFormat,
  getSettledResult,
} from '../../../universal/helpers';
import { BffEndpoints, getApiConfig } from '../../config';
import { requestData } from '../../helpers';
import { AuthProfileAndToken } from '../../helpers/app';
import {
  Bezwaar,
  BezwaarSourceData,
  BezwarenSourceResponse,
  Kenmerk,
  kenmerkKey,
  BezwaarStatus,
  BezwaarSourceStatus,
  BezwaarSourceDocument,
} from './types';
import { AppRoutes, Chapters, IS_ACCEPTANCE } from '../../../universal/config';
import { GenericDocument, MyNotification } from '../../../universal/types';

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
  const results = response.results;
  if (Array.isArray(results)) {
    return results.map(({ titel, registratiedatum, uuid }) => ({
      id: uuid,
      title: titel,
      datePublished: defaultDateFormat(registratiedatum),
      url: `${
        IS_ACCEPTANCE
          ? process.env.REACT_APP_BFF_API_URL_ACC
          : process.env.REACT_APP_BFF_API_URL
      }${generatePath(BffEndpoints.BEZWAREN_ATTACHMENTS, { id: uuid })}`,
    }));
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
    return results.map((bezwaarBron) => {
      const besluitdatum = getKenmerkValue(
        bezwaarBron.kenmerken,
        'besluitdatum'
      );

      const bezwaar: Bezwaar = {
        identificatie: bezwaarBron.identificatie,
        uuid: bezwaarBron.uuid,
        ontvangstdatum: bezwaarBron.startdatum,
        bezwaarnummer: bezwaarBron.identificatie,
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
  documentId: string
) {
  // For additional security, first re-fetch users bezwaren and check if the requested doc id is present in one.
  const bezwaren = await fetchBezwaren(requestID, authProfileAndToken);
  const documentIds =
    bezwaren.content?.flatMap((b) => b.documenten).map((d) => d.id) ?? [];

  const hasRequestedDocument = !!documentIds.find((id) => id === documentId);

  if (!hasRequestedDocument) {
    return apiErrorResult('Unknown document', null);
  }

  const requestConfig = getApiConfig('BEZWAREN_DOCUMENT', {
    headers: getBezwarenApiHeaders(authProfileAndToken),
  });

  requestConfig.url = generatePath(
    `${process.env.BFF_BEZWAREN_API}/zgw/v1/enkelvoudiginformatieobjecten/:id/download`,
    { id: documentId }
  );

  return requestData<string>(requestConfig, requestID);
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
  const isDone = !!bezwaar.einddatum;
  const isWithdrawn = !!bezwaar.datumIntrekking;

  const notification: MyNotification = {
    chapter: Chapters.BEZWAREN,
    id: bezwaar.identificatie,
    title: 'Bezwaar ontvangen',
    description: `Wij hebben uw bezwaar ${bezwaar.identificatie} ontvangen.`,
    datePublished: bezwaar.ontvangstdatum,
    link: {
      to: bezwaar.link.to,
      title: 'Bekijk details',
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

function getBezwarenApiHeaders(authProfileAndToken: AuthProfileAndToken) {
  const now = new Date();

  const tokenData = {
    unique_name: process.env.BFF_BEZWAREN_EMAIL,
    actort: process.env.BFF_BEZWAREN_USER,
    email: process.env.BFF_BEZWAREN_EMAIL,
    given_name: null,
    family_name: null,
    UserId: process.env.BFF_BEZWAREN_USER,
    UserLogin: process.env.BFF_BEZWAREN_EMAIL,
    MedewerkerId: parseInt(process.env.BFF_BEZWAREN_EMPLOYEE_ID ?? '', 10),
    Role: '',
    NameIdentifier: '',
    exp: Math.ceil(now.setMinutes(now.getMinutes() + 5) / 1000),
  };

  if (authProfileAndToken.profile.authMethod === 'digid') {
    tokenData.Role = 'natuurlijk_persoon';
    tokenData.NameIdentifier = authProfileAndToken.profile.id ?? '';
  }

  if (authProfileAndToken.profile.authMethod === 'eherkenning') {
    tokenData.Role = 'niet_natuurlijk_persoon';
    tokenData.NameIdentifier = authProfileAndToken.profile.id ?? '';
  }

  const header = {
    'Content-Type': 'application/json',
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
