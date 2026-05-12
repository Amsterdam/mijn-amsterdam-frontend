import { getProfileType } from './contact-helper.ts';
import type {
  ContactProfieldienstResponseSource,
  CommunicatievoorkeurPayloadSource,
} from './contact-profieldienst-types.ts';
import type {
  CommunicatievoorkeurFrontend,
  CommunicatievoorkeurenResponseFrontend,
} from './contact-profieldienst-types.ts';
import type { CreateVerificationRequestPayload } from './contact-verify.types.ts';
import {
  apiErrorResult,
  apiSuccessResult,
  type ApiResponse,
} from '../../../universal/helpers/api.ts';
import { getFullAddress } from '../../../universal/helpers/brp.ts';
import { toDateFormatted } from '../../../universal/helpers/date.ts';
import type { AuthProfileAndToken } from '../../auth/auth-types.ts';
import { getApiConfig } from '../../helpers/source-api-helpers.ts';
import { requestData } from '../../helpers/source-api-request.ts';
import { fetchMyLocations } from '../bag/my-locations.ts';

const DEFAULT_OIN = '0363';
const DEFAULT_DIENSTVERLENER = 'amsterdam';

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
        dateModifiedFormatted: null,
      },
      {
        type: ContactgegevenTypeFrontend.POSTADRES,
        value: 'Het Amstelplein 32-H',
        dateModified: null,
        dateModifiedFormatted: null,
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
        dateModifiedFormatted: null,
      },
      {
        type: ContactgegevenTypeFrontend.POSTADRES,
        value: null,
        dateModified: null,
        dateModifiedFormatted: null,
      },
      {
        type: ContactgegevenTypeFrontend.PHONE,
        value: '0612345678',
        dateModified: null,
        dateModifiedFormatted: null,
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
        dateModifiedFormatted: null,
      },
      {
        type: ContactgegevenTypeFrontend.POSTADRES,
        value: null,
        dateModified: null,
        dateModifiedFormatted: null,
      },
    ],
  },
];

export async function getProfiel(
  authProfileAndToken: AuthProfileAndToken
): Promise<ApiResponse<ContactProfieldienstResponseSource>> {
  const profileType = getProfileType(authProfileAndToken.profile.profileType);

  const apiConfig = getApiConfig('CONTACT', {
    method: 'get',
    params: {
      dienstverlener: DEFAULT_DIENSTVERLENER,
      oin: DEFAULT_OIN,
    },
    formatUrl({ url }) {
      return `${url}/${profileType}/${authProfileAndToken.profile.id}`;
    },
    enableCache: false, // For testing
  });

  const response = await requestData<ContactProfieldienstResponseSource>(
    apiConfig,
    authProfileAndToken
  );

  return response;
}

function getMostRecentForMedium(
  profiel: ApiResponse<ContactProfieldienstResponseSource>,
  mediumType: MediumType
) {
  if (profiel.status !== 'OK') {
    return {
      type: mediumType,
      value: null,
      isValidated: false,
      dateModified: null,
      dateModifiedFormatted: null,
    };
  }
  const medium = profiel.content.contactgegevens
    .sort((a, b) => String(b.lastUpdated).localeCompare(String(a.lastUpdated)))
    .sort((a, b) => Number(b.isGeverifieerd) - Number(a.isGeverifieerd))
    .find((contact) => contact.type === payloadTypeByMediumType[mediumType]);

  return {
    type: mediumType,
    value: medium?.waarde || null,
    isValidated: medium?.isGeverifieerd || false,
    dateModified: medium?.lastUpdated || null,
    dateModifiedFormatted: toDateFormatted(medium?.lastUpdated),
  };
}

export async function fetchCommunicatievoorkeuren(
  authProfileAndToken: AuthProfileAndToken
): Promise<ApiResponse<CommunicatievoorkeurenResponseFrontend>> {
  const locationsResponse = await fetchMyLocations(authProfileAndToken);

  const profiel = await getProfiel(authProfileAndToken);
  const email = getMostRecentForMedium(profiel, 'email');
  const phone = getMostRecentForMedium(profiel, 'phone');
  const app = getMostRecentForMedium(profiel, 'app');

  // TODO: ook gegevens van berichtenbox/postadres toevoegen
  return apiSuccessResult({
    voorkeuren: voorkeurenBE____static,
    standaardContactvoorkeurPerType: {
      email,
      phone: {
        ...phone,
        disabled: true,
      },
      app,
      berichtenbox: {
        type: ContactgegevenTypeFrontend.BERICHTENBOX,
        value: null,
        dateModified: null,
        dateModifiedFormatted: null,
        disabled: true,
      },
      postadres: {
        type: ContactgegevenTypeFrontend.POSTADRES,
        dateModified: null,
        value: locationsResponse.content?.[0]?.address
          ? getFullAddress(locationsResponse.content?.[0]?.address)
          : null,
        dateModifiedFormatted: null,
      },
    },
  });
}

const payloadTypeByMediumType = {
  email: 'Email',
  phone: 'Telefoonnummer',
  app: 'AppId',
  postadres: 'Adres',
  berichtenbox: null,
} satisfies Partial<
  Record<MediumType, CreateVerificationRequestPayload['type'] | null>
>;

export async function setCommunicatievoorkeur(
  authProfileAndToken: AuthProfileAndToken,
  mediumType: MediumType,
  mediumValue: string,
  serviceId?: number,
  voorkeurId?: number
): Promise<ApiResponse<null>> {
  const scope: CommunicatievoorkeurPayloadSource['scope'] = {
    scopeIdentificatieType: getProfileType(
      authProfileAndToken.profile.profileType
    ),
    scopeIdentificatieNummer: authProfileAndToken.profile.id,
  };

  if (serviceId) {
    scope.dienstId = serviceId;
  }

  const payloadType = payloadTypeByMediumType[mediumType];
  if (!payloadType) {
    return apiErrorResult(`payloadType ${mediumType} is not supported`, null);
  }

  const profileType = getProfileType(authProfileAndToken.profile.profileType);
  const payload: CommunicatievoorkeurPayloadSource = {
    type: payloadType,
    waarde: mediumValue,
    scope: {
      scopeIdentificatieType: profileType,
      scopeIdentificatieNummer: authProfileAndToken.profile.id,
      dienstId: serviceId,
    },
  };

  if (voorkeurId) {
    payload.id = voorkeurId;
  }

  const apiConfig = getApiConfig('CONTACT', {
    method: 'put',
    data: payload,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    formatUrl({ url }) {
      return `${url}/contactgegeven/${profileType}/${authProfileAndToken.profile.id}`;
    },
    enableCache: false, // For testing
  });

  return requestData<null>(apiConfig);
}
