import type { ContactgegevenType } from './klantcontact-communicatievoorkeuren.ts';
import {
  getProfileType,
  payloadTypeByMediumType,
} from './klantcontact-helpers.ts';
import type {
  ContactProfieldienstResponseSource,
  CommunicatievoorkeurPayloadSource,
} from './klantcontact-profieldienst-types.ts';
import type { DienstverlenerSource } from './klantcontact-profieldienst-types.ts';
import { profieldienstRequestConfig } from './klantcontact-service-config.ts';
import {
  apiErrorResult,
  type ApiResponse,
} from '../../../universal/helpers/api.ts';
import type { AuthProfileAndToken } from '../../auth/auth-types.ts';
import { getCustomApiConfig } from '../../helpers/source-api-helpers.ts';
import { requestData } from '../../helpers/source-api-request.ts';
import { GEMEENTE_CODE_AMSTERDAM } from '../brp/brp-config.ts';

const DEFAULT_OIN = GEMEENTE_CODE_AMSTERDAM;
const DEFAULT_DIENSTVERLENER = 'amsterdam';

export async function fetchProfiel(
  authProfileAndToken: AuthProfileAndToken
): Promise<ApiResponse<ContactProfieldienstResponseSource>> {
  const profileType = getProfileType(authProfileAndToken.profile.profileType);

  const apiConfig = getCustomApiConfig(profieldienstRequestConfig, {
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

export async function fetchDienstverlener(
  authProfileAndToken: AuthProfileAndToken,
  dienstverlenerNaam: string = DEFAULT_DIENSTVERLENER
): Promise<ApiResponse<DienstverlenerSource>> {
  const apiConfig = getCustomApiConfig(profieldienstRequestConfig, {
    method: 'get',
    formatUrl({ url }) {
      return `${url}/dienstverlener/${dienstverlenerNaam}`;
    },
    enableCache: false, // For testing
  });

  return requestData<DienstverlenerSource>(apiConfig, authProfileAndToken);
}

export async function setContactgegeven(
  authProfileAndToken: AuthProfileAndToken,
  contactgegevenType: ContactgegevenType,
  contactgegevenWaarde: string,
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

  const payloadType = payloadTypeByMediumType[contactgegevenType];
  if (!payloadType) {
    return apiErrorResult(
      `payloadType ${contactgegevenType} is not supported`,
      null
    );
  }

  const profileType = getProfileType(authProfileAndToken.profile.profileType);
  const payload: CommunicatievoorkeurPayloadSource = {
    type: payloadType,
    waarde: contactgegevenWaarde,
    scope: {
      scopeIdentificatieType: profileType,
      scopeIdentificatieNummer: authProfileAndToken.profile.id,
      dienstId: serviceId,
    },
  };

  if (voorkeurId) {
    payload.id = voorkeurId;
  }

  const apiConfig = getCustomApiConfig(profieldienstRequestConfig, {
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
