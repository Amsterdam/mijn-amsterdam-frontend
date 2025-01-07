import { ContactMoment, ContactMomentenResponse } from './types';
import { defaultDateFormat } from '../../../universal/helpers/date';
import { AuthProfileAndToken } from '../../auth/auth-types';
import { DataRequestConfig } from '../../config/source-api';
import { getApiConfig } from '../../helpers/source-api-helpers';
import { requestData } from '../../helpers/source-api-request';

// See also: https://www.amsterdam.nl/wonen-leefomgeving/wonen/bedandbreakfast/oude-regels/

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

// TODO: Implement encryption
function encryptBsn(bsn: string) {
  return bsn;
}

export async function fetchContactmomenten(
  requestID: RequestID,
  authProfileAndToken: AuthProfileAndToken
) {
  const requestConfig: DataRequestConfig = {
    formatUrl({ url }) {
      return `${url}/contactmomenten/services/apexrest/klantinteracties/v1.0/klantcontacten/`;
    },
    params: {
      hadBetrokkene__uuid: encryptBsn(authProfileAndToken.profile.id),
    },
    transformResponse(responseData: ContactMomentenResponse) {
      if (responseData.results) {
        return responseData.results.map((contactMoment) => ({
          ...contactMoment,
          plaatsgevondenOp: defaultDateFormat(contactMoment.plaatsgevondenOp),
        }));
      }
      return null;
    },
  };
  return fetchSalesforceData<ContactMoment[] | null>(requestID, requestConfig);
}
