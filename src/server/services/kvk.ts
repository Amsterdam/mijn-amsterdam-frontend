import { requestData } from '../helpers';
import { getApiConfig } from '../config';
import { FeatureToggle } from '../../universal/config/app';
import { apiSuccesResult } from '../../universal/helpers/api';
import { Adres } from '../../universal/types';

type Rechtsvorm = string;

export interface Onderneming {
  handelsnaam: string | null;
  handelsnamen: string[] | null;
  rechtsvorm: Rechtsvorm;
  hoofdactiviteit: string;
  overigeActiviteiten: string[] | null;
  datumAanvang: string;
  datumEinde: string | null;
}

export interface Rechtspersoon {
  rsin?: string;
  bsn?: string;
  kvkNummer: string;
  statutaireNaam: string;
  statutaireZetel: string;
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
  vestigingsNummer: string;
  handelsnamen: string[];
  typeringVestiging: string;
  isHoofdvestiging: boolean;
  bezoekadres: Adres | null;
  postadres: Adres | null;
  telefoonnummer: string | null;
  websites: string[] | null;
  fax: string | null;
  emailadres: string | null;
  activiteiten: string[];
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
  hoofdAdres: Adres | null; // eerste bezoekadres of postadres in lijst met vestigingen
}

export interface KVKSourceData {
  content: KVKSourceDataContent;
}

export interface KVKData extends KVKSourceDataContent {}

export function transformKVKData(responseData: KVKSourceData): KVKData | null {
  if (
    typeof responseData.content !== 'object' ||
    Array.isArray(responseData.content) ||
    responseData.content === null
  ) {
    return null;
  }
  if (responseData.content.onderneming?.handelsnamen) {
    responseData.content.onderneming.handelsnaam =
      responseData.content.onderneming?.handelsnamen.pop() || null;
  }
  if (responseData.content.vestigingen) {
    responseData.content.vestigingen = responseData.content.vestigingen.map(
      vestiging => {
        return Object.assign(vestiging, {
          isHoofdvestiging: vestiging.typeringVestiging === 'Hoofdvestiging',
        });
      }
    );
    responseData.content.hoofdAdres = null;
    if (responseData.content.vestigingen.length) {
      const eersteVestigingMetAdres = responseData.content.vestigingen.find(
        vestiging => !!(vestiging.bezoekadres || vestiging.postadres)
      );
      if (typeof eersteVestigingMetAdres !== 'undefined') {
        responseData.content.hoofdAdres =
          eersteVestigingMetAdres.bezoekadres ||
          eersteVestigingMetAdres.postadres;
      }
    }
  }
  return responseData.content;
}

const SERVICE_NAME = 'KVK'; // Change to your service name

export async function fetchKVK(
  sessionID: SessionID,
  passthroughRequestHeaders: Record<string, string>
) {
  if (FeatureToggle.kvkActive) {
    return requestData<KVKData>(
      getApiConfig(SERVICE_NAME, {
        transformResponse: transformKVKData,
      }),
      sessionID,
      passthroughRequestHeaders
    );
  }
  return apiSuccesResult(null);
}
