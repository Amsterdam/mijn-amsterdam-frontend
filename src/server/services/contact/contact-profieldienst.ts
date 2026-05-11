import type {
  ContactProfieldienstResponseSource,
  CommunicatievoorkeurPayload,
} from './contact-profieldienst-types.ts';
import type {
  Communicatievoorkeur,
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

const MEDIUM_TYPES = {
  EMAIL: 'email',
  PHONE: 'phone',
  POSTADRES: 'postadres',
} as const;

export type MediumType = (typeof MEDIUM_TYPES)[keyof typeof MEDIUM_TYPES];

const voorkeurenBE____static: Communicatievoorkeur[] = [
  {
    id: 1,
    stakeholder: 'Zorg en ondersteuning (WMO)',
    description: 'Informatie over uw aanvragen en voorzieningen',
    settings: [
      { type: MEDIUM_TYPES.EMAIL, value: null },
      {
        type: MEDIUM_TYPES.POSTADRES,
        value: 'Het Amstelplein 32-H',
      },
    ],
  },
  {
    id: 2,
    stakeholder: 'Erfpacht',
    description: 'Factuurspecificaties',
    settings: [
      { type: MEDIUM_TYPES.EMAIL, value: null },
      { type: MEDIUM_TYPES.POSTADRES, value: null },
      { type: MEDIUM_TYPES.PHONE, value: '0612345678' },
    ],
  },
  {
    id: 3,
    stakeholder: 'Erfpacht',
    description: 'Informatie over uw Erfpacht dossiers',
    settings: [
      { type: MEDIUM_TYPES.EMAIL, value: null },
      { type: MEDIUM_TYPES.POSTADRES, value: null },
    ],
  },
];

const identificatieTypeByProfileType: Record<
  ProfileType,
  CommunicatievoorkeurPayload['scope']['scopeIdentificatieType']
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
    voorkeuren: voorkeurenBE____static,
    defaultMediumsByType: {
      // TODO: add the default contactgegevens from the profieldienst.
      email: { type: MEDIUM_TYPES.EMAIL, value: null },
      phone: { type: MEDIUM_TYPES.PHONE, value: null },
      postadres: {
        type: MEDIUM_TYPES.POSTADRES,
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
  const scope: CommunicatievoorkeurPayload['scope'] = {
    scopeIdentificatieType:
      identificatieTypeByProfileType[authProfileAndToken.profile.profileType],
    scopeIdentificatieNummer: authProfileAndToken.profile.id,
  };

  if (serviceId) {
    scope.dienstId = serviceId;
  }

  const payload: CommunicatievoorkeurPayload = {
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
