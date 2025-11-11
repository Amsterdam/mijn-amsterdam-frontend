import type {
  DatumNormalizedSource,
  NatuurlijkPersoon,
  KvkResponseFrontend,
  MACResponse,
  MACResponseSource,
  NatuurlijkPersoonSource,
  NietNatuurlijkPersoonSource,
  NietNatuurlijkPersoon,
  Vestiging,
  VestigingSource,
} from './hr-kvk.types';
import {
  apiErrorResult,
  apiSuccessResult,
  getFailedDependencies,
  getSettledResult,
  type ApiResponse,
} from '../../../universal/helpers/api';
import type { AuthProfileAndToken } from '../../auth/auth-types';
import { ONE_HOUR_MS } from '../../config/app';
import { getFromEnv } from '../../helpers/env';
import { getApiConfig } from '../../helpers/source-api-helpers';
import { requestData } from '../../helpers/source-api-request';
import { isAmsterdamAddress } from '../buurt/helpers';
import { fetchAuthTokenHeader } from '../iam-oauth/oauth-token';

const TOKEN_VALIDITY_PERIOD = 1 * ONE_HOUR_MS;
const PERCENTAGE_DISTANCE_FROM_EXPIRY = 0.1;

function fetchTokenHeader() {
  return fetchAuthTokenHeader(
    'IAM_DATAPUNT',
    {
      sourceApiName: 'HR_KVK',
      tokenValidityMS:
        TOKEN_VALIDITY_PERIOD * (1 - PERCENTAGE_DISTANCE_FROM_EXPIRY),
    },
    {
      clientID: getFromEnv('BFF_DATAPUNT_CLIENT_ID') ?? '',
      clientSecret: getFromEnv('BFF_DATAPUNT_CLIENT_SECRET') ?? '',
    }
  );
}

async function fetchHrKvk<T, T2>(options: {
  endpoint: string;
  params?: Record<string, string>;
  transformResponse?: (data: T) => T2;
}): Promise<ApiResponse<T2>> {
  const tokenHeader = await fetchTokenHeader();
  const apiConfig = getApiConfig('HR_KVK', {
    headers: tokenHeader.status === 'OK' ? tokenHeader.content : {},
    formatUrl(requestConfig) {
      return `${requestConfig.url}${options.endpoint}`;
    },
    params: options.params,
  });

  return requestData<T2>(apiConfig);
}

export async function fetchByBSN(bsn: string) {
  const params = {
    bsn,
  };

  return fetchHrKvk({ endpoint: `/natuurlijkepersonen`, params });
}

function normalizeDate(
  prefix: string,
  date: Record<string, number | string | null>
): DatumNormalizedSource {
  return Object.fromEntries(
    Object.entries(date).map(([key, value]) => {
      return [key.replace(prefix, ''), value?.toString() ?? ''];
    })
  ) as DatumNormalizedSource;
}

function getDate(
  prefix: string,
  date: Record<string, number | string | null>
): string {
  const { jaar, maand, dag, datum } = normalizeDate(prefix, date);

  if (datum) {
    return datum;
  }

  if (!jaar) {
    return '';
  }

  const monthPadded = maand ? maand.padStart(2, '0') : '01';
  const dayPadded = dag ? dag.padStart(2, '0') : '01';

  return `${jaar}-${monthPadded}-${dayPadded}`;
}

function getEigenaar(
  natuurlijkPersoonSource: NatuurlijkPersoonSource
): NatuurlijkPersoon {
  const eigenaar: NatuurlijkPersoon = {
    naam: natuurlijkPersoonSource.volledigeNaam,
    geboortedatum: 'MOETEN WE DIT WEL TONEN?',
  };

  return eigenaar;
}

function getRechtspersoon(
  nietNatuurlijkPersoonSource: NietNatuurlijkPersoonSource
): NietNatuurlijkPersoon {
  const rechtspersoon: NietNatuurlijkPersoon = {
    rsin: nietNatuurlijkPersoonSource.rsin,
    naam: nietNatuurlijkPersoonSource.naam,
    statutaireZetel: '', // TODO: Wat is dit?
  };

  return rechtspersoon;
}

function transformMAC(MACResponseData: MACResponseSource): MACResponse {
  const [MAC] = MACResponseData._embedded.maatschappelijkeactiviteiten;
  const [eigenaarNNP] = MACResponseData._embedded.heeftAlsEigenaarHrNnp;
  const [eigenaarNPS] = MACResponseData._embedded.heeftAlsEigenaarHrNps;

  const [hoofdactiviteit, ...overigeActiviteiten] = MAC.activiteiten
    .toSorted((a) => (a.isHoofdactiviteit ? 1 : -1))
    .map((a) => a.omschrijving);
  const handelsnamen = MAC.handelsnamen.map((hn) => hn.handelsnaam);
  const rechtsvorm = (eigenaarNNP ?? eigenaarNPS)?.rechtsvorm;

  return {
    onderneming: {
      handelsnaam: MAC.naam, // TODO: verify of we dit wel nodig hebben
      handelsnamen,
      rechtsvorm,
      hoofdactiviteit,
      overigeActiviteiten: overigeActiviteiten ?? [],
      datumAanvang: getDate(
        'datumAanvangMaatschappelijkeActiviteit',
        MAC.datumAanvangMaatschappelijkeActiviteit
      ),
      datumEinde: getDate(
        'datumEindeMaatschappelijkeActiviteit',
        MAC.datumEindeMaatschappelijkeActiviteit
      ),
      kvknummer: MAC.kvknummer,
    },
    eigenaar:
      rechtsvorm === 'Eenmanszaak'
        ? getEigenaar(eigenaarNPS)
        : getRechtspersoon(eigenaarNNP),
  };
}

async function fetchMACByKVK(
  kvknummer: string
): Promise<ApiResponse<MACResponse>> {
  const params = {
    kvknummer: kvknummer,
    _expandScope: 'heeftAlsEigenaarHrNnp,heeftAlsEigenaarHrNps',
  };

  const macResponse = await fetchHrKvk<MACResponseSource, MACResponse>({
    endpoint: '/maatschappelijkeactiviteiten',
    params,
    transformResponse: transformMAC,
  });

  if (macResponse.status !== 'OK' || !macResponse.content) {
    return apiErrorResult('Failed to fetch onderneming data', null);
  }

  return macResponse;
}

function getCommunicatie(
  communicatie: VestigingSource['communicatie'],
  soort: 'telefoonnummer' | 'faxnummer'
): string | null {
  return communicatie
    ?.filter((comm) => comm.soort === soort && !!comm.nummer)
    .map((comm) => comm.nummer)
    .join(',');
}

function transformVestiging(vestigingSource: VestigingSource): Vestiging {
  const vestiging: Vestiging = {
    eersteHandelsnaam: vestigingSource.eersteHandelsnaam || null,
    vestigingsNummer: vestigingSource.vestigingsnummer,
    // TODO: Wat is voortzetting datum?
    datumAanvang: getDate('', {
      datumAanvangDatum: vestigingSource.datumAanvangDatum,
      datumAanvangJaar: vestigingSource.datumAanvangJaar,
      datumAanvangMaand: vestigingSource.datumAanvangMaand,
      datumAanvangDag: vestigingSource.datumAanvangDag,
    }),
    datumEinde: getDate('', {
      datumEindeDatum: vestigingSource.datumEindeDatum,
      datumEindeJaar: vestigingSource.datumEindeJaar,
      datumEindeMaand: vestigingSource.datumEindeMaand,
      datumEindeDag: vestigingSource.datumEindeDag,
    }),
    handelsnamen: vestigingSource.handelsnamen.map(
      (hn) => hn.handelsnaam ?? ''
    ),
    typeringVestiging:
      vestigingSource.hoofdvestiging === 'Ja' ? 'Hoofdvestiging' : '',
    bezoekadres: vestigingSource.bezoekLocatieVolledigAdres || null,
    postadres: vestigingSource.postLocatieVolledigAdres || null,
    telefoonnummer: getCommunicatie(
      vestigingSource.communicatie,
      'telefoonnummer'
    ),
    websites: vestigingSource.domeinnamen
      .map((domein) => domein.domeinnaam)
      .filter((domein) => domein !== null),
    faxnummer: getCommunicatie(vestigingSource.communicatie, 'faxnummer'),
    emailadres: vestigingSource.emailAdressen
      .map((e) => e.emailAdres)
      .join(','),
    activiteiten: vestigingSource.activiteiten
      .map((act) => act.omschrijving)
      .filter((act) => act !== null),
  };

  return vestiging;
}

function transformVestigingen(responseData: VestigingSource[]): Vestiging[] {
  return responseData.map((vestiging) => transformVestiging(vestiging));
}

async function fetchVestigingenByKVK(
  kvknummer: string
): Promise<ApiResponse<Vestiging[]>> {
  const params = {
    'isEenUitoefeningVanHrMac.kvknummer': kvknummer,
  };

  const vestigingenResponse = await fetchHrKvk<VestigingSource[], Vestiging[]>({
    endpoint: '/vestigingen',
    params,
    transformResponse: transformVestigingen,
  });

  return vestigingenResponse;
}

export async function fetchKVK(
  authProfileAndToken: AuthProfileAndToken
): Promise<ApiResponse<KvkResponseFrontend>> {
  const kvknummer = authProfileAndToken.profile.id;
  const MACRequest = fetchMACByKVK(kvknummer);
  const vestigingenRequest = fetchVestigingenByKVK(kvknummer);
  const [vestigingenResponse, MACResponse] = await Promise.allSettled([
    vestigingenRequest,
    MACRequest,
  ]);

  const vestigingResult = getSettledResult(vestigingenResponse);
  const MACResult = getSettledResult(MACResponse);

  if (vestigingResult.status !== 'OK' && MACResult.status !== 'OK') {
    return apiErrorResult('Failed to fetch KVK data', null);
  }

  const vestigingen = vestigingResult.content ?? [];

  const KvkResponseFrontend: KvkResponseFrontend = {
    onderneming: MACResult.content?.onderneming ?? null,
    vestigingen,
    mokum: vestigingen.some(
      (v) =>
        (typeof v.bezoekadres === 'string' &&
          isAmsterdamAddress(v.bezoekadres)) ||
        (typeof v.postadres === 'string' && isAmsterdamAddress(v.postadres))
    ),
    eigenaar: MACResult.content?.eigenaar ?? null,
  };

  return apiSuccessResult(
    KvkResponseFrontend,
    getFailedDependencies({
      onderneming: MACResult,
      vestigingen: vestigingResult,
    })
  );
}

export async function fetchAantalBewoners(
  bagNummeraanduidingId: string
): Promise<ApiResponse<number>> {
  return apiSuccessResult<number>(0);
}
