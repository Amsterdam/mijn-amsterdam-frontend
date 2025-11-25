import {
  normalizeDatePropertyNames,
  getFullDate,
  getPartialDateFormatted,
} from './hr-kvk-helpers';
import type {
  NatuurlijkPersoon,
  KvkResponseFrontend,
  MACResponse,
  MACResponseSource,
  NatuurlijkPersoonSource,
  NietNatuurlijkPersoonSource,
  NietNatuurlijkPersoon,
  Vestiging,
  VestigingSource,
  VestigingenResponseSource,
  KVKNummer,
} from './hr-kvk.types';
import { IS_DEVELOPMENT, IS_PRODUCTION } from '../../../universal/config/env';
import {
  apiErrorResult,
  apiSuccessResult,
  getFailedDependencies,
  getSettledResult,
  type ApiResponse,
} from '../../../universal/helpers/api';
import { sortByNumber } from '../../../universal/helpers/utils';
import type { AuthProfileAndToken } from '../../auth/auth-types';
import { ONE_HOUR_MS } from '../../config/app';
import { getFromEnv } from '../../helpers/env';
import { getApiConfig } from '../../helpers/source-api-helpers';
import { requestData } from '../../helpers/source-api-request';
import { isAmsterdamAddress } from '../buurt/helpers';
import { fetchAuthTokenHeader } from '../iam-oauth/oauth-token';

const TOKEN_VALIDITY_PERIOD = 1 * ONE_HOUR_MS;
const PERCENTAGE_DISTANCE_FROM_EXPIRY = 0.1;

function translateKVKNummer(kvknummer: KVKNummer): KVKNummer {
  const translations = getFromEnv('BFF_HR_KVK_KVKNUMMER_TRANSLATIONS', false);
  // IS_PRODUCTION is explicitly set to exclude this code from being used in this environment.
  if (!translations || IS_PRODUCTION) {
    return kvknummer;
  }

  const translationsMap = new Map(
    translations.split(',').map((pair) => pair.split('=')) as Iterable<
      [string, string]
    >
  );

  return translationsMap.get(kvknummer) ?? kvknummer;
}

function fetchTokenHeader() {
  return fetchAuthTokenHeader(
    'IAM_DATAPUNT',
    {
      sourceApiName: 'HR_KVK',
      tokenValidityMS:
        TOKEN_VALIDITY_PERIOD * (1 - PERCENTAGE_DISTANCE_FROM_EXPIRY),
    },
    {
      clientID: getFromEnv('BFF_DATAPUNT_IAM_CLIENT_ID') ?? '',
      clientSecret: getFromEnv('BFF_DATAPUNT_IAM_CLIENT_SECRET') ?? '',
    }
  );
}

type FetchOptions<T, T2> = {
  endpoint: string;
  params?: Record<string, string>;
  transformResponse?: (data: T, ...rest: unknown[]) => T2;
  profileType: ProfileType;
};

async function fetchHrKvk<T, T2>(
  options: FetchOptions<T, T2>
): Promise<ApiResponse<T2>> {
  const tokenHeader = await fetchTokenHeader();
  const apiConfig = getApiConfig('HR_KVK', {
    headers: {
      ...(tokenHeader.status === 'OK' ? tokenHeader.content : {}),
      ...(IS_DEVELOPMENT
        ? { 'x-cache-key-supplement': options.profileType }
        : {}),
    },
    formatUrl(requestConfig) {
      return `${requestConfig.url}${options.endpoint}`;
    },
    params: options.params,
    transformResponse: options.transformResponse,
  });

  return requestData<T2>(apiConfig);
}

export async function fetchNatuurlijkpersoon(
  authProfileAndToken: AuthProfileAndToken
): Promise<ApiResponse<NatuurlijkPersoonSource>> {
  const params = {
    bsn: authProfileAndToken.profile.id,
  };

  return fetchHrKvk({
    endpoint: `/natuurlijkepersonen`,
    params,
    profileType: authProfileAndToken.profile.profileType,
  });
}

function getEigenaarNPS(
  natuurlijkPersoonSource: NatuurlijkPersoonSource
): NatuurlijkPersoon {
  const eigenaar: NatuurlijkPersoon = {
    naam: natuurlijkPersoonSource.volledigeNaam,
    typePersoon: natuurlijkPersoonSource.typePersoon,
  };

  return eigenaar;
}

function getRechtspersoonNNP(
  nietNatuurlijkPersoonSource: NietNatuurlijkPersoonSource
): NietNatuurlijkPersoon {
  const rechtspersoon: NietNatuurlijkPersoon = {
    rsin: nietNatuurlijkPersoonSource.rsin,
    naam: nietNatuurlijkPersoonSource.naam,
    rechtsvorm:
      nietNatuurlijkPersoonSource?.uitgebreideRechtsvorm ||
      nietNatuurlijkPersoonSource?.rechtsvorm ||
      'Onbekend',
    typePersoon: nietNatuurlijkPersoonSource.typePersoon,
  };

  return rechtspersoon;
}

function transformMAC(MACResponseData: MACResponseSource): MACResponse {
  const [MAC] = MACResponseData._embedded?.maatschappelijkeactiviteiten ?? [];
  const [eigenaarNNP] = MACResponseData._embedded?.heeftAlsEigenaarHrNnp ?? [];
  const [eigenaarNPS] = MACResponseData._embedded?.heeftAlsEigenaarHrNps ?? [];

  if (!MAC) {
    return {
      onderneming: null,
      eigenaar: null,
    };
  }

  const [hoofdactiviteit, ...overigeActiviteiten] = MAC.activiteiten
    .toSorted((a) => (a.isHoofdactiviteit ? 1 : -1))
    .map((a) => a.omschrijving);
  const handelsnamen = MAC.handelsnamen
    .toSorted(sortByNumber('volgorde', 'asc'))
    .map((hn) => hn.handelsnaam);

  let eigenaar: NatuurlijkPersoon | NietNatuurlijkPersoon | null = null;

  if (eigenaarNNP) {
    eigenaar = getRechtspersoonNNP(eigenaarNNP);
  } else if (eigenaarNPS) {
    eigenaar = getEigenaarNPS(eigenaarNPS);
  }

  const datumEinde = normalizeDatePropertyNames(
    'datumEindeMaatschappelijkeActiviteit',
    MAC.datumEindeMaatschappelijkeActiviteit
  );

  const datumAanvang = normalizeDatePropertyNames(
    'datumAanvangMaatschappelijkeActiviteit',
    MAC.datumAanvangMaatschappelijkeActiviteit
  );

  return {
    onderneming: {
      handelsnaam: MAC.naam,
      handelsnamen,
      hoofdactiviteit,
      overigeActiviteiten: overigeActiviteiten ?? [],
      // We use normalieDate here to be able to show a partial date in the UI.
      // A date can be only a year or year+month.
      datumAanvang: getFullDate(datumAanvang),
      datumAanvangFormatted: getPartialDateFormatted(datumAanvang),
      datumEinde: getFullDate(datumEinde),
      datumEindeFormatted: getPartialDateFormatted(datumEinde),
      kvknummer: MAC.kvknummer,
    },
    eigenaar,
  };
}

async function fetchMAC(
  authProfileAndToken: AuthProfileAndToken
): Promise<ApiResponse<MACResponse>> {
  const params: Record<string, string> =
    authProfileAndToken.profile.profileType === 'private'
      ? {
          'heeftAlsEigenaarHrNps.bsn': authProfileAndToken.profile.id,
          _expandScope: 'heeftAlsEigenaarHrNps',
        }
      : {
          kvknummer: translateKVKNummer(authProfileAndToken.profile.id),
          _expandScope: 'heeftAlsEigenaarHrNnp',
        };

  const macResponse = await fetchHrKvk<MACResponseSource, MACResponse>({
    endpoint: '/maatschappelijkeactiviteiten',
    params,
    transformResponse: transformMAC,
    profileType: authProfileAndToken.profile.profileType,
  });

  if (macResponse.status !== 'OK' || !macResponse.content) {
    return apiErrorResult('Failed to fetch onderneming data', null);
  }

  return macResponse;
}

function getCommunicatie(
  communicatie: VestigingSource['communicatie'],
  soort: 'telefoonnummer' | 'faxnummer'
): string[] {
  return (communicatie
    ?.filter((comm) => comm.soort === soort && !!comm.nummer)
    .map((comm) => comm.nummer?.toString()) ?? []) as string[];
}

function transformVestiging(vestigingSource: VestigingSource): Vestiging {
  const datumAanvangSource = {
    datumAanvangDatum: vestigingSource.datumAanvangDatum,
    datumAanvangJaar: vestigingSource.datumAanvangJaar,
    datumAanvangMaand: vestigingSource.datumAanvangMaand,
    datumAanvangDag: vestigingSource.datumAanvangDag,
  };
  const datumAanvang = normalizeDatePropertyNames(
    'datumAanvang',
    datumAanvangSource
  );

  const datumEindeSource = {
    datumEindeDatum: vestigingSource.datumEindeDatum,
    datumEindeJaar: vestigingSource.datumEindeJaar,
    datumEindeMaand: vestigingSource.datumEindeMaand,
    datumEindeDag: vestigingSource.datumEindeDag,
  };
  const datumEinde = normalizeDatePropertyNames('datumEinde', datumEindeSource);

  const vestiging: Vestiging = {
    naam: vestigingSource.naam || vestigingSource.eersteHandelsnaam || null,
    vestigingsNummer: vestigingSource.vestigingsnummer,
    datumAanvang: getFullDate(datumAanvang),
    datumAanvangFormatted: getPartialDateFormatted(datumAanvang),
    datumEinde: getFullDate(datumEinde),
    datumEindeFormatted: getPartialDateFormatted(datumEinde),
    handelsnamen:
      vestigingSource.handelsnamen?.map((hn) => hn.handelsnaam ?? '') ?? [],
    isHoofdvestiging: vestigingSource.hoofdvestiging === 'Ja',
    bezoekadres: vestigingSource.bezoekLocatieVolledigAdres || null,
    postadres: vestigingSource.postLocatieVolledigAdres || null,
    telefoonnummer: getCommunicatie(
      vestigingSource.communicatie,
      'telefoonnummer'
    ),
    websites:
      vestigingSource.domeinnamen
        ?.map((domein) => domein.domeinnaam)
        .filter((domein) => domein !== null) ?? [],
    faxnummer: getCommunicatie(vestigingSource.communicatie, 'faxnummer'),
    emailadres: (vestigingSource.emailAdressen
      ?.map((e) => e.emailAdres)
      .filter((e) => e !== null) ?? []) as string[],
    activiteiten:
      vestigingSource.activiteiten
        ?.map((act) => act.omschrijving)
        .filter((act) => act !== null) ?? [],
    postHeeftBagNummeraanduidingId:
      vestigingSource.postHeeftBagNummeraanduidingId,
    postHeeftBagLigplaatsId: vestigingSource.postHeeftBagLigplaatsId,
    postHeeftBagStandplaatsId: vestigingSource.postHeeftBagStandplaatsId,
    bezoekHeeftBagNummeraanduidingId:
      vestigingSource.bezoekHeeftBagNummeraanduidingId,
    bezoekHeeftBagLigplaatsId: vestigingSource.bezoekHeeftBagLigplaatsId,
    bezoekHeeftBagStandplaatsId: vestigingSource.bezoekHeeftBagStandplaatsId,
  };

  return vestiging;
}

function transformVestigingen(
  responseData: VestigingenResponseSource | null
): Vestiging[] {
  return (
    responseData?._embedded?.vestigingen
      ?.toSorted((a, b) =>
        a.hoofdvestiging === 'Ja' ? -1 : b.hoofdvestiging === 'Ja' ? 1 : 0
      )
      .map((vestiging) => transformVestiging(vestiging)) ?? []
  );
}

async function fetchVestigingen(
  authProfileAndToken: AuthProfileAndToken
): Promise<ApiResponse<Vestiging[]>> {
  const params = {
    'isEenUitoefeningVanHrMac.kvknummer': translateKVKNummer(
      authProfileAndToken.profile.id
    ),
    _pageSize: '500', // Large page size to avoid pagination
  };

  const vestigingenResponse = await fetchHrKvk<
    VestigingenResponseSource,
    Vestiging[]
  >({
    endpoint: '/vestigingen',
    params,
    transformResponse: transformVestigingen,
    profileType: authProfileAndToken.profile.profileType,
  });

  return vestigingenResponse;
}

export async function fetchKVK(
  authProfileAndToken: AuthProfileAndToken
): Promise<ApiResponse<KvkResponseFrontend>> {
  const MACRequest = fetchMAC(authProfileAndToken);
  const vestigingenRequest = fetchVestigingen(authProfileAndToken);
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

  const kvkTranslation = {
    from: authProfileAndToken.profile.id,
    to: translateKVKNummer(authProfileAndToken.profile.id),
  };

  if (!IS_PRODUCTION && kvkTranslation.from !== kvkTranslation.to) {
    KvkResponseFrontend.kvkTranslation = kvkTranslation;
  }

  return apiSuccessResult(
    KvkResponseFrontend,
    getFailedDependencies({
      onderneming: MACResult,
      vestigingen: vestigingResult,
    })
  );
}

export const forTesting = {
  translateKVKNummer,
  fetchTokenHeader,
  normalizeDate: normalizeDatePropertyNames,
  getDate: getFullDate,
  getEigenaar: getEigenaarNPS,
  getRechtspersoon: getRechtspersoonNNP,
  transformMAC,
  getCommunicatie,
  transformVestiging,
  transformVestigingen,
};
