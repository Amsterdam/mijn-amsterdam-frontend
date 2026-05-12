import type {
  ContactProfieldienstResponseSource,
  CommunicatievoorkeurPayloadSource,
} from './contact-profieldienst-types.ts';
import type {
  CommunicatievoorkeurFrontend,
  CommunicatievoorkeurenResponseFrontend,
} from './contact-profieldienst-types.ts';
import { profieldienstRequestConfig } from './contact-service-config.ts';
import {
  apiSuccessResult,
  type ApiResponse,
} from '../../../universal/helpers/api.ts';
import { getFullAddress } from '../../../universal/helpers/brp.ts';
import type { AuthProfileAndToken } from '../../auth/auth-types.ts';
import { getCustomApiConfig } from '../../helpers/source-api-helpers.ts';
import { requestData } from '../../helpers/source-api-request.ts';
import { fetchMyLocations } from '../bag/my-locations.ts';

const ContactgegevenTypeFrontend = {
  EMAIL: 'email',
  PHONE: 'phone',
  APP: 'app',
  BERICHTENBOX: 'berichtenbox',
  POSTADRES: 'postadres',
} as const;

export type MediumType =
  (typeof ContactgegevenTypeFrontend)[keyof typeof ContactgegevenTypeFrontend];

const voorkeurenBE____static: CommunicatievoorkeurFrontend[] = [
  {
    id: 1,
    dienstNaam: 'Zorg en ondersteuning (WMO)',
    dienstBeschrijving: 'Informatie over uw aanvragen en voorzieningen',
    settings: [
      {
        type: ContactgegevenTypeFrontend.EMAIL,
        value: null,
        dateModified: null,
      },
      {
        type: ContactgegevenTypeFrontend.POSTADRES,
        value: 'Het Amstelplein 32-H',
        dateModified: null,
      },
    ],
  },
  {
    id: 2,
    dienstNaam: 'Erfpacht',
    dienstBeschrijving: 'Factuurspecificaties',
    settings: [
      {
        type: ContactgegevenTypeFrontend.EMAIL,
        value: null,
        dateModified: null,
      },
      {
        type: ContactgegevenTypeFrontend.POSTADRES,
        value: null,
        dateModified: null,
      },
      {
        type: ContactgegevenTypeFrontend.PHONE,
        value: '0612345678',
        dateModified: null,
      },
    ],
  },
  {
    id: 3,
    dienstNaam: 'Erfpacht',
    dienstBeschrijving: 'Informatie over uw Erfpacht dossiers',
    settings: [
      {
        type: ContactgegevenTypeFrontend.EMAIL,
        value: null,
        dateModified: null,
      },
      {
        type: ContactgegevenTypeFrontend.POSTADRES,
        value: null,
        dateModified: null,
      },
    ],
  },
];

const identificatieTypeByProfileType: Record<
  ProfileType,
  CommunicatievoorkeurPayloadSource['scope']['scopeIdentificatieType']
> = {
  private: 'BSN',
  commercial: 'KVK',
  'private-attributes': 'BSN',
};

export function getProfiel(
  authProfileAndToken: AuthProfileAndToken
): Promise<ApiResponse<ContactProfieldienstResponseSource>> {
  const requestConfig = getCustomApiConfig(profieldienstRequestConfig, {
    formatUrl({ url }) {
      return `${url}${identificatieTypeByProfileType[authProfileAndToken.profile.profileType]}/${authProfileAndToken.profile.id}`;
    },
  });
  return requestData<ContactProfieldienstResponseSource>(requestConfig);
}

export async function fetchCommunicatievoorkeuren(
  authProfileAndToken: AuthProfileAndToken
): Promise<ApiResponse<CommunicatievoorkeurenResponseFrontend>> {
  const locationsResponse = await fetchMyLocations(authProfileAndToken);

  return apiSuccessResult({
    // Hier gegevens uit het profile endpoint aansluiten.
    voorkeuren: voorkeurenBE____static,
    // Welke zijn de standaard gegevens? Misschien de eerst toegevoegde?
    standaardContactvoorkeurPerType: {
      // TODO: add the default contactgegevens from the profieldienst.
      email: {
        type: ContactgegevenTypeFrontend.EMAIL,
        // value: 't.van.oostrom@amsterdam.nl',
        // isValidated: false,
        // dateModified: '2025-05-04',
        value: null,
        dateModified: null,
      },
      phone: {
        type: ContactgegevenTypeFrontend.PHONE,
        value: null,
        dateModified: null,
      },
      app: {
        type: ContactgegevenTypeFrontend.APP,
        value: null,
        dateModified: null,
      },
      berichtenbox: {
        type: ContactgegevenTypeFrontend.BERICHTENBOX,
        value: null,
        dateModified: null,
      },
      postadres: {
        type: ContactgegevenTypeFrontend.POSTADRES,
        dateModified: null,
        value: locationsResponse.content?.[0]?.address
          ? getFullAddress(locationsResponse.content?.[0]?.address)
          : null,
      },
    },
  });
}

export async function setCommunicatievoorkeur(
  authProfileAndToken: AuthProfileAndToken,
  type: MediumType,
  value: string,
  serviceId?: number,
  voorkeurId?: number
): Promise<ApiResponse<null>> {
  const scope: CommunicatievoorkeurPayloadSource['scope'] = {
    scopeIdentificatieType:
      identificatieTypeByProfileType[authProfileAndToken.profile.profileType],
    scopeIdentificatieNummer: authProfileAndToken.profile.id,
  };

  if (serviceId) {
    scope.dienstId = serviceId;
  }

  const payload: CommunicatievoorkeurPayloadSource = {
    voorkeurType: type,
    waarde: value,
    scope,
  };

  if (voorkeurId) {
    payload.id = voorkeurId;
  }

  const requestConfig = getCustomApiConfig(profieldienstRequestConfig, {
    formatUrl({ url }) {
      return `${url}${identificatieTypeByProfileType[authProfileAndToken.profile.profileType]}/${authProfileAndToken.profile.id}`;
    },
    method: voorkeurId ? 'PUT' : 'POST',
    data: JSON.stringify(payload),
  });

  return requestData<null>(requestConfig);
}
