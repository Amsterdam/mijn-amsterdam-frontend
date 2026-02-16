import { isAfter, parseISO, subYears } from 'date-fns';

import {
  ADRES_IN_ONDERZOEK_B,
  GEMEENTE_CODE_AMSTERDAM,
  LANDCODE_NEDERLAND,
  LANDCODE_ONBEKEND,
  ADRES_IN_ONDERZOEK_A,
  AANTAL_BEWONERS_NOT_SET,
} from './brp-config';
import { featureToggle, routes } from './brp-service-config';
import {
  DEFAULT_VERBLIJFPLAATSHISTORIE_DATE_FROM,
  DEFAULT_VERBLIJFPLAATSHISTORIE_DATE_TO,
} from './brp-service-config';
import {
  type BrpFrontend,
  type PersonenResponseSource,
  type DatumSource,
  type Adres,
  type VerblijfplaatshistorieResponseSource,
  type VerblijfplaatsSource,
} from './brp-types';
import type {
  PersonenResponseSourceError,
  Persoon,
  PersoonBasis,
  PersoonBasisSource,
  PersoonSource,
} from './brp-types';
import { HttpStatusCode } from '../../../client/hooks/api/useBffApi';
import { IS_PRODUCTION } from '../../../universal/config/env';
import {
  apiErrorResult,
  apiSuccessResult,
  getFailedDependencies,
  type ApiResponse,
} from '../../../universal/helpers/api';
import type { AuthProfile, AuthProfileAndToken } from '../../auth/auth-types';
import { ONE_HOUR_MS } from '../../config/app';
import { encryptSessionIdWithRouteIdParam } from '../../helpers/encrypt-decrypt';
import { getFromEnv } from '../../helpers/env';
import { getApiConfig } from '../../helpers/source-api-helpers';
import { isSuccessStatus, requestData } from '../../helpers/source-api-request';
import { generateFullApiUrlBFF } from '../../routing/route-helpers';
import { fetchAuthTokenHeader } from '../iam-oauth/oauth-token';
import { getContextOperationId } from '../monitoring';
import { type BSN } from '../zorgned/zorgned-types';

const TOKEN_VALIDITY_PERIOD = 1 * ONE_HOUR_MS;
const PERCENTAGE_DISTANCE_FROM_EXPIRY = 0.1;

function fetchBenkBrpTokenHeader() {
  return fetchAuthTokenHeader(
    'IAM_MS_OAUTH',
    {
      sourceApiName: 'BENK_BRP',
      tokenValidityMS:
        TOKEN_VALIDITY_PERIOD * (1 - PERCENTAGE_DISTANCE_FROM_EXPIRY),
    },
    {
      clientID: getFromEnv('BFF_BENK_BRP_CLIENT_ID') ?? '',
      clientSecret: getFromEnv('BFF_BENK_BRP_CLIENT_SECRET') ?? '',
      tenantID: getFromEnv('BFF_BENK_BRP_TENANT') ?? '',
      scope: `${getFromEnv('BFF_BENK_BRP_APPLICATION_ID')}/.default`,
    }
  );
}

function getDatum(datum?: DatumSource): string | null {
  if (!datum) {
    return null;
  }

  switch (datum.type) {
    case 'JaarDatum':
      return datum.jaar ? `${datum.jaar}-01-01` : null;
    case 'JaarMaandDatum':
      return datum.jaar && datum.maand
        ? `${datum.jaar}-${datum.maand.toString().padStart(2, '0')}-01`
        : null;
    default:
    case 'Datum':
      return datum.datum ? datum.datum : null;
    case 'DatumOnbekend':
      return null;
  }
}

function getAdres(verblijfplaats: VerblijfplaatsSource) {
  const verblijfadres = verblijfplaats?.verblijfadres;
  return {
    locatiebeschrijving: verblijfadres?.locatiebeschrijving ?? null,
    straatnaam: verblijfadres?.korteStraatnaam ?? null,
    postcode: verblijfadres?.postcode ?? null,
    woonplaatsNaam: verblijfadres?.woonplaats ?? null,
    landnaam: verblijfadres?.land?.omschrijving ?? null,
    huisnummer: verblijfadres?.huisnummer?.toString() || null,
    huisnummertoevoeging: verblijfadres?.huisnummertoevoeging ?? null,
    huisletter: verblijfadres?.huisletter ?? null,
    begindatumVerblijf: getDatum(verblijfplaats?.datumVan) ?? null,
    begindatumVerblijfFormatted: verblijfplaats?.datumVan?.langFormaat ?? null,
  };
}

function getPersoonBasis(persoon: PersoonBasisSource): PersoonBasis {
  return {
    voornamen: persoon.naam?.voornamen ?? null,
    geslachtsnaam: persoon.naam?.geslachtsnaam ?? null,
    omschrijvingAdellijkeTitel:
      persoon.naam?.adellijkeTitelPredicaat?.omschrijving ?? null,
    voorvoegselGeslachtsnaam: persoon.naam?.voorvoegsel ?? null,
    opgemaakteNaam: persoon.naam?.volledigeNaam ?? null,

    geboortedatum: getDatum(persoon.geboorte?.datum),
    geboortedatumFormatted: persoon.geboorte?.datum?.langFormaat ?? null,
    geboortelandnaam: persoon.geboorte?.land?.omschrijving ?? null,
    geboorteplaatsnaam: persoon.geboorte?.plaats?.omschrijving ?? null,

    overlijdensdatum: getDatum(persoon.overlijden?.datum),
    overlijdensdatumFormatted: persoon.overlijden?.datum?.langFormaat ?? null,
  };
}

function transformBenkBrpResponse(
  sessionID: AuthProfile['sid'],
  persoon: PersoonSource,
  bsnTranslation?: { from: BSN; to: BSN }
): BrpFrontend {
  let adresInOnderzoek: Persoon['adresInOnderzoek'] | null = null;
  const verblijfplaats = persoon.verblijfplaats;

  if (
    verblijfplaats?.inOnderzoek ||
    verblijfplaats?.verblijfadres?.inOnderzoek
  ) {
    adresInOnderzoek = ADRES_IN_ONDERZOEK_A;
  }

  if (verblijfplaats?.indicatieVastgesteldVerblijftNietOpAdres) {
    adresInOnderzoek = ADRES_IN_ONDERZOEK_B;
  }

  const isMokum =
    persoon.gemeenteVanInschrijving?.code === GEMEENTE_CODE_AMSTERDAM;
  const [partner] = persoon.partners ?? [];
  const adres = verblijfplaats?.verblijfadres ?? null;
  const isVerblijfAdresBuitenland =
    adres &&
    'land' in adres &&
    adres?.land?.code !== LANDCODE_NEDERLAND &&
    adres?.land?.code !== LANDCODE_ONBEKEND;

  const fetchUrlAantalBewoners =
    isMokum &&
    verblijfplaats?.adresseerbaarObjectIdentificatie &&
    featureToggle.service.fetchAantalBewonersOpAdres.isEnabled
      ? generateFullApiUrlBFF(routes.protected.BRP_AANTAL_BEWONERS_OP_ADRES, [
          {
            id: encryptSessionIdWithRouteIdParam(
              sessionID,
              verblijfplaats.adresseerbaarObjectIdentificatie
            ),
          },
        ])
      : null;

  const responseContent: BrpFrontend = {
    persoon: {
      ...getPersoonBasis(persoon),
      bsn: persoon.burgerservicenummer ?? null,
      gemeentenaamInschrijving:
        persoon.gemeenteVanInschrijving?.omschrijving ?? null,
      omschrijvingBurgerlijkeStaat:
        partner && !partner.ontbindingHuwelijkPartnerschap ? null : 'Ongehuwd', // Only for person without a partner.
      omschrijvingGeslachtsaanduiding: persoon.geslacht?.omschrijving ?? null,
      nationaliteiten:
        persoon.nationaliteiten
          ?.filter((n) => typeof n !== 'undefined')
          ?.map((n) => ({
            omschrijving: n.nationaliteit?.omschrijving ?? '',
          }))
          .filter((n) => !!n.omschrijving) ?? [],
      mokum: isMokum,
      vertrokkenOnbekendWaarheen:
        verblijfplaats?.type === 'VerblijfplaatsOnbekend',
      datumVertrekUitNederlandFormatted: isVerblijfAdresBuitenland
        ? verblijfplaats.datumVan?.langFormaat
        : null,
      datumVertrekUitNederland:
        (isVerblijfAdresBuitenland
          ? getDatum(verblijfplaats?.datumVan)
          : null) ?? null,
      indicatieGeheim: !!persoon.geheimhoudingPersoonsgegevens,
      adresInOnderzoek,
    },
    verbintenis: partner
      ? {
          soortVerbintenis: partner.soortVerbintenis?.omschrijving ?? null,
          datumSluiting: getDatum(partner.aangaanHuwelijkPartnerschap?.datum),
          datumSluitingFormatted:
            partner.aangaanHuwelijkPartnerschap?.datum?.langFormaat ?? null,
          plaats:
            partner.aangaanHuwelijkPartnerschap?.plaats?.omschrijving ?? null,
          land: partner.aangaanHuwelijkPartnerschap?.land?.omschrijving ?? null,
          datumOntbinding: getDatum(
            partner.ontbindingHuwelijkPartnerschap?.datum
          ),
          datumOntbindingFormatted:
            partner.ontbindingHuwelijkPartnerschap?.datum?.langFormaat ?? null,
          persoon: getPersoonBasis(partner),
        }
      : null,
    ouders:
      persoon.ouders
        ?.filter(
          (ouder) =>
            typeof ouder !== 'undefined' &&
            !!(
              ouder.naam.voornamen ||
              ouder.naam.geslachtsnaam ||
              ouder.naam.volledigeNaam
            )
        )
        .map((ouder) => getPersoonBasis(ouder)) ?? [],
    kinderen:
      persoon.kinderen
        ?.filter(
          (kind) =>
            typeof kind !== 'undefined' &&
            !!(
              kind.naam.voornamen ||
              kind.naam.geslachtsnaam ||
              kind.naam.volledigeNaam
            )
        )
        ?.map((kind) => getPersoonBasis(kind)) ?? [],
    adres: verblijfplaats?.verblijfadres ? getAdres(verblijfplaats) : null,
    fetchUrlAantalBewoners,
    adresHistorisch: [],
    aantalBewoners: AANTAL_BEWONERS_NOT_SET,
  };

  if (
    !IS_PRODUCTION &&
    bsnTranslation &&
    bsnTranslation?.from !== bsnTranslation?.to
  ) {
    responseContent.bsnTranslation = bsnTranslation;
  }

  return responseContent;
}

function translateBSN(bsn: BSN): BSN {
  const translations = getFromEnv('BFF_BENK_BSN_TRANSLATIONS', false);
  // IS_PRODUCTION is explicitly set to exclude this code from being used in this environment.
  if (!translations || IS_PRODUCTION) {
    return bsn;
  }

  const translationsMap = new Map(
    translations.split(',').map((pair) => pair.split('=')) as Iterable<
      [string, string]
    >
  );

  return translationsMap.get(bsn) ?? bsn;
}

export async function fetchBrpByBsn(sessionID: AuthProfile['sid'], bsn: BSN[]) {
  const response = await fetchBenkBrpTokenHeader();

  if (response.status !== 'OK') {
    return response;
  }

  const requestConfig = getApiConfig('BENK_BRP', {
    formatUrl(requestConfig) {
      return `${requestConfig.url}/personen`;
    },
    headers: {
      ...response.content,
      'X-Correlation-ID': getContextOperationId(sessionID), // Required for tracing
    },
    data: {
      type: 'RaadpleegMetBurgerservicenummer',
      burgerservicenummer: bsn.map((bsn) => translateBSN(bsn)),
    },
  });

  const brpBsnResponse =
    await requestData<PersonenResponseSource>(requestConfig);

  return brpBsnResponse;
}

export async function fetchBrpByBsnTransformed(
  sessionID: AuthProfile['sid'],
  bsn: BSN
): Promise<ApiResponse<BrpFrontend>> {
  const brpResponse = await fetchBrpByBsn(sessionID, [bsn]);

  if (brpResponse.status !== 'OK' || !brpResponse.content?.personen?.length) {
    return apiErrorResult(
      brpResponse.status === 'ERROR'
        ? brpResponse.message
        : 'No person found in BRP response',
      null
    );
  }

  const [persoon] = brpResponse.content.personen;
  const transformedContent = transformBenkBrpResponse(sessionID, persoon, {
    from: bsn,
    to: translateBSN(bsn),
  });

  const verblijfplaatshistorieResponse =
    await fetchBrpVerblijfplaatsHistoryByBsnTransformed(
      sessionID,
      translateBSN(bsn),
      transformedContent.persoon.geboortedatum,
      transformedContent.adres?.begindatumVerblijf
    );

  if (verblijfplaatshistorieResponse.status === 'OK') {
    transformedContent.adresHistorisch = verblijfplaatshistorieResponse.content;
  }

  return apiSuccessResult(
    transformedContent,
    getFailedDependencies({
      adresHistorisch: verblijfplaatshistorieResponse,
    })
  );
}

export async function fetchBrpVerblijfplaatsHistoryByBsn(
  sessionID: AuthProfile['sid'],
  bsn: BSN,
  dateFrom?: string | null,
  dateTo?: string | null
) {
  const response = await fetchBenkBrpTokenHeader();

  if (response.status !== 'OK') {
    return response;
  }

  const dateFrom_ =
    dateFrom && dateTo && dateFrom === dateTo
      ? subYears(dateFrom, 1).toISOString().split('T')[0]
      : dateFrom;

  const requestConfig = getApiConfig('BENK_BRP', {
    formatUrl(requestConfig) {
      return `${requestConfig.url}/verblijfplaatshistorie`;
    },
    headers: {
      ...response.content,
      'X-Correlation-ID': getContextOperationId(sessionID), // Required for tracing
    },
    data: {
      type: 'RaadpleegMetPeriode',
      burgerservicenummer: bsn,
      datumVan: dateFrom_ ?? DEFAULT_VERBLIJFPLAATSHISTORIE_DATE_FROM,
      datumTot: dateTo ?? DEFAULT_VERBLIJFPLAATSHISTORIE_DATE_TO,
    },
  });

  return requestData<VerblijfplaatshistorieResponseSource>(requestConfig);
}

function transformBenkBrpVerblijfplaatsHistoryResponse(
  responseData: VerblijfplaatshistorieResponseSource
): Adres[] {
  return responseData.verblijfplaatsen.map((verblijfplaats) =>
    getAdres(verblijfplaats)
  );
}

export async function fetchBrpVerblijfplaatsHistoryByBsnTransformed(
  sessionID: AuthProfile['sid'],
  bsn: BSN,
  dateFrom?: string | null,
  dateTo?: string | null
): Promise<ApiResponse<Adres[]>> {
  const verblijfplaatsenResponse = await fetchBrpVerblijfplaatsHistoryByBsn(
    sessionID,
    bsn,
    dateFrom,
    dateTo
  );

  if (
    verblijfplaatsenResponse.status !== 'OK' ||
    verblijfplaatsenResponse.content === null
  ) {
    return verblijfplaatsenResponse;
  }

  const transformedContent = transformBenkBrpVerblijfplaatsHistoryResponse(
    verblijfplaatsenResponse.content
  );

  return apiSuccessResult(transformedContent);
}

export async function fetchBrp(authProfileAndToken: AuthProfileAndToken) {
  return fetchBrpByBsnTransformed(
    authProfileAndToken.profile.sid,
    authProfileAndToken.profile.id
  );
}

export async function fetchAantalBewoners(
  sessionID: AuthProfile['sid'],
  bagID: string
) {
  const response = await fetchBenkBrpTokenHeader();

  if (response.status !== 'OK') {
    return response;
  }
  const today = new Date();
  const requestConfig = getApiConfig('BENK_BRP', {
    formatUrl(requestConfig) {
      return `${requestConfig.url}/personen`;
    },
    headers: {
      ...response.content,
      'X-Correlation-ID': getContextOperationId(sessionID), // Required for tracing
    },
    transformResponse: (
      responseData: PersonenResponseSource | PersonenResponseSourceError | null
    ): string => {
      if (!responseData) {
        return `${AANTAL_BEWONERS_NOT_SET}`;
      }
      if (
        'code' in responseData &&
        responseData.status === HttpStatusCode.BadRequest &&
        responseData.code === 'tooManyResults'
      ) {
        return '> 30';
      }
      if (
        'status' in responseData &&
        responseData.status === HttpStatusCode.BadRequest
      ) {
        throw new Error(
          `HTTP 400 bad request code: '${responseData.code}' received`
        );
      }
      // This is redundant filtering, as the API should always return the correct data. See also: MIJN-12262
      const personenFiltered =
        ('personen' in responseData &&
          responseData.personen?.filter((persoon) => {
            const datumOpschortingBijhouding =
              persoon.opschortingBijhouding?.datum;
            return datumOpschortingBijhouding &&
              'datum' in datumOpschortingBijhouding
              ? isAfter(parseISO(datumOpschortingBijhouding.datum), today)
              : true;
          })) ||
        [];
      return `${personenFiltered?.length || AANTAL_BEWONERS_NOT_SET}`;
    },
    validateStatus: (statusCode) =>
      // This endpoint returns a 400 bad request when the reponse contains more than 30 objects.
      // The bad request status is provided in the body and handled in the transformResponse.
      isSuccessStatus(statusCode) || statusCode === HttpStatusCode.BadRequest,
    data: {
      type: 'ZoekMetAdresseerbaarObjectIdentificatie',
      inclusiefOverledenPersonen: false,
      // Only request adressering.adresregel3 to reduce payload. We don't require any other data to be fetched here.
      // The response will be used to count the number of personen related to a certain adresseerbaarObject.
      fields: ['adressering.adresregel3'],
      gemeenteVanInschrijving: GEMEENTE_CODE_AMSTERDAM,
      adresseerbaarObjectIdentificatie: bagID,
    },
  });

  return requestData<number>(requestConfig);
}

export const forTesting = {
  fetchBenkBrpTokenHeader,
  getDatum,
  transformBenkBrpResponse,
  translateBSN,
};
