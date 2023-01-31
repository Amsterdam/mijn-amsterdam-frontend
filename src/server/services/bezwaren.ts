import { ApiResponse } from '../../universal/helpers';
import { getApiConfig } from '../config';
import { requestData } from '../helpers';
import { AuthProfileAndToken } from '../helpers/app';

export interface BezwaarData {
  // Ontvangstdatum
  registratiedatum: string;
  // Bezwaarnummer
  identificatie: string;
  // Onderwerp ???
  omschrijving: string | null;
  // Specificatie ???
  toelichting: string | null;
  // Status tekst
  status: string | null;
  // Status datum ???
  // Datum intrekking ???
  // Primair besluit ??? kenmerken.resultaattekst?
  // Datum primair besluit ??? kenmerken.besluitdatum?
  // Documentnr/URL ???
  // Resultaat ????
  // Afhandeldatum ????
}

export interface BezwarenSourceResponse<T> {
  count: number;
  next: string;
  previous: string;
  results: T[];
}

export interface BezwaarDocumentData {
  titel: string;
  beschrijving: string;
  registratiedatum: string;
  inhoud: string;
}

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

function transformBezwarenResults(
  response: BezwarenSourceResponse<BezwaarData[]>
) {
  const results = response.results;
  if (Array.isArray(results)) {
    return results;
  }
  return [];
}

export async function fetchBezwaren(
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken
): Promise<ApiResponse<BezwaarData[] | null>> {
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

  const bezwarenResponse = await requestData<BezwaarData[]>(
    requestConfig,
    requestID
  );

  return bezwarenResponse;
}
