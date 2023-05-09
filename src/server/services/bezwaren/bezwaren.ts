import jose from 'jose';
import { generatePath } from 'react-router-dom';
import {
  ApiErrorResponse,
  ApiPostponeResponse,
  ApiResponse,
  ApiSuccessResponse,
  apiDependencyError,
  apiErrorResult,
  apiSuccessResult,
  defaultDateFormat,
  getSettledResult,
} from '../../../universal/helpers';
import {
  BFF_BASE_PATH,
  BFF_PUBLIC_URL,
  BffEndpoints,
  getApiConfig,
} from '../../config';
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
): Promise<GenericDocument[] | null> {
  const params = {
    // We need to pass the entire url as query parameter
    zaak: getZaakUrl(zaakId),
  };

  const bezwarenDocumentsResponse = await requestData<GenericDocument[]>(
    getApiConfig('BEZWAREN_DOCUMENTS', {
      params,
      transformResponse: transformBezwarenDocumentsResults,
      headers: getBezwarenApiHeaders(authProfileAndToken),
    }),
    zaakId
  );

  if (bezwarenDocumentsResponse.status === 'OK') {
    return bezwarenDocumentsResponse.content;
  }

  return null;
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
        datumbesluit: besluitdatum === null ? null : besluitdatum,
        datumIntrekking: getKenmerkValue(
          bezwaarBron.kenmerken,
          'datumintrekking'
        ),
        einddatum: !!bezwaarBron.einddatum ? bezwaarBron.einddatum : null,
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

function isNotErrorResponse(
  item: ApiErrorResponse<null> | Bezwaar
): item is Bezwaar {
  return item.status !== 'ERROR';
}

async function enrichBezwaarResponse(
  bezwarenResponse:
    | ApiPostponeResponse
    | ApiErrorResponse<null>
    | ApiSuccessResponse<Bezwaar[]>,
  authProfileAndToken: AuthProfileAndToken
) {
  if (bezwarenResponse.status !== 'OK') {
    return [];
  }

  const enrichtedList = bezwarenResponse.content.map(async (bezwaar) => {
    const statussen: BezwaarStatus[] = await fetchBezwaarStatus(
      bezwaar.uuid,
      authProfileAndToken
    );
    const documenten =
      (await fetchBezwarenDocuments(bezwaar.uuid, authProfileAndToken)) ?? [];

    const enrichedBezwaar: Bezwaar = {
      ...bezwaar,
      statussen,
      documenten,
    };

    return enrichedBezwaar;
  });

  const content = await Promise.allSettled(enrichtedList);
  const results = content.map((res) => getSettledResult(res));

  return results.filter(isNotErrorResponse);
}

export async function fetchBezwaren(
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken
): Promise<ApiResponse<Bezwaar[] | null>> {
  const requestBody = JSON.stringify({
    [getIdAttribute(authProfileAndToken)]:
      process.env.BFF_BEZWAREN_TEST_BSN ?? authProfileAndToken.profile.id,
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

  const enrichedResponse = await enrichBezwaarResponse(
    bezwarenResponse,
    authProfileAndToken
  );

  return apiSuccessResult(enrichedResponse);
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
): Promise<BezwaarStatus[]> {
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

  if (bezwarenStatusResponse.status === 'OK') {
    return bezwarenStatusResponse.content;
  }

  return [];
}

export async function fetchBezwaarDocument(
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken,
  document: string
) {
  const bezwaren = await fetchBezwaren(requestID, authProfileAndToken);
  const documentIds =
    bezwaren.content === null
      ? []
      : bezwaren.content
          ?.map((b) => b.documenten)
          .flat()
          .map((d) => d.id);

  if (
    documentIds.length === 0 ||
    documentIds.find((documentId) => documentId === document) === undefined
  ) {
    return apiErrorResult('Unknown document', null);
  }

  const requestConfig = getApiConfig('BEZWAREN_DOCUMENT', {
    headers: getBezwarenApiHeaders(authProfileAndToken),
  });
  requestConfig.url = generatePath(
    `${process.env.BFF_BEZWAREN_API}/enkelvoudiginformatieobjecten/:id/download`,
    { id: document }
  );

  return requestData<string>(requestConfig, requestID);
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
  const tokenData = {
    'Unique-name': process.env.BFF_BEZWAREN_EMAIL,
    Actort: process.env.BBFF_EZWAREN_USER,
    Email: process.env.BFF_BEZWAREN_EMAIL,
    UserId: process.env.BFF_BEZWAREN_USER,
    UserLogin: process.env.BFF_BEZWAREN_EMAIL,
    MedewerkerId: process.env.BFF_BEZWAREN_EMPLOYEE_ID,
    Role: '',
    NameIdentifier: '',
  };

  if (authProfileAndToken.profile.authMethod === 'digid') {
    tokenData.Role = 'natuurlijk_persoon';
    tokenData.NameIdentifier = authProfileAndToken.profile.id ?? '';
  }

  if (authProfileAndToken.profile.authMethod === 'eherkenning') {
    tokenData.Role = 'niet_natuurlijk_persoon';
    tokenData.NameIdentifier = authProfileAndToken.profile.id ?? '';
  }

  return {
    Authorization: jose.JWT.sign(
      tokenData,
      process.env.BFF_BEZWAREN_TOKEN_KEY ?? '',
      {
        algorithm: 'HS256',
        header: {
          typ: 'JWT',
        },
      }
    ),
  };
}
