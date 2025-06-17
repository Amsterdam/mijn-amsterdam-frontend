import { BrpFrontend, PersonenResponseSource } from './brp-types';
import { ONE_HOUR_MS } from '../../config/app';
import { getFromEnv } from '../../helpers/env';
import { getApiConfig } from '../../helpers/source-api-helpers';
import { requestData } from '../../helpers/source-api-request';
import { fetchAuthTokenHeader } from '../ms-oauth/oauth-token';
import { ZORGNED_GEMEENTE_CODE, type BSN } from '../zorgned/zorgned-types';

const TOKEN_VALIDITY_PERIOD = 24 * ONE_HOUR_MS;
const PERCENTAGE_DISTANCE_FROM_EXPIRY = 0.1;

function fetchBenkBrpTokenHeader() {
  return fetchAuthTokenHeader(
    {
      apiKey: 'BRP',
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

function transformBenkBrpResponse(
  responseData: PersonenResponseSource
): BrpFrontend | null {
  const [persoon] = responseData.personen;
  if (!persoon) {
    return null;
  }

  let adresInOnderzoek: '080000' | '089999' | null = null;

  if (persoon.verblijfplaats.indicatieVastgesteldVerblijftNietOpAdres) {
    adresInOnderzoek = '089999';
  }

  if (
    persoon.verblijfplaats.inOnderzoek ||
    persoon.verblijfplaats.verblijfadres.inOnderzoek
  ) {
    adresInOnderzoek = '080000';
  }

  const b: BrpFrontend = {
    persoon: {
      aanduidingNaamgebruikOmschrijving:
        persoon.naam.aanduidingNaamgebruik?.omschrijving ?? null,
      bsn: persoon.burgerservicenummer,
      geboortedatum: persoon.geboorte.datum?.datum ?? null,
      indicatieGeboortedatum: null, // TODO: refine
      overlijdensdatum: persoon.overlijden.datum.langFormaat,
      geboortelandnaam: persoon.geboorte.land?.omschrijving ?? null,
      geboorteplaatsnaam: persoon.geboorte.plaats?.omschrijving ?? null,
      gemeentenaamInschrijving:
        persoon.gemeenteVanInschrijving?.omschrijving ?? null,
      voorvoegselGeslachtsnaam: persoon.naam.voorvoegsel ?? null,
      geslachtsnaam: persoon.naam.geslachtsnaam ?? null,
      omschrijvingBurgerlijkeStaat: null, // TODO: refine
      omschrijvingGeslachtsaanduiding: persoon.geslacht.omschrijving,
      omschrijvingAdellijkeTitel:
        persoon.naam.adellijkeTitelPredicaat.omschrijving,
      opgemaakteNaam: persoon.naam.volledigeNaam ?? null,
      voornamen: persoon.naam.voornamen ?? null,
      nationaliteiten: persoon.nationaliteiten.map((n) => ({
        omschrijving: n.nationaliteit.omschrijving,
      })),
      mokum: persoon.gemeenteVanInschrijving?.code === ZORGNED_GEMEENTE_CODE,
      vertrokkenOnbekendWaarheen: false, // TODO: refine
      datumVertrekUitNederland:
        persoon.verblijfplaats.verblijfadres?.land?.code &&
        persoon.verblijfplaats.verblijfadres.land.code !== '6030'
          ? persoon.verblijfplaats.datumVan.langFormaat
          : null,
      indicatieGeheim: !!persoon.geheimhoudingPersoonsgegevens, // TODO: refine
      adresInOnderzoek,
    },
    ouders: persoon.ouders.map((ouder) => ({
      geboortedatum: ouder.geboorte.datum.langFormaat ?? null,
      overlijdensdatum: ouder.overlijden?.datum.langFormaat ?? null,
      volledigeNaam: ouder.naam.volledigeNaam ?? null,
    })),
    kinderen: persoon.kinderen.map((kind) => ({
      geboortedatum: kind.geboorte.datum.langFormaat ?? null,
      volledigeNaam: kind.naam.volledigeNaam ?? null,
    })),
    adres: {
      straatnaam: persoon.verblijfplaats.verblijfadres.korteStraatnaam ?? null,
      postcode: persoon.verblijfplaats.verblijfadres.postcode ?? null,
      woonplaatsNaam: persoon.verblijfplaats.verblijfadres.woonplaats ?? null,
      landnaam: persoon.verblijfplaats.verblijfadres.land?.omschrijving ?? null,
      huisnummer: persoon.verblijfplaats.verblijfadres.huisnummer ?? null,
      huisnummertoevoeging:
        persoon.verblijfplaats.verblijfadres.huisnummertoevoeging ?? null,
      huisletter: persoon.verblijfplaats.verblijfadres.huisletter ?? null,
      begindatumVerblijf: persoon.verblijfplaats.datumVan.langFormaat,
      adresType: 'correspondentie', // TODO: refine
      mokum: persoon.gemeenteVanInschrijving?.code === ZORGNED_GEMEENTE_CODE,
    },
  };

  return b;
}

export async function fetchBrpByBsn(bsn: BSN[]) {
  const response = await fetchBenkBrpTokenHeader();
  if (response.status !== 'OK') {
    return response;
  }
  const requestConfig = getApiConfig('BENK_BRP', {
    formatUrl(requestConfig) {
      return `${requestConfig.url}/personen`;
    },
    headers: response.content,
    data: {
      type: 'RaadpleegMetBurgerservicenummer',
      gemeenteVanInschrijving: ZORGNED_GEMEENTE_CODE,
      burgerservicenummer: bsn,
    },
    transformResponse: transformBenkBrpResponse,
  });

  return requestData(requestConfig);
}
