import {
  ADRES_IN_ONDERZOEK_B,
  GEMEENTE_CODE_AMSTERDAM,
  LANDCODE_NEDERLAND,
  LANDCODE_ONBEKEND,
  ADRES_IN_ONDERZOEK_A,
} from './brp-config';
import {
  BrpFrontend,
  PersonenResponseSource,
  type DatumSource,
} from './brp-types';
import { IS_PRODUCTION } from '../../../universal/config/env';
import type { AuthProfile, AuthProfileAndToken } from '../../auth/auth-types';
import { ONE_HOUR_MS } from '../../config/app';
import { getFromEnv } from '../../helpers/env';
import { getApiConfig } from '../../helpers/source-api-helpers';
import { requestData } from '../../helpers/source-api-request';
import { fetchAuthTokenHeader } from '../ms-oauth/oauth-token';
import type { BRPData, Persoon } from '../profile/brp.types';
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
      aanduidingNaamgebruikOmschrijving:
        persoon.naam?.aanduidingNaamgebruik?.omschrijving ?? null,
      bsn: persoon.burgerservicenummer ?? null,
      geboortedatum: getDatum(persoon.geboorte?.datum),
      geboortedatumFormatted: persoon.geboorte?.datum?.langFormaat ?? null,
      overlijdensdatum: getDatum(persoon.overlijden?.datum),
      overlijdensdatumFormatted: persoon.overlijden?.datum?.langFormaat ?? null,
      geboortelandnaam: persoon.geboorte?.land?.omschrijving ?? null,
      geboorteplaatsnaam: persoon.geboorte?.plaats?.omschrijving ?? null,
      gemeentenaamInschrijving:
        persoon.gemeenteVanInschrijving?.omschrijving ?? null,
      voorvoegselGeslachtsnaam: persoon.naam?.voorvoegsel ?? null,
      geslachtsnaam: persoon.naam?.geslachtsnaam ?? null,
      omschrijvingBurgerlijkeStaat:
        partner && !partner.ontbindingHuwelijkPartnerschap ? null : 'Ongehuwd', // Only for person without a partner.
      omschrijvingGeslachtsaanduiding: persoon.geslacht?.omschrijving ?? null,
      omschrijvingAdellijkeTitel:
        persoon.naam?.adellijkeTitelPredicaat?.omschrijving ?? null,
      opgemaakteNaam: persoon.naam?.volledigeNaam ?? null,
      voornamen: persoon.naam?.voornamen ?? null,
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
          persoon: {
            voornamen: partner.naam?.voornamen ?? null,
            geslachtsnaam: partner.naam?.geslachtsnaam ?? null,
            voorvoegselGeslachtsnaam: partner.naam?.voorvoegsel ?? null,
            opgemaakteNaam: partner.naam?.volledigeNaam ?? null,
            geboortelandnaam: partner.geboorte?.land?.omschrijving ?? null,
            geboorteplaatsnaam: partner.geboorte?.plaats?.omschrijving ?? null,
          },
        }
      : null,
    ouders:
      persoon.ouders
        ?.filter(
          (ouder) => typeof ouder !== 'undefined' && !!ouder.naam.voornamen
        )
        .map((ouder) => ({
          geboortedatum: getDatum(ouder.geboorte?.datum),
          geboortedatumFormatted: ouder.geboorte?.datum?.langFormaat ?? null,
          opgemaakteNaam: ouder.naam?.volledigeNaam ?? null,
          voornamen: ouder.naam?.voornamen ?? null,
          geslachtsnaam: ouder.naam?.geslachtsnaam ?? null,
          voorvoegselGeslachtsnaam: ouder.naam?.voorvoegsel ?? null,
        })) ?? [],
    kinderen:
      persoon.kinderen
        ?.filter((kind) => typeof kind !== 'undefined' && !!kind.naam.voornamen)
        ?.map((kind) => ({
          geboortedatum: getDatum(kind.geboorte?.datum) ?? null,
          geboortedatumFormatted: kind.geboorte?.datum?.langFormaat ?? null,
          opgemaakteNaam: kind.naam?.volledigeNaam ?? null,
          voornamen: kind.naam?.voornamen ?? null,
          geslachtsnaam: kind.naam?.geslachtsnaam ?? null,
          voorvoegselGeslachtsnaam: kind.naam?.voorvoegsel ?? null,
        })) ?? [],
    adres: {
      locatiebeschrijving: adres?.locatiebeschrijving ?? null,
      straatnaam: adres?.korteStraatnaam ?? null,
      postcode: adres?.postcode ?? null,
      woonplaatsNaam: adres?.woonplaats ?? null,
      landnaam: adres?.land?.omschrijving ?? null,
      huisnummer: adres?.huisnummer?.toString() || null,
      huisnummertoevoeging: adres?.huisnummertoevoeging ?? null,
      huisletter: adres?.huisletter ?? null,
      begindatumVerblijf: getDatum(persoon.verblijfplaats?.datumVan) ?? null,
      begindatumVerblijfFormatted:
        persoon.verblijfplaats?.datumVan?.langFormaat ?? null,
    },
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
      'X-Correlation-ID': `fetch-brp-${sessionID}`, // Required for tracing
    },
    data: {
      type: 'RaadpleegMetBurgerservicenummer',
      gemeenteVanInschrijving: GEMEENTE_CODE_AMSTERDAM,
      burgerservicenummer: bsn.map((bsn) => translateBSN(bsn)),
    },
    transformResponse: transformBenkBrpResponse,
  });

  return requestData<BRPData>(requestConfig);
}

export async function fetchBrpV2(authProfileAndToken: AuthProfileAndToken) {
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
