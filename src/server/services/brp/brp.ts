import {
  ADRES_IN_ONDERZOEK_B,
  GEMEENTE_CODE_AMSTERDAM,
  LANDCODE_NEDERLAND,
  LANDCODE_ONBEKEND,
  ADRES_IN_ONDERZOEK_A,
} from './brp-config';
import {
  type BrpFrontend,
  type PersonenResponseSource,
  type DatumSource,
  type Adres,
  type VerblijfplaatshistorieResponseSource,
  type VerblijfplaatsSource,
} from './brp-types';
import type { Persoon, PersoonBasis, PersoonBasisSource } from './brp-types';
import {
  featureToggle as featureToggleBrp,
  themaIdBRP,
} from '../../../client/pages/Thema/Profile/Profile-thema-config';
import { IS_PRODUCTION } from '../../../universal/config/env';
import {
  apiSuccessResult,
  getFailedDependencies,
} from '../../../universal/helpers/api';
import { dateFormat } from '../../../universal/helpers/date';
import type { AuthProfile, AuthProfileAndToken } from '../../auth/auth-types';
import { ONE_HOUR_MS } from '../../config/app';
import { getFromEnv } from '../../helpers/env';
import { getApiConfig } from '../../helpers/source-api-helpers';
import { requestData } from '../../helpers/source-api-request';
import { getContextOperationId } from '../monitoring';
import { fetchAuthTokenHeader } from '../ms-oauth/oauth-token';
import { fetchBRP } from '../profile/brp';
import type { BRPData } from '../profile/brp.types';
import { type BSN } from '../zorgned/zorgned-types';

const TOKEN_VALIDITY_PERIOD = 1 * ONE_HOUR_MS;
const PERCENTAGE_DISTANCE_FROM_EXPIRY = 0.1;

function fetchBenkBrpTokenHeader() {
  return fetchAuthTokenHeader(
    {
      sourceApiName: 'BRP',
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
        ? `${datum.jaar}-${datum.maand.padStart(2, '0')}-01`
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
  responseData: PersonenResponseSource
): BrpFrontend | null {
  const [persoon] = responseData.personen ?? [];
  if (!persoon) {
    throw new Error('No person found in Benk BRP response');
  }

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

  const [partner] = persoon.partners ?? [];
  const adres = verblijfplaats?.verblijfadres ?? null;
  const isVerblijfAdresBuitenland =
    adres &&
    'land' in adres &&
    adres?.land?.code !== LANDCODE_NEDERLAND &&
    adres?.land?.code !== LANDCODE_ONBEKEND;

  const responseContent: BrpFrontend = {
    persoon: {
      ...getPersoonBasis(persoon),
      aanduidingNaamgebruikOmschrijving:
        persoon.naam?.aanduidingNaamgebruik?.omschrijving ?? null,
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
      mokum: persoon.gemeenteVanInschrijving?.code === GEMEENTE_CODE_AMSTERDAM,
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
          datumOntbinding: getDatum(
            partner.ontbindingHuwelijkPartnerschap?.datum
          ),
          datumOntbindingFormatted:
            partner.ontbindingHuwelijkPartnerschap?.datum?.langFormaat ?? null,
          datumSluiting: getDatum(partner.aangaanHuwelijkPartnerschap?.datum),
          datumSluitingFormatted:
            partner.aangaanHuwelijkPartnerschap?.datum?.langFormaat ?? null,
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
    adresHistorisch: [],
  };

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
    transformResponse: transformBenkBrpResponse,
  });

  const brpBsnResponse = await requestData<BRPData>(requestConfig);

  if (brpBsnResponse.status !== 'OK' || brpBsnResponse.content === null) {
    return brpBsnResponse;
  }

  const verblijfplaatshistorieResponse =
    await fetchBrpVerblijfplaatsHistoryByBsn(
      sessionID,
      translateBSN(bsn[0]),
      brpBsnResponse.content.persoon.geboortedatum || '1900-01-01',
      brpBsnResponse.content.adres?.begindatumVerblijf ||
        dateFormat(new Date(), 'YYYY-MM-DD')
    );

  if (
    brpBsnResponse.status === 'OK' &&
    verblijfplaatshistorieResponse.status === 'OK'
  ) {
    brpBsnResponse.content.adresHistorisch =
      verblijfplaatshistorieResponse.content;
  }

  return apiSuccessResult(
    brpBsnResponse.content,
    getFailedDependencies({
      adresHistorisch: verblijfplaatshistorieResponse,
    })
  );
}
function transformBenkBrpVerblijfplaatsHistoryResponse(
  responseData: VerblijfplaatshistorieResponseSource
): Adres[] {
  return responseData.verblijfplaatsen.map((verblijfplaats) =>
    getAdres(verblijfplaats)
  );
}

export async function fetchBrpVerblijfplaatsHistoryByBsn(
  sessionID: AuthProfile['sid'],
  bsn: BSN,
  dateFrom: string,
  dateTo: string
) {
  const response = await fetchBenkBrpTokenHeader();

  if (response.status !== 'OK') {
    return response;
  }

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
      datumVan: dateFrom,
      datumTot: dateTo,
    },
    transformResponse: transformBenkBrpVerblijfplaatsHistoryResponse,
  });

  return requestData<Adres[]>(requestConfig);
}

export async function fetchBrpV2(authProfileAndToken: AuthProfileAndToken) {
  if (!featureToggleBrp[themaIdBRP].benkBrpServiceActive) {
    return fetchBRP(authProfileAndToken);
  }
  return fetchBrpByBsn(authProfileAndToken.profile.sid, [
    authProfileAndToken.profile.id,
  ]);
}

export const forTesting = {
  fetchBenkBrpTokenHeader,
  getDatum,
  transformBenkBrpResponse,
  translateBSN,
};
