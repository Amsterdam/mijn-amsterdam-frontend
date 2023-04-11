import { ApiResponse, defaultDateFormat } from '../../../universal/helpers';
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
} from './types';

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

function transformBezwarenResults(
  response: BezwarenSourceResponse<BezwaarSourceData>
): Bezwaar[] {
  const results = response.results;
  if (Array.isArray(results)) {
    return results.map((bron) => {
      return {
        uuid: bron.uuid,
        ontvangstdatum: defaultDateFormat(bron.startdatum),
        bezwaarnummer: bron.identificatie,
        omschrijving: bron.omschrijving,
        toelichting: bron.toelichting,
        status: getKenmerkValue(bron.kenmerken, 'statustekst'),
        datumbesluit: getKenmerkValue(bron.kenmerken, 'besluitdatum'), // Kenmerken zijn anders geformateerd, dateFormat is daardoor niet nodig.
        einddatum: !!bron.einddatum ? defaultDateFormat(bron.einddatum) : '',
      };
    });
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
    transformResponse: transformBezwarenResults,
  });

  const bezwarenResponse = await requestData<Bezwaar[]>(
    requestConfig,
    requestID
  );

  return bezwarenResponse;
}
