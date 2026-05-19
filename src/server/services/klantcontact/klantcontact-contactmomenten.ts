import { fetchSalesforceApi } from './klantcontact-salesforce.ts';
import type {
  ContactmomentFrontend,
  ContactmomentResponseSource,
} from './klantcontact.types.ts';
import {
  defaultDateFormat,
  dateSort,
} from '../../../universal/helpers/date.ts';
import type { AuthProfileAndToken } from '../../auth/auth-types.ts';
import type { DataRequestConfig } from '../../config/source-api.ts';
import { createSessionBasedCacheKey } from '../../helpers/source-api-helpers.ts';

export async function fetchContactmomenten(
  authProfileAndToken: AuthProfileAndToken
) {
  const requestConfig: DataRequestConfig = {
    formatUrl({ url }) {
      return `${url}/services/apexrest/klantinteracties/v1.0/klantcontacten/`;
    },
    transformResponse: transformContactmomentenResponse,
    cacheKey_UNSAFE: createSessionBasedCacheKey(
      authProfileAndToken.profile.sid,
      'salesforce-klantcontact-contactmomenten'
    ),
  };
  return fetchSalesforceApi<ContactmomentFrontend[]>(
    authProfileAndToken,
    requestConfig
  );
}

function transformContactmomentenResponse(
  responseData: ContactmomentResponseSource
) {
  if (responseData.results) {
    return responseData.results
      .map((contactMoment) => ({
        referenceNumber: contactMoment.nummer,
        subject: contactMoment.onderwerp,
        kanaal: contactMoment.kanaal,
        datePublishedFormatted: defaultDateFormat(
          contactMoment.plaatsgevondenOp
        ),
        datePublished: contactMoment.plaatsgevondenOp,
      }))
      .sort(dateSort('datePublished', 'desc'));
  }
  return [];
}

export const forTesting = {
  transformContactmomentenResponse,
};
