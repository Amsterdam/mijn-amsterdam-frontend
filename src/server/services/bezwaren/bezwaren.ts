import { generatePath } from 'react-router-dom';
import {
  ApiResponse,
  defaultDateFormat,
  getSettledResult,
} from '../../../universal/helpers';
import { getApiConfig } from '../../config';
import { requestData } from '../../helpers';
import { AuthProfileAndToken } from '../../helpers/app';
import {
  Bezwaar,
  BezwaarSourceData,
  BezwaarDocumentData,
  BezwarenSourceResponse,
  Kenmerk,
  kenmerkKey,
  BezwaarStatus,
  BezwaarSourceStatus,
} from './types';
import { AppRoutes } from '../../../universal/config';

const ID_ATTRIBUTE = 'rol__betrokkeneIdentificatie__natuurlijkPersoon__inpBsn';

function transformBezwarenDocumentsResults(
  response: BezwarenSourceResponse<BezwaarDocumentData[]>
) {
  const results = response.results;
  if (Array.isArray(results)) {
    return results;
  }
  return [];
}

export async function fetchBezwarenDocuments(
  zaakUrl: string,
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken
) {
  const params = {
    zaak: zaakUrl,
  };

  const bezwarenDocumentsResponse = await requestData<
    BezwarenSourceResponse<BezwaarDocumentData>
  >(
    getApiConfig('BEZWAREN_DOCUMENTS', {
      params,
      transformResponse: transformBezwarenDocumentsResults,
    }),
    requestID
  );
  return bezwarenDocumentsResponse;
}

function getKenmerkValue(kenmerken: Kenmerk[], kenmerk: kenmerkKey) {
  const set = kenmerken.find((k) => k.kenmerk === kenmerk);

  if (!set) {
    return null;
  }

  return set.bron;
}

async function transformBezwarenResults(
  response: BezwarenSourceResponse<BezwaarSourceData>
): Promise<PromiseSettledResult<Bezwaar>[]> {
  const results = response.results;
  if (Array.isArray(results)) {
    return Promise.allSettled(
      results.map(async (bron) => {
        const statussen: BezwaarStatus[] = await fetchBezwaarStatus(bron.uuid);

        const bezwaar: Bezwaar = {
          uuid: bron.uuid,
          ontvangstdatum: defaultDateFormat(bron.startdatum),
          bezwaarnummer: bron.identificatie,
          omschrijving: bron.omschrijving,
          toelichting: bron.toelichting,
          status: getKenmerkValue(bron.kenmerken, 'statustekst'),
          statussen,
          datumbesluit: getKenmerkValue(bron.kenmerken, 'besluitdatum'), // Kenmerken zijn anders geformateerd, dateFormat is daardoor niet nodig.
          einddatum: !!bron.einddatum
            ? defaultDateFormat(bron.einddatum)
            : null,
          primairbesluit: getKenmerkValue(bron.kenmerken, 'besluitnr'),
          primairbesluitdatum: getKenmerkValue(bron.kenmerken, 'besluitdatum'),
          resultaat: getKenmerkValue(bron.kenmerken, 'resultaattekst'),
          link: {
            title: 'Bekijk details',
            to: generatePath(AppRoutes['BEZWAREN/DETAIL'], {
              uuid: bron.uuid,
            }),
          },
        };

        return bezwaar;
      })
    );
  }
  return [];
}

export async function fetchBezwaren(
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken
): Promise<ApiResponse<Bezwaar[] | null>> {
  const requestBody = JSON.stringify({
    [ID_ATTRIBUTE]:
      process.env.BFF_BEZWAREN_TEST_BSN ?? authProfileAndToken.profile.id,
  });

  const params = {
    page: 1,
  };

  const requestConfig = getApiConfig('BEZWAREN_LIST', {
    data: requestBody,
    params,
    transformResponse: async (res) => await transformBezwarenResults(res),
  });

  const bezwarenResponse = await requestData<Bezwaar[]>(
    requestConfig,
    requestID
  );

  return bezwarenResponse;
}

function transformBezwaarStatus(
  response: BezwarenSourceResponse<BezwaarSourceStatus>
): BezwaarStatus[] {
  const results = response.results;
  if (Array.isArray(results)) {
    return results.map((result) => ({
      uuid: result.uuid,
      datum: result.datumStatusGezet,
      statustoelichting: result.statustoelichting,
    }));
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
