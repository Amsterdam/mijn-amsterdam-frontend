import { getAfisApiConfig } from './afis-helpers';
import {
  AfisBusinessPartnerDetailsTransformed,
  AfisEMandatePayloadCreate,
  AfisEMandatePayloadBase,
  AfisEMandatesResponseDataSource,
  AfisEMandatesResponseFrontend,
  AfisEMandatePayloadUpdate,
  AfisEMandateFrontend,
} from './afis-types';
import { ApiResponse } from '../../../universal/helpers/api';
import { getFromEnv } from '../../helpers/env';
import { requestData } from '../../helpers/source-api-request';

function transformCreateEMandatesResponse(response: unknown) {
  return response;
}

const afisEMandatePostbodyStatic: AfisEMandatePayloadBase = {
  SEPAMandateApplication:
    getFromEnv('BFF_AFIS_EMANDATE_SEPA_MANDATE_APPLICATION') ?? '',
  Recipient: getFromEnv('BFF_AFIS_EMANDATE_RECIPIENT_ID') ?? '',
  RecipientType: getFromEnv('BFF_AFIS_EMANDATE_RECIPIENT_TYPE') ?? '',
  SenderType: getFromEnv('BFF_AFIS_EMANDATE_SENDER_TYPE') ?? '',
  Creditor: getFromEnv('BFF_AFIS_EMANDATE_CREDITOR_ID') ?? '',
};

export async function createAfisEMandate(
  requestID: RequestID,
  payload: AfisEMandatePayloadCreate
) {
  const payloadFinal: AfisEMandatePayloadBase & AfisEMandatePayloadCreate = {
    ...afisEMandatePostbodyStatic,
    ...payload,
  };

  const config = await getAfisApiConfig(
    {
      method: 'POST',
      data: payloadFinal,
      formatUrl: ({ url }) => {
        return `${url}/CreateMandate/ZGW_FI_MANDATE_SRV_01/Mandate_createSet`;
      },
      transformResponse: transformCreateEMandatesResponse,
    },
    requestID
  );

  return requestData<unknown>(config, requestID);
}

function transformUpdateEMandatesResponse(response: unknown) {
  return response;
}

export async function updateAfisEMandate(
  requestID: RequestID,
  mandateId: AfisEMandateFrontend['id'],
  payload: AfisEMandatePayloadUpdate
) {
  const payloadFinal: AfisEMandatePayloadBase & AfisEMandatePayloadUpdate = {
    ...afisEMandatePostbodyStatic,
    ...payload,
  };

  const config = await getAfisApiConfig(
    {
      method: 'POST',
      data: payloadFinal,
      formatUrl: ({ url }) => {
        return `${url}/ChangeMandate/ZGW_FI_MANDATE_SRV_01/Mandate_changeSet(IMandateId='${mandateId}')`;
      },
      transformResponse: transformUpdateEMandatesResponse,
    },
    requestID
  );

  return requestData<unknown>(config, requestID);
}

function transformEMandatesResponse(
  responseData: AfisEMandatesResponseDataSource
): AfisEMandatesResponseFrontend | null {
  return null;
}

export async function fetchAfisEMandates(
  requestID: RequestID,
  sessionID: SessionID,
  businessPartnerId: AfisBusinessPartnerDetailsTransformed['businessPartnerId']
): Promise<ApiResponse<AfisEMandatesResponseFrontend | null>> {
  const config = await getAfisApiConfig(
    {
      formatUrl: ({ url }) => {
        return `${url}/Mandate/ZGW_FI_MANDATE_SRV_01/Mandate_readSet?$filter=SndId eq '${businessPartnerId}'`;
      },
      transformResponse: transformEMandatesResponse,
    },
    requestID
  );

  return requestData<AfisEMandatesResponseFrontend | null>(config, requestID);
}

export const forTesting = {
  transformEMandatesResponse,
};
