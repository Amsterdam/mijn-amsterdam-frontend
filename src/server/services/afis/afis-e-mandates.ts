import { fetchAfisBusinessPartnerDetails } from './afis-business-partner';
import { EMandateAcceptantenGemeenteAmsterdam } from './afis-e-mandates-config';
import { getAfisApiConfig } from './afis-helpers';
import {
  AfisBusinessPartnerDetailsTransformed,
  AfisEMandatePayloadCreate,
  AfisEMandatePayloadBase,
  AfisEMandatesResponseDataSource,
  AfisEMandatePayloadUpdate,
  AfisEMandate,
  AfisEMandateSignRequestResponse,
  EMandateTransactionKey,
} from './afis-types';
import { ApiResponse, apiSuccessResult } from '../../../universal/helpers/api';
import { getFromEnv } from '../../helpers/env';
import { getApiConfig } from '../../helpers/source-api-helpers';
import { requestData } from '../../helpers/source-api-request';

function transformCreateEMandatesResponse(response: unknown) {
  return response;
}

const afisEMandatePostbodyStatic: AfisEMandatePayloadBase = {
  PayType: getFromEnv('BFF_AFIS_EMANDATE_PAYTYPE') ?? '',
  SndType: getFromEnv('BFF_AFIS_EMANDATE_SNDTYPE') ?? '',
  RefType: getFromEnv('BFF_AFIS_EMANDATE_REFTYPE') ?? '',
  RecType: getFromEnv('BFF_AFIS_EMANDATE_RECTYPE') ?? '',
  RecId: getFromEnv('BFF_AFIS_EMANDATE_RECID') ?? '',
  Status: getFromEnv('BFF_AFIS_EMANDATE_STATUS') ?? '',
};

export async function createAfisEMandate(
  requestID: RequestID,
  payload: AfisEMandatePayloadCreate
) {
  const payloadFinal: AfisEMandatePayloadCreate = {
    ...afisEMandatePostbodyStatic,
    ...payload,
  };

  const config = await getAfisApiConfig(
    {
      method: 'POST',
      data: payloadFinal,
      headers: {
        'Content-Type': 'application/xml',
      },
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
  payload: AfisEMandatePayloadUpdate
) {
  const payloadFinal: AfisEMandatePayloadUpdate = {
    ...afisEMandatePostbodyStatic,
    ...payload,
  };

  const config = await getAfisApiConfig(
    {
      method: 'PUT',
      data: payloadFinal,
      formatUrl: ({ url }) => {
        return `${url}/ChangeMandate/ZGW_FI_MANDATE_SRV_01/Mandate_changeSet(IMandateId='${payloadFinal.IMandateId}')`;
      },
      transformResponse: transformUpdateEMandatesResponse,
    },
    requestID
  );

  return requestData<unknown>(config, requestID);
}

function transformEMandatesResponse(
  responseData: AfisEMandatesResponseDataSource
): AfisEMandate[] {
  if (!responseData?.feed?.entry) {
    return [];
  }
  return EMandateAcceptantenGemeenteAmsterdam.map((acceptant) => {
    const eMandate: AfisEMandate = {
      ...acceptant,
      dateValidFrom: '',
      dateValidFromFormatted: '',
      IMandateId: '',
    };

    return eMandate;
  });
}

export async function fetchAfisEMandates(
  requestID: RequestID,
  businessPartnerId: AfisBusinessPartnerDetailsTransformed['businessPartnerId']
): Promise<ApiResponse<AfisEMandate[] | null>> {
  const config = await getAfisApiConfig(
    {
      formatUrl: ({ url }) => {
        return `${url}/Mandate/ZGW_FI_MANDATE_SRV_01/Mandate_readSet?$filter=SndId eq '${businessPartnerId}'`;
      },
      transformResponse: transformEMandatesResponse,
    },
    requestID
  );

  return requestData<AfisEMandate[] | null>(config, requestID);
}

export async function fetchEmandateRedirectUrlFromProvider(
  requestID: RequestID,
  eMandateTransactionKey: EMandateTransactionKey
) {
  const [subId, businessPartnerId] = eMandateTransactionKey.split('-');
  const acceptantID = `${getFromEnv('BFF_AFIS_EMANDATE_ACCEPTANT_ID')}-${subId}`;

  const businessPartnerResponse = await fetchAfisBusinessPartnerDetails(
    requestID,
    businessPartnerId
  );

  const eMandateProviderPayload = {};

  const config = await getApiConfig('POM', {
    formatUrl: ({ url }) => {
      return `${url}`;
    },
    transformResponse: transformEMandatesResponse,
    data: eMandateProviderPayload,
  });

  const eMandateSignUrlResponse =
    await requestData<AfisEMandateSignRequestResponse | null>(
      config,
      requestID
    );

  return eMandateSignUrlResponse;
}

export async function fetchEmandateSignRequestStatus(
  requestID: RequestID,
  eMandateTransactionKey: EMandateTransactionKey
) {
  return apiSuccessResult({ signRequestStatus: 'SUCCESS' });
}

export const forTesting = {
  transformEMandatesResponse,
};
