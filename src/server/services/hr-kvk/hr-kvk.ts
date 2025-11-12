import { MACExpandScopes } from './hr-kvk-service-config';
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
  VestigingenResponseSource,
} from './hr-kvk.types';
import { IS_DEVELOPMENT } from '../../../universal/config/env';
import {
  apiErrorResult,
  apiSuccessResult,
  getFailedDependencies,
  getSettledResult,
  type ApiResponse,
} from '../../../universal/helpers/api';
import { defaultDateFormat } from '../../../universal/helpers/date';
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
      clientID: getFromEnv('BFF_DATAPUNT_IAM_CLIENT_ID') ?? '',
      clientSecret: getFromEnv('BFF_DATAPUNT_IAM_CLIENT_SECRET') ?? '',
    }
  );
}

type FetchOptions<T, T2> = {
  endpoint: string;
  params?: Record<string, string>;
  transformResponse?: (data: T, ...rest: any[]) => T2;
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

function normalizeDate(
  prefix: string,
  date: Record<string, number | string | null>
): DatumNormalizedSource {
  return Object.fromEntries(
    Object.entries(date).map(([key, value]) => {
      return [
        key.replace(prefix, '').toLowerCase(),
        value ? value.toString() : null,
      ];
    })
  ) as DatumNormalizedSource;
}

function getDate(
  prefix: string,
  date: Record<string, number | string | null> | null
): string | null {
  if (!date) {
    return null;
  }

  const datex = normalizeDate(prefix, date);
  const { jaar, maand, dag, datum } = datex;

  if (datum) {
    return datum;
  }

  if (!jaar || !maand || !dag) {
    return null;
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
    typePersoon: natuurlijkPersoonSource.typePersoon,
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
    typePersoon: nietNatuurlijkPersoonSource.typePersoon,
  };

  return rechtspersoon;
}

function transformMAC(MACResponseData: MACResponseSource): MACResponse {
  const [MAC] = MACResponseData._embedded.maatschappelijkeactiviteiten ?? [];
  const [eigenaarNNP] = MACResponseData._embedded.heeftAlsEigenaarHrNnp ?? [];
  const [eigenaarNPS] = MACResponseData._embedded.heeftAlsEigenaarHrNps ?? [];

  if (!MAC) {
    return {
      onderneming: null,
      eigenaar: null,
    };
  }

  const [hoofdactiviteit, ...overigeActiviteiten] = MAC.activiteiten
    .toSorted((a) => (a.isHoofdactiviteit ? 1 : -1))
    .map((a) => a.omschrijving);
  const handelsnamen = MAC.handelsnamen.map((hn) => hn.handelsnaam);
  const rechtsvorm = (eigenaarNNP ?? eigenaarNPS)?.rechtsvorm ?? 'Onbekend';

  let eigenaar: NatuurlijkPersoon | NietNatuurlijkPersoon | null = null;

  if (eigenaarNNP) {
    eigenaar = getRechtspersoon(eigenaarNNP);
  } else if (eigenaarNPS) {
    eigenaar = getEigenaar(eigenaarNPS);
  }

  const datumEinde = getDate(
    'datumEindeMaatschappelijkeActiviteit',
    MAC.datumEindeMaatschappelijkeActiviteit
  );

  const datumAanvang = getDate(
    'datumAanvangMaatschappelijkeActiviteit',
    MAC.datumAanvangMaatschappelijkeActiviteit
  );

  return {
    onderneming: {
      handelsnaam: MAC.naam, // TODO: verify of we dit wel nodig hebben
      handelsnamen,
      rechtsvorm,
      hoofdactiviteit,
      overigeActiviteiten: overigeActiviteiten ?? [],
      datumAanvang: normalizeDate(
        'datumAanvangMaatschappelijkeActiviteit',
        MAC.datumAanvangMaatschappelijkeActiviteit || {}
      ),
      datumAanvangFormatted: datumAanvang
        ? defaultDateFormat(datumAanvang)
        : null,
      datumEinde: normalizeDate(
        'datumEindeMaatschappelijkeActiviteit',
        MAC.datumEindeMaatschappelijkeActiviteit || {}
      ),
      datumEindeFormatted: datumEinde ? defaultDateFormat(datumEinde) : null,
      kvknummer: MAC.kvknummer,
    },
    eigenaar,
  };
}

async function fetchMAC(
  authProfileAndToken: AuthProfileAndToken
): Promise<ApiResponse<MACResponse>> {
  const params = {
    kvknummer: authProfileAndToken.profile.id,
    _expandScope: MACExpandScopes.join(','),
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
  const datumAanvang = getDate('datumAanvang', datumAanvangSource);

  const datumEindeSource = {
    datumEindeDatum: vestigingSource.datumEindeDatum,
    datumEindeJaar: vestigingSource.datumEindeJaar,
    datumEindeMaand: vestigingSource.datumEindeMaand,
    datumEindeDag: vestigingSource.datumEindeDag,
  };
  const datumEinde = getDate('datumEinde', datumEindeSource);

  const vestiging: Vestiging = {
    naam: vestigingSource.naam || vestigingSource.eersteHandelsnaam || null,
    vestigingsNummer: vestigingSource.vestigingsnummer,
    // TODO: Wat is voortzetting datum?
    datumAanvang: normalizeDate('datumAanvang', datumAanvangSource),
    datumAanvangFormatted: datumAanvang
      ? defaultDateFormat(datumAanvang)
      : null,
    datumEinde: normalizeDate('datumEinde', datumEindeSource),
    datumEindeFormatted: datumEinde ? defaultDateFormat(datumEinde) : null,
    handelsnamen: vestigingSource.handelsnamen.map(
      (hn) => hn.handelsnaam ?? ''
    ),
    isHoofdvestiging: vestigingSource.hoofdvestiging === 'Ja',
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
      .filter((e) => e !== null) as string[],
    activiteiten: vestigingSource.activiteiten
      .map((act) => act.omschrijving)
      .filter((act) => act !== null),
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
  responseData: VestigingenResponseSource
): Vestiging[] {
  //
  return (
    responseData._embedded.vestigingen
      ?.toSorted((a) => (a.hoofdvestiging === 'Ja' ? -1 : 1))
      .map((vestiging) => transformVestiging(vestiging)) ?? []
  );
}

async function fetchVestigingen(
  authProfileAndToken: AuthProfileAndToken
): Promise<ApiResponse<Vestiging[]>> {
  const params = {
    'isEenUitoefeningVanHrMac.kvknummer': authProfileAndToken.profile.id,
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
