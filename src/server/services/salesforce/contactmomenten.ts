import {
  ContactMomentenResponseSource,
  ContactMoment,
} from './contactmomenten.types';
import { IS_TEST } from '../../../universal/config/env';
import { defaultDateFormat } from '../../../universal/helpers/date';
import { AuthProfileAndToken } from '../../auth/auth-types';
import { DataRequestConfig } from '../../config/source-api';
import { encrypt } from '../../helpers/encrypt-decrypt';
import { getFromEnv } from '../../helpers/env';
import { getApiConfig } from '../../helpers/source-api-helpers';
import { requestData } from '../../helpers/source-api-request';

async function fetchSalesforceData<T>(
  requestID: RequestID,
  dataRequestConfigSpecific: DataRequestConfig
) {
  const dataRequestConfigBase = getApiConfig(
    'SALESFORCE',
    dataRequestConfigSpecific
  );
  return requestData<T>(dataRequestConfigBase, requestID);
}

function transformContactmomentenResponse(
  responseData: ContactMomentenResponseSource
) {
  if (responseData.results) {
    return responseData.results.map((contactMoment) => ({
      referenceNumber: contactMoment.nummer,
      subject: contactMoment.onderwerp,
      themaKanaal: contactMoment.kanaal,
      datePublishedFormatted: defaultDateFormat(contactMoment.plaatsgevondenOp),
      datePublished: contactMoment.plaatsgevondenOp,
    }));
  }
  return [];
}

export async function fetchContactmomenten(
  requestID: RequestID,
  authProfileAndToken: AuthProfileAndToken
) {
  const base64encodedPK = getFromEnv('BFF_SALESFORCE_API_KEY');
  if (!base64encodedPK) {
    throw new Error('BFF_SALESFORCE_API_KEY not found');
  }
  const encryptedBSN = encrypt(
    authProfileAndToken.profile.id,
    Buffer.from(base64encodedPK, 'base64')
  );

  const addEnv = IS_TEST ? '/dev' : '';
  console.log('env Test?', IS_TEST);

  const requestConfig: DataRequestConfig = {
    formatUrl({ url }) {
      return `${url}/contactmomenten${addEnv}/services/apexrest/klantinteracties/v1.0/klantcontacten/`;
    },
    params: {
      hadBetrokkene__uuid: encodeURIComponent(
        encryptedBSN[1].toString('base64')
      ),
      iv: encodeURIComponent(encryptedBSN[2].toString('base64')),
    },
    transformResponse: transformContactmomentenResponse,
  };
  return fetchSalesforceData<ContactMoment[]>(requestID, requestConfig);
}
