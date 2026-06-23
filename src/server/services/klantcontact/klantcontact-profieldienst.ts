import { HttpStatusCode } from 'axios';

import {
  getIdentificatieType,
  transformContactgegevenSource,
} from './klantcontact-helpers.ts';
import type {
  ContactProfieldienstResponseSource,
  ContactgegevenFrontend,
  ContactgegevenPayloadSource,
  ContactgegevenSource,
  ContactgegevenType,
  VerifyVerificationRequestPayload,
  VerifyVerificationRequestResponse,
} from './klantcontact-profieldienst-types.ts';
import type { DienstverlenerSource } from './klantcontact-profieldienst-types.ts';
import { profieldienstRequestConfig } from './klantcontact-service-config.ts';
import { type ApiResponse } from '../../../universal/helpers/api.ts';
import type { AuthProfileAndToken } from '../../auth/auth-types.ts';
import { getCustomApiConfig } from '../../helpers/source-api-helpers.ts';
import { requestData } from '../../helpers/source-api-request.ts';

const DEFAULT_DIENSTVERLENER = 'amsterdam';

export async function fetchProfiel(
  authProfileAndToken: AuthProfileAndToken
): Promise<ApiResponse<ContactProfieldienstResponseSource>> {
  const identificatieType = getIdentificatieType(
    authProfileAndToken.profile.profileType
  );

  const apiConfig = getCustomApiConfig(profieldienstRequestConfig, {
    method: 'POST',
    data: {
      identificatieType,
      identificatieNummer: authProfileAndToken.profile.id,
      dienstverlener: DEFAULT_DIENSTVERLENER,
      // dienstNaam: 'zorgned-jzd',
    },
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    formatUrl({ url }) {
      return `${url}/partij`;
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
    method: 'GET',
    formatUrl({ url }) {
      return `${url}/dienstverlener/${dienstverlenerNaam}`;
    },
    enableCache: false, // For testing
    transformResponse: (response: DienstverlenerSource) => {
      return {
        ...response,
        diensten: [
          ...(response.diensten ?? []),
          { id: 'zorgned', beschrijving: 'WMO en Jeugdzaken' }, // TEMPORARY, until we have real data from the API
        ],
      };
    },
  });

  return requestData<DienstverlenerSource>(apiConfig, authProfileAndToken);
}

// This api call also sends a verification request to the given phone or email.
// The data will be added but isGeverifieerd will be false until the user verifies with the received code.
export async function createContactgegeven(
  authProfileAndToken: AuthProfileAndToken,
  contactgegevenType: ContactgegevenType,
  contactgegevenWaarde: string
): Promise<ApiResponse<ContactgegevenFrontend>> {
  const identificatieType = getIdentificatieType(
    authProfileAndToken.profile.profileType
  );
  const payload: ContactgegevenPayloadSource = {
    identificatieType,
    identificatieNummer: authProfileAndToken.profile.id,
    type: contactgegevenType,
    waarde: contactgegevenWaarde,
    isDefault: true,
  };

  const apiConfig = getCustomApiConfig(profieldienstRequestConfig, {
    method: 'POST',
    data: payload,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    formatUrl({ url }) {
      return `${url}/contactgegeven`;
    },
    transformResponse: (response) => {
      return transformContactgegevenSource(response, contactgegevenType);
    },
    enableCache: false, // For testing
  });

  return requestData<ContactgegevenFrontend>(apiConfig);
}

export async function deleteContactgegeven(
  authProfileAndToken: AuthProfileAndToken,
  contactgegevenId: ContactgegevenSource['id']
): Promise<ApiResponse<null>> {
  const identificatieType = getIdentificatieType(
    authProfileAndToken.profile.profileType
  );

  const apiConfig = getCustomApiConfig(profieldienstRequestConfig, {
    method: 'DELETE',
    data: {
      identificatieType,
      identificatieNummer: authProfileAndToken.profile.id,
    },
    formatUrl({ url }) {
      return `${url}/contactgegeven/${contactgegevenId}`;
    },
    enableCache: false, // For testing
  });

  return requestData<null>(apiConfig);
}

type VerifyVerificationRequestProps = {
  value: string;
  code: string;
  type: ContactgegevenType;
};

export async function verifyContactgegeven(
  authProfileAndToken: AuthProfileAndToken,
  { value, code, type }: VerifyVerificationRequestProps
) {
  // TODO: based on type, we might want to send the verification request to a different endpoint or with a different payload structure.
  // For now we only support email verification, but the API supports phone verification as well, and in the future we might want to add more types.
  const identificatieType = getIdentificatieType(
    authProfileAndToken.profile.profileType
  );
  const data: VerifyVerificationRequestPayload = {
    email: value,
    identificatieNummer: authProfileAndToken.profile.id,
    identificatieType,
    verificatieCode: code,
  };

  const apiConfig = getCustomApiConfig(profieldienstRequestConfig, {
    method: 'POST',
    data,
    formatUrl({ url }) {
      return `${url}/emailverificatie`;
    },
    transformResponse: (_response: unknown, _headers, status) => {
      return { verified: status === HttpStatusCode.Ok };
    },
    enableCache: false, // For testing
  });

  return requestData<VerifyVerificationRequestResponse>(apiConfig);
}
