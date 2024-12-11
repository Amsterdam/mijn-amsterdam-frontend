import { parseISO } from 'date-fns';
import { firstBy } from 'thenby';

import { fetchAfisBusinessPartnerDetails } from './afis-business-partner';
import { EMandateAcceptantenGemeenteAmsterdam } from './afis-e-mandates-config';
import { getAfisApiConfig, getFeedEntryProperties } from './afis-helpers';
import {
  AfisBusinessPartnerDetailsTransformed,
  AfisEMandateCreatePayload,
  AfisEMandateSourceStatic,
  AfisEMandatesResponseDataSource,
  AfisEMandateUpdatePayload,
  AfisEMandateFrontend,
  AfisEMandateSignRequestResponse,
  AfisEMandateSource,
  AfisEMandateAcceptant,
  AfisEMandateCreateParams,
  EMandateSignRequestPayload,
  EMandateStatusChangePayload,
  EMandateSignRequestStatusPayload,
  BusinessPartnerIdPayload,
} from './afis-types';
import { HTTP_STATUS_CODES } from '../../../universal/constants/errorCodes';
import {
  apiErrorResult,
  ApiResponse,
  apiSuccessResult,
} from '../../../universal/helpers/api';
import { defaultDateFormat } from '../../../universal/helpers/date';
import { AuthProfile } from '../../auth/auth-types';
import {
  encryptPayloadAndSessionID,
  encryptSessionIdWithRouteIdParam,
} from '../../helpers/encrypt-decrypt';
import { getFromEnv } from '../../helpers/env';
import { getApiConfig } from '../../helpers/source-api-helpers';
import { requestData } from '../../helpers/source-api-request';
import { BffEndpoints } from '../../routing/bff-routes';
import { generateFullApiUrlBFF } from '../../routing/route-helpers';

function transformCreateEMandatesResponse(response: unknown) {
  return response;
}

const afisEMandatePostbodyStatic: AfisEMandateSourceStatic = {
  PayType: getFromEnv('BFF_AFIS_EMANDATE_PAYTYPE') ?? '',
  SndType: getFromEnv('BFF_AFIS_EMANDATE_SNDTYPE') ?? '',
  RefType: getFromEnv('BFF_AFIS_EMANDATE_REFTYPE') ?? '',
  RecType: getFromEnv('BFF_AFIS_EMANDATE_RECTYPE') ?? '',
  RecId: getFromEnv('BFF_AFIS_EMANDATE_RECID') ?? '',
  Status: getFromEnv('BFF_AFIS_EMANDATE_STATUS') ?? '',
};

export async function createAfisEMandate(
  requestID: RequestID,
  payload: AfisEMandateCreateParams
) {
  const acceptant = EMandateAcceptantenGemeenteAmsterdam.find(
    (acceptant) => acceptant.iban === payload.acceptantIBAN
  );

  if (!acceptant) {
    throw new Error('Acceptant not found');
  }

  const payloadFinal: AfisEMandateCreatePayload = {
    ...afisEMandatePostbodyStatic,
    ...payload.sender,
    SignDate: payload.eMandateSignDate,
    SignCity: payload.eMandatesignCity,
    LifetimeFrom: new Date().toISOString(),
    LifetimeTo: '9999-12-31T00:00:00',
    SndDebtorId: getSndDebtorId(acceptant),
    RecName1: '',
    RecPostal: '',
    RecStreet: '',
    RecHouse: '',
    RecCity: '',
    RecCountry: '',
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
  payload: AfisEMandateUpdatePayload
) {
  const payloadFinal: AfisEMandateUpdatePayload = {
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

const EMANDATE_STATUS = {
  ON: '1',
  OFF: '0',
};

function isEmandateActive(afisEMandateSource?: AfisEMandateSource) {
  const lifetimeTo = afisEMandateSource?.LifetimeTo;
  if (!lifetimeTo) {
    return false;
  }
  // Active if date is in the future.
  return parseISO(lifetimeTo) > new Date();
}

function addStatusChangeUrls(
  sessionID: SessionID,
  businessPartnerId: AfisBusinessPartnerDetailsTransformed['businessPartnerId'],
  eMandate: AfisEMandateFrontend,
  acceptant: AfisEMandateAcceptant,
  afisEMandateSource?: AfisEMandateSource
) {
  if (afisEMandateSource?.IMandateId) {
    // Status is active, only provide an actiation link
    const changeToStatus = isEmandateActive(afisEMandateSource)
      ? EMANDATE_STATUS.OFF
      : EMANDATE_STATUS.ON;

    const urlQueryParams = new URLSearchParams({
      payload: encryptSessionIdWithRouteIdParam(
        sessionID,
        afisEMandateSource.IMandateId.toString()
      ),
      status: changeToStatus,
    });

    eMandate.statusChangeUrl = `${generateFullApiUrlBFF(
      BffEndpoints.AFIS_EMANDATES_STATUS_CHANGE
    )}?${urlQueryParams}`;
  }

  if (!afisEMandateSource?.IMandateId || isEmandateActive(afisEMandateSource)) {
    const urlQueryParams = new URLSearchParams({
      payload: encryptPayloadAndSessionID<EMandateSignRequestPayload>(
        sessionID,
        {
          acceptantIBAN: acceptant.iban,
          businessPartnerId: businessPartnerId,
        }
      ),
    });

    eMandate.signRequestUrl = `${generateFullApiUrlBFF(
      BffEndpoints.AFIS_EMANDATES_SIGN_REQUEST_URL
    )}?${urlQueryParams}`;
  }
}

function transformEMandateSource(
  sessionID: SessionID,
  businessPartnerId: AfisBusinessPartnerDetailsTransformed['businessPartnerId'],
  acceptant: AfisEMandateAcceptant,
  afisEMandateSource?: AfisEMandateSource
): Readonly<AfisEMandateFrontend> {
  const dateValidFrom = afisEMandateSource?.LifetimeFrom || null;
  const dateValidFromFormatted = dateValidFrom
    ? defaultDateFormat(dateValidFrom)
    : null;
  const isActive = isEmandateActive(afisEMandateSource);
  const eMandate: AfisEMandateFrontend = {
    acceptant: `${acceptant.name}\n${acceptant.iban}`,
    senderIBAN: (isActive ? afisEMandateSource?.SndIban : null) ?? null,
    senderName: isActive
      ? [(afisEMandateSource?.SndName1, afisEMandateSource?.SndName2)]
          .filter(Boolean)
          .join(' ')
      : null, // Firstname + Lastname
    dateValidFrom,
    dateValidFromFormatted,
    status: isEmandateActive(afisEMandateSource)
      ? EMANDATE_STATUS.ON
      : EMANDATE_STATUS.OFF,
    displayStatus: isEmandateActive(afisEMandateSource)
      ? `Actief sinds ${dateValidFromFormatted}`
      : 'Niet actief',
  };

  addStatusChangeUrls(
    sessionID,
    businessPartnerId,
    eMandate,
    acceptant,
    afisEMandateSource
  );

  return eMandate;
}

function getSndDebtorId(acceptant: AfisEMandateAcceptant) {
  return acceptant.refId;
}

function getEMandateSourceByAcceptant(
  sourceMandates: AfisEMandateSource[],
  acceptant: AfisEMandateAcceptant
): AfisEMandateSource | undefined {
  return sourceMandates.find((eMandateSource) => {
    return eMandateSource.SndDebtorId === getSndDebtorId(acceptant);
  });
}

function transformEMandatesResponse(
  responseData: AfisEMandatesResponseDataSource,
  sessionID: SessionID,
  businessPartnerId: AfisBusinessPartnerDetailsTransformed['businessPartnerId']
): AfisEMandateFrontend[] {
  if (!responseData?.feed?.entry) {
    return [];
  }
  const sourceMandates = getFeedEntryProperties(responseData);
  return EMandateAcceptantenGemeenteAmsterdam.map((acceptant) => {
    const afisEMandateSource = getEMandateSourceByAcceptant(
      sourceMandates,
      acceptant
    );

    const eMandate = transformEMandateSource(
      sessionID,
      businessPartnerId,
      acceptant,
      afisEMandateSource
    );

    return eMandate;
  }).sort(
    firstBy(function sortByStatus(eMandate: AfisEMandateFrontend) {
      return eMandate.status === EMANDATE_STATUS.ON ? -1 : 1;
    }).thenBy('acceptant')
  );
}

export async function fetchAfisEMandates(
  requestID: RequestID,
  payload: BusinessPartnerIdPayload,
  authProfile: AuthProfile
): Promise<ApiResponse<AfisEMandateFrontend[] | null>> {
  const config = await getAfisApiConfig(
    {
      formatUrl: ({ url }) => {
        return `${url}/Mandate/ZGW_FI_MANDATE_SRV_01/Mandate_readSet?$filter=SndId eq '${payload.businessPartnerId}'`;
      },
      transformResponse: (responseData) =>
        transformEMandatesResponse(
          responseData,
          authProfile.sid,
          payload.businessPartnerId
        ),
    },
    requestID
  );

  return requestData<AfisEMandateFrontend[] | null>(config, requestID);
}

function transformEMandatesRedirectUrlResponse(responseData: any) {
  return { redirectUrl: '' };
}

export async function fetchEmandateRedirectUrlFromProvider(
  requestID: RequestID,
  eMandateSignRequestPayload: EMandateSignRequestPayload
) {
  const acceptant = EMandateAcceptantenGemeenteAmsterdam.find(
    (acceptant) => acceptant.iban === eMandateSignRequestPayload.acceptantIBAN
  );

  if (!acceptant) {
    return apiErrorResult(
      'Acceptant not found',
      null,
      HTTP_STATUS_CODES.BAD_REQUEST
    );
  }

  const businessPartnerResponse = await fetchAfisBusinessPartnerDetails(
    requestID,
    eMandateSignRequestPayload
  );

  if (businessPartnerResponse.status !== 'OK') {
    return businessPartnerResponse;
  }

  const acceptantId = `${getFromEnv('BFF_AFIS_EMANDATE_ACCEPTANT_ID')}-${acceptant.subId}`;

  const eMandateProviderPayload = {
    acceptantId,
  };

  const config = await getApiConfig('POM', {
    method: 'POST',
    formatUrl: ({ url }) => {
      return `${url}`;
    },
    transformResponse: transformEMandatesRedirectUrlResponse,
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
  eMandateTransactionKey: EMandateSignRequestStatusPayload
) {
  return apiSuccessResult({ signRequestStatus: 'SUCCESS' });
}

export async function changeEMandateStatus(
  requestID: RequestID,
  eMandateTransactionKey: EMandateStatusChangePayload
) {
  return apiSuccessResult({ status: 'SUCCESS' });
}

export const forTesting = {
  transformEMandatesResponse,
};
