import {
  ContactMomentenResponseSource,
  ContactMoment,
} from './contactmomenten.types';
import { FeatureToggle } from '../../../universal/config/feature-toggles';
import { apiPostponeResult } from '../../../universal/helpers/api';
import { dateSort, defaultDateFormat } from '../../../universal/helpers/date';
import { AuthProfileAndToken } from '../../auth/auth-types';
import { DataRequestConfig } from '../../config/source-api';
import { encrypt } from '../../helpers/encrypt-decrypt';
import { getFromEnv } from '../../helpers/env';
import {
  createSessionBasedCacheKey,
  getApiConfig,
} from '../../helpers/source-api-helpers';
import { requestData } from '../../helpers/source-api-request';

async function fetchSalesforceData<T>(
  dataRequestConfigSpecific: DataRequestConfig
) {
  const dataRequestConfigBase = getApiConfig(
    'CONTACTMOMENTEN',
    dataRequestConfigSpecific
  );
  return requestData<T>(dataRequestConfigBase);
}

function transformContactmomentenResponse(
  responseData: ContactMomentenResponseSource
) {
  if (responseData.results) {
    return responseData.results
      .map((contactMoment) => ({
        referenceNumber: contactMoment.nummer,
        subject: contactMoment.onderwerp,
        themaKanaal: contactMoment.kanaal,
        datePublishedFormatted: defaultDateFormat(
          contactMoment.plaatsgevondenOp
        ),
        datePublished: contactMoment.plaatsgevondenOp,
      }))
      .sort(dateSort('datePublished', 'desc'));
  }
  return [];
}

export async function fetchContactmomenten(
  authProfileAndToken: AuthProfileAndToken
) {
  if (!FeatureToggle.contactmomentenActive) {
    return apiPostponeResult(null);
  }

  const base64encodedPK = getFromEnv(
    'BFF_CONTACTMOMENTEN_PRIVATE_ENCRYPTION_KEY'
  );
  if (!base64encodedPK) {
    throw new Error('BFF_CONTACTMOMENTEN_PRIVATE_ENCRYPTION_KEY not found');
  }

  const [, encryptedBSN, iv] = encrypt(
    authProfileAndToken.profile.id,
    Buffer.from(base64encodedPK, 'base64')
  );

  const requestConfig: DataRequestConfig = {
    formatUrl({ url }) {
      return `${url}/services/apexrest/klantinteracties/v1.0/klantcontacten/`;
    },
    params: {
      hadBetrokkene__uuid: encryptedBSN.toString('base64'),
      iv: iv.toString('base64'),
      pageSize: 100,
    },
    transformResponse: transformContactmomentenResponse,
    cacheKey_UNSAFE: createSessionBasedCacheKey(
      authProfileAndToken.profile.sid
    ),
  };
  return fetchSalesforceData<ContactMoment[]>(requestConfig);
}
