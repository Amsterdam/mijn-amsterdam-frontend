import { generatePath } from 'react-router-dom';
import {
  ApiErrorResponse,
  ApiPostponeResponse,
  ApiResponse,
  ApiSuccessResponse,
  apiDependencyError,
  apiSuccessResult,
  defaultDateFormat,
  getSettledResult,
} from '../../../universal/helpers';
import { getApiConfig } from '../../config';
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
import { AppRoutes, Chapters } from '../../../universal/config';
import { GenericDocument, MyNotification } from '../../../universal/types';

const ID_ATTRIBUTE = (authProfileAndToken: AuthProfileAndToken) =>
  authProfileAndToken.profile.profileType === 'commercial'
    ? 'rol__betrokkeneIdentificatie__nietNatuurlijkPersoon__innNnpId'
    : 'rol__betrokkeneIdentificatie__natuurlijkPersoon__inpBsn';

function transformBezwarenDocumentsResults(
  response: BezwarenSourceResponse<BezwaarSourceDocument>
): GenericDocument[] {
  const results = response.results;
  if (Array.isArray(results)) {
    return results.map(({ titel, registratiedatum, uuid }) => ({
      id: uuid,
      title: titel,
      datePublished: defaultDateFormat(registratiedatum),
      url: '#',
    }));
  }
  return [];
}

export async function fetchBezwarenDocuments(
  zaakId: string
): Promise<GenericDocument[] | null> {
  const params = {
    zaak: zaakId,
  };

  const bezwarenDocumentsResponse = await requestData<GenericDocument[]>(
    getApiConfig('BEZWAREN_DOCUMENTS', {
      params,
      transformResponse: transformBezwarenDocumentsResults,
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
    | ApiSuccessResponse<Bezwaar[]>
) {
  if (bezwarenResponse.status !== 'OK') {
    return [];
  }

  const enrichtedList = bezwarenResponse.content.map(async (bezwaar) => {
    const statussen: BezwaarStatus[] = await fetchBezwaarStatus(bezwaar.uuid);
    const documenten = (await fetchBezwarenDocuments(bezwaar.uuid)) ?? [];

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
    [ID_ATTRIBUTE(authProfileAndToken)]:
      process.env.BFF_BEZWAREN_TEST_BSN ?? authProfileAndToken.profile.id,
  });

  const params = {
    page: 1,
  };

  const requestConfig = getApiConfig('BEZWAREN_LIST', {
    data: requestBody,
    params,
    transformResponse: transformBezwarenResults,
  });

  const bezwarenResponse = await requestData<Bezwaar[]>(
    requestConfig,
    requestID
  );

  const enrichedResponse = await enrichBezwaarResponse(bezwarenResponse);

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

export async function fetchBezwaarStatus(
  zaakUUID: string
): Promise<BezwaarStatus[]> {
  const params = {
    zaak: zaakUUID,
  };

  const requestConfig = getApiConfig('BEZWAREN_STATUS', {
    params,
    transformResponse: transformBezwaarStatus,
  });

  const bezwarenStatusResponse = await requestData<BezwaarStatus[]>(
    requestConfig,
    zaakUUID
  );

  if (bezwarenStatusResponse.status === 'OK') {
    return bezwarenStatusResponse.content;
  }

  return [];
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

    console.log('notifications', notifications);

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
