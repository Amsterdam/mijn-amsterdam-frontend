import { requestData } from '../helpers';
import { getApiConfig } from '../config';

export interface Adres {
  straatnaam: string;
  postcode: string;
  woonplaatsnaam: string;
  huisnummer: string;
  huisnummertoevoeging: string | null;
  huisletter: string | null;
}

type Rechtsvorm = string;

export interface Onderneming {
  handelsnaam: string;
  overigeHandelsnamen: string[];
  rechtsvorm: Rechtsvorm;
  hoofdactiviteit: string;
  overigeActiviteiten: string[];
  datumAanvang: string;
  datumEinde: string | null;
  aantalWerkzamePersonen: number;
}

export interface Rechtspersoon {
  rsin: string;
  kvkNummer: string;
  statutaireNaam: string;
  statutaireVestigingsplaats: string;
}

export interface Aandeelhouder {
  opgemaakteNaam: string;
  geboortedatum: string;
  bevoegdheid: string;
}

export interface Bestuurder {
  opgemaakteNaam: string;
  geboortedatum: string;
  functietitel: string;
  bevoegdheid: string;
}

export interface Vestiging {
  vestigingsnummer: string;
  handelsnaam: string;
  isHoofdvestiging: boolean;
  aantalWerkzamePersonen: string | null;
  bezoekadres: Adres | null;
  postadres: Adres | null;
  telefoonnummer: string | null;
  websites: string[] | null;
  fax: string | null;
  email: string | null;
  activiteiten: string;
  datumAanvang: string | null;
  datumEinde: string | null;
}

export interface KVKSourceDataContent {
  mokum: boolean;
  onderneming: Onderneming;
  rechtspersonen: Rechtspersoon[];
  vestigingen: Vestiging[];
  aandeelhouders: Aandeelhouder[];
  bestuurders: Bestuurder[];
}

export interface KVKSourceData {
  content: KVKSourceDataContent;
}

export interface KVKData extends KVKSourceDataContent {}

export function transformKVKData(responseData: KVKSourceData): KVKData {
  return responseData.content;
}

const SERVICE_NAME = 'KVK'; // Change to your service name

export function fetchKVK(
  sessionID: SessionID,
  passthroughRequestHeaders: Record<string, string>,
  kvkNummer?: string
) {
  return requestData<KVKData>(
    getApiConfig(SERVICE_NAME, {
      transformResponse: transformKVKData,
    }),
    sessionID,
    passthroughRequestHeaders
  );
}
