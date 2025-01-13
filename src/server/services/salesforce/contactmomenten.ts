import {
  ContactMomentenResponseSource,
  ContactMoment,
} from './contactmomenten.types';
import { IS_PRODUCTION } from '../../../universal/config/env';
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

// TODO: Implement encryption when the encryption method is known
function encryptBsn(bsn: string) {
  if (IS_PRODUCTION) {
    throw Error(
      'TODO: Not implemented, waiting for encryption method to be known'
    );
  }
  return bsn;
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
  const requestConfig: DataRequestConfig = {
    formatUrl({ url }) {
      return `${url}/contactmomenten/services/apexrest/klantinteracties/v1.0/klantcontacten/`;
    },
    params: {
      hadBetrokkene__uuid: encryptBsn(authProfileAndToken.profile.id),
    },
    transformResponse: transformContactmomentenResponse,
  };
  return fetchSalesforceData<ContactMoment[]>(requestID, requestConfig);
}
