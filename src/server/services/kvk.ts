import { FeatureToggle } from '../../universal/config/app';
import { apiSuccesResult } from '../../universal/helpers/api';
import { Adres } from '../../universal/types';
import { getApiConfig } from '../config';
import { requestData } from '../helpers';

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
  bezoekadres: Adres | null;
  postadres: Adres | null;
  telefoonnummer: string | null;
  websites: string[] | null;
  faxnummer: string | null;
  emailadres: string | null;
  activiteiten: string[];
  datumAanvang: string | null;
  datumEinde: string | null;
  isHoofdvestiging?: boolean;
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

export function getKvkAddress(kvkData: KVKData) {
  let address: Adres | null = null;
  const vestigingen = kvkData?.vestigingen;

  if (!vestigingen?.length) {
    return null;
  }

  if (vestigingen.length) {
    const vestiging = kvkData?.vestigingen.find(
      (vestiging) =>
        !!vestiging.bezoekadres &&
        (vestiging.bezoekadres.mokum === true ||
          vestiging.bezoekadres.woonplaatsNaam === 'Amsterdam')
    );
    address = vestiging?.bezoekadres || null;

    if (!address) {
      const vestiging = kvkData?.vestigingen.find(
        (vestiging) =>
          !!vestiging.postadres &&
          (vestiging.postadres.mokum === true ||
            vestiging.postadres.woonplaatsNaam === 'Amsterdam')
      );
      address = vestiging?.postadres || null;
    }
  }

  return address;
}

export function transformKVKData(responseData: KVKSourceData): KVKData | null {
  if (
    responseData === null ||
    responseData.content === null ||
    typeof responseData.content !== 'object' ||
    Array.isArray(responseData.content)
  ) {
    return null;
  }
  if (responseData.content.onderneming?.handelsnamen) {
    responseData.content.onderneming.handelsnaam =
      responseData.content.onderneming?.handelsnamen.shift() || null;
  }
  if (responseData.content.vestigingen) {
    responseData.content.vestigingen = responseData.content.vestigingen.map(
      (vestiging) => {
        const isHoofdvestiging =
          vestiging.typeringVestiging === 'Hoofdvestiging' &&
          !vestiging.datumEinde;
        return Object.assign(vestiging, {
          isHoofdvestiging,
          websites:
            vestiging.websites?.map((website) => {
              return !website.startsWith('http://') &&
                !website.startsWith('https://')
                ? `https://${website}`
                : website;
            }) || null,
        });
      }
    );
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
