import { apiErrorResult } from '../../../universal/helpers/api';
import { getApiConfig } from '../../config';
import { AuthProfileAndToken } from '../../helpers/app';
import { requestData } from '../../helpers/source-api-request';

type ParkerenUrlResponse = {
  url: string;
};

export async function fetchSSOParkerenURL(
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken
) {
  const profileType = authProfileAndToken.profile.profileType;
  const config = getApiConfig('PARKEREN', {
    transformResponse: (response: ParkerenUrlResponse) => {
      return response.url;
    },
  });
  const base_route = '/sso/get_authentication_url?service=';

  switch (profileType) {
    case 'private': {
      config.url = `${config.url}${base_route}digid`;
      break;
    }
    case 'commercial': {
      config.url = `${config.url}${base_route}eherkenning`;
      break;
    }
    default: {
      const errorMessage = 'No profile type found for Parkeren.';
      console.error(errorMessage);
      return apiErrorResult(errorMessage, null, 400);
    }
  }

  const response = await requestData<ParkerenUrlResponse>(config, requestID);
  return response;
}
