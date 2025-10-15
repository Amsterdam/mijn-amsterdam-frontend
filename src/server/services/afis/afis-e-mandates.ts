import { HttpStatusCode } from 'axios';
import { add, isSameDay, parseISO, subDays } from 'date-fns';
import slug from 'slugme';
import { firstBy } from 'thenby';

import {
  createBusinessPartnerBankAccount,
  fetchAfisBusinessPartnerDetails,
  fetchBusinessPartnerBankAccounts,
} from './afis-business-partner';
import {
  EMandateAcceptantenGemeenteAmsterdam,
  eMandateReceiver,
} from './afis-e-mandates-config';
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
  EMandateSignRequestPayload,
  EMandateStatusChangePayload,
  EMandateSignRequestStatusPayload,
  BusinessPartnerIdPayload,
  POMSignRequestUrlResponseSource,
  POMSignRequestStatusResponseSource,
  signRequestStatusCodes,
  AfisEMandateSignRequestStatusResponse,
  BusinessPartnerId,
  EMandateSignRequestNotificationPayload,
  AfisBusinessPartnerBankPayload,
} from './afis-types';
import { apiErrorResult, ApiResponse } from '../../../universal/helpers/api';
import {
  defaultDateFormat,
  isoDateFormat,
} from '../../../universal/helpers/date';
import type { LinkProps } from '../../../universal/types/App.types';
import { AuthProfile } from '../../auth/auth-types';
import {
  encrypt,
  encryptPayloadAndSessionID,
} from '../../helpers/encrypt-decrypt';
import { getFromEnv } from '../../helpers/env';
import { getApiConfig } from '../../helpers/source-api-helpers';
import { requestData } from '../../helpers/source-api-request';
import { BffEndpoints } from '../../routing/bff-routes';
import { generateFullApiUrlBFF } from '../../routing/route-helpers';

const AFIS_EMANDATE_RECURRING_DATE_END = '9999-12-31T00:00:00';
const AFIS_EMANDATE_COMPANY_NAME = 'Gemeente Amsterdam';
const AFIS_EMANDATE_SIGN_REQUEST_URL_VALIDITY_IN_DAYS = 1;

const EMANDATE_STATUS = {
  ON: '1',
  OFF: '0',
};

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
  payload: EMandateSignRequestPayload & EMandateSignRequestNotificationPayload
) {
  const acceptant = EMandateAcceptantenGemeenteAmsterdam.find(
    (acceptant) => acceptant.iban === payload.acceptantIBAN
  );

  if (!acceptant) {
    return apiErrorResult(
      'Invalid acceptant IBAN',
      null,
      HttpStatusCode.BadRequest
    );
  }

  const businessPartnerResponse = await fetchAfisBusinessPartnerDetails({
    businessPartnerId: payload.businessPartnerId,
  });

  if (businessPartnerResponse.status !== 'OK') {
    return businessPartnerResponse;
  }

  const sender = businessPartnerResponse.content;
  const senderIBAN = payload.senderIBAN;
  const senderBIC = payload.senderBIC;

  // TODO: Check if this bank account exists in the sender's bank account list.
  // If not add it to the list.
  const bankAccountResponse = await fetchBusinessPartnerBankAccounts(
    payload.businessPartnerId
  );

  // TODO: Should we try to add the bank account if we cannnot check if it exists?
  if (bankAccountResponse.status !== 'OK') {
    return bankAccountResponse;
  }

  const bankAccountExists = !!bankAccountResponse.content.find(
    (account) => account.IBAN === senderIBAN
  );

  if (!bankAccountExists) {
    const bankAccountPayload: AfisBusinessPartnerBankPayload = {
      businessPartnerId: payload.businessPartnerId,
      iban: senderIBAN,
      bic: senderBIC,
      swiftCode: '',
      senderName: payload.senderName,
    };

    const createBankAccountResponse =
      await createBusinessPartnerBankAccount(bankAccountPayload);

    if (createBankAccountResponse.status !== 'OK') {
      return createBankAccountResponse;
    }
  }

  const payloadFinal: AfisEMandateCreatePayload = {
    // Fixed values needed for API (black box)
    ...afisEMandatePostbodyStatic,

    // Gegevens van de incassant van het EMandaat (De gemeente Amsterdam)
    ...eMandateReceiver,

    // Gegevens van de afgever van het EMandaat
    SndId: payload.businessPartnerId,

    // Gegevens geleverd door Debtor bank via EMandaat request
    SndIban: senderIBAN,
    SndBic: senderBIC,

    // NOTE: These fields are always the same as BusinessPartnerDetails, not coupled to the bankaccount (IBAN) holder.
    SndCity: sender?.address?.CityName ?? '',
    SndCountry: sender?.address?.Country ?? '',
    SndHouse: `${sender?.address?.HouseNumber ?? ''} ${sender?.address?.HouseNumberSupplementText ?? ''}`,
    SndName1: sender?.firstName ?? '',
    SndName2: sender?.lastName ?? '',
    SndPostal: sender?.address?.PostalCode ?? '',
    SndStreet: sender?.address?.StreetName ?? '',

    SignDate: payload.eMandateSignDate,
    SignCity: eMandateReceiver.RecCity, // TODO: Hoe komen we aan dit gegeven, altijd Amsterdam?
    LifetimeFrom: new Date().toISOString(),
    LifetimeTo: AFIS_EMANDATE_RECURRING_DATE_END,
    SndDebtorId: getSndDebtorId(acceptant),
  };

  const config = await getAfisApiConfig({
    method: 'POST',
    data: payloadFinal,
    formatUrl: ({ url }) => {
      return `${url}/CreateMandate/ZGW_FI_MANDATE_SRV_01/Mandate_createSet`;
    },
    transformResponse: transformCreateEMandatesResponse,
  });

  return requestData<unknown>(config);
}

function transformUpdateEMandatesResponse(response: unknown) {
  return response;
}

async function updateAfisEMandate(payload: AfisEMandateUpdatePayload) {
  const payloadFinal: AfisEMandateUpdatePayload = {
    // ...afisEMandatePostbodyStatic, // TODO: Check if this is needed
    ...payload,
  };

  const config = await getAfisApiConfig({
    method: 'PUT',
    data: payloadFinal,
    formatUrl: ({ url }) => {
      return `${url}/ChangeMandate/ZGW_FI_MANDATE_SRV_01/Mandate_changeSet(IMandateId='${payloadFinal.IMandateId}')`;
    },
    transformResponse: transformUpdateEMandatesResponse,
  });

  return requestData<unknown>(config);
}

function isEmandateActive(afisEMandateSource?: AfisEMandateSource) {
  const lifetimeTo = afisEMandateSource?.LifetimeTo;
  if (!lifetimeTo) {
    return false;
  }
  // Active if date is in the future.
  return parseISO(lifetimeTo) > new Date();
}

function getStatusChangeApiUrl(
  sessionID: SessionID,
  afisEMandateSource: AfisEMandateSource
) {
  const changeToStatus = isEmandateActive(afisEMandateSource)
    ? EMANDATE_STATUS.OFF
    : EMANDATE_STATUS.ON;

  const lifetimeTo = parseISO(afisEMandateSource.LifetimeTo);
  const lifetimeFrom = parseISO(afisEMandateSource.LifetimeFrom);
  const today = new Date().toISOString();

  const statusChangePayloadData: EMandateStatusChangePayload = {
    IMandateId: afisEMandateSource.IMandateId.toString(),
    Status: changeToStatus,
    LifetimeTo:
      changeToStatus === EMANDATE_STATUS.OFF
        ? today
        : AFIS_EMANDATE_RECURRING_DATE_END,
  };

  // In the case the e-mandate is active for only one day, we need to set the lifetimeFrom to the day before.
  // The api does not allow to set the lifetimeTo to the same day as the lifetimeFrom.
  if (
    changeToStatus === EMANDATE_STATUS.OFF &&
    isSameDay(lifetimeFrom, lifetimeTo)
  ) {
    statusChangePayloadData.LifetimeFrom = subDays(
      lifetimeFrom,
      1
    ).toISOString();
  }

  if (changeToStatus === EMANDATE_STATUS.ON) {
    statusChangePayloadData.LifetimeFrom = today;
  }

  const urlQueryParams = new URLSearchParams({
    payload: encryptPayloadAndSessionID(sessionID, statusChangePayloadData),
  });

  return `${generateFullApiUrlBFF(
    BffEndpoints.AFIS_EMANDATES_STATUS_CHANGE
  )}?${urlQueryParams}`;
}

function getSignRequestApiUrl(
  sessionID: SessionID,
  businessPartnerId: BusinessPartnerId,
  acceptant: AfisEMandateAcceptant
) {
  const signRequestPayloadData: EMandateSignRequestPayload = {
    acceptantIBAN: acceptant.iban,
    businessPartnerId: businessPartnerId,
    eMandateSignDate: new Date().toISOString(),
  };

  const urlQueryParams = new URLSearchParams({
    payload: encryptPayloadAndSessionID(sessionID, signRequestPayloadData),
  });

  const url = generateFullApiUrlBFF(
    BffEndpoints.AFIS_EMANDATES_SIGN_REQUEST_URL
  );

  return `${url}?${urlQueryParams}`;
}

function addEmandateApiUrls(
  sessionID: SessionID,
  businessPartnerId: BusinessPartnerId,
  eMandate: AfisEMandateFrontend,
  acceptant: AfisEMandateAcceptant,
  afisEMandateSource?: AfisEMandateSource
) {
  if (afisEMandateSource?.IMandateId) {
    eMandate.statusChangeUrl = getStatusChangeApiUrl(
      sessionID,
      afisEMandateSource
    );
  }

  if (!afisEMandateSource?.IMandateId || isEmandateActive(afisEMandateSource)) {
    eMandate.signRequestUrl = getSignRequestApiUrl(
      sessionID,
      businessPartnerId,
      acceptant
    );
  }
}

function transformEMandateSource(
  sessionID: SessionID,
  businessPartnerId: BusinessPartnerId,
  acceptant: AfisEMandateAcceptant,
  afisEMandateSource?: AfisEMandateSource
): Readonly<AfisEMandateFrontend> {
  const dateValidFrom = afisEMandateSource?.LifetimeFrom || null;
  const dateValidFromFormatted = dateValidFrom
    ? defaultDateFormat(dateValidFrom)
    : null;
  const isActive = isEmandateActive(afisEMandateSource);
  const id = slug(acceptant.name);
  const eMandate: AfisEMandateFrontend & { link: LinkProps } = {
    id,
    acceptant: acceptant.name,
    acceptantIBAN: acceptant.iban,
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
    link: {
      to: `/facturen-en-betalen/betaalvoorkeuren/emandate/${id}`,
      title: acceptant.name,
    },
  };

  addEmandateApiUrls(
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
    // TODO: Find out / Confirm if the debtorId is the acceptant id?!??!?!?
    return eMandateSource.SndDebtorId === getSndDebtorId(acceptant);
  });
}

function transformEMandatesResponse(
  responseData: AfisEMandatesResponseDataSource,
  sessionID: SessionID,
  businessPartnerId: BusinessPartnerId
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
  payload: BusinessPartnerIdPayload,
  authProfile: AuthProfile
): Promise<ApiResponse<AfisEMandateFrontend[] | null>> {
  const config = await getAfisApiConfig({
    formatUrl: ({ url }) => {
      return `${url}/Mandate/ZGW_FI_MANDATE_SRV_01/Mandate_readSet?$filter=SndId eq '${payload.businessPartnerId}'`;
    },
    transformResponse: (responseData) =>
      transformEMandatesResponse(
        responseData,
        authProfile.sid,
        payload.businessPartnerId
      ),
  });

  return requestData<AfisEMandateFrontend[] | null>(config);
}

function transformEMandatesRedirectUrlResponse(
  sessionID: SessionID,
  responseData: POMSignRequestUrlResponseSource
): AfisEMandateSignRequestResponse | null {
  if (responseData?.mpid) {
    const urlQueryParams = new URLSearchParams({
      payload: encryptPayloadAndSessionID(sessionID, {
        mpid: responseData.mpid,
      }),
    });

    const statusCheckUrl = `${generateFullApiUrlBFF(
      BffEndpoints.AFIS_EMANDATES_SIGN_REQUEST_STATUS
    )}?${urlQueryParams}`;

    return { redirectUrl: responseData.paylink, statusCheckUrl };
  }

  return null;
}

function createEMandateProviderPayload(
  businessPartner: AfisBusinessPartnerDetailsTransformed,
  acceptant: AfisEMandateAcceptant,
  signRequestPayload: EMandateSignRequestPayload
) {
  const [payloadEncrypted] = encrypt(JSON.stringify(signRequestPayload));
  const queryParams = new URLSearchParams({ payload: payloadEncrypted });
  const returnUrl = generateFullApiUrlBFF(
    `${BffEndpoints.AFIS_EMANDATES_SIGN_REQUEST_RETURNTO}?${queryParams}`
  );

  const today = new Date();
  const isoDateString = today.toISOString();
  const invoiceDate = isoDateFormat(today);
  const invoiceNumber = `EMandaat-${acceptant.refId}-${invoiceDate}`;
  const invoiceDescription = `EMandaat voor Gemeente Amsterdam - ${acceptant.name}`;
  const invoiceAmount = '0';

  // TODO: Moet dit met een gegeven uit AFIS te koppelen zijn?
  const paymentReference = `${acceptant.refId}-${businessPartner.businessPartnerId}`;
  const idBatch = `batch-${paymentReference}`;
  // TODO: Generate encrypted number
  const idRequestClient = `${acceptant.refId}-${businessPartner.businessPartnerId}-${isoDateString}`;

  // Paylinks are valid for 1 day
  const dueDate = add(today, {
    days: AFIS_EMANDATE_SIGN_REQUEST_URL_VALIDITY_IN_DAYS,
  })
    .toISOString()
    .split('T')[0];

  return `<?xml version="1.0" encoding="utf-8" ?>
<request>
  <firstname>${businessPartner.firstName}</firstname>
  <lastname>${businessPartner.lastName}</lastname>
  <debtornumber>${businessPartner.businessPartnerId}</debtornumber>
  <payment_reference>${paymentReference}</payment_reference>
  <concerning>Automatische incasso ${acceptant.name}</concerning>
  <id_batch>${idBatch}</id_batch>
  <id_request_client>${idRequestClient}</id_request_client>
  <company_name>${AFIS_EMANDATE_COMPANY_NAME}</company_name>
  <module_ideal>0</module_ideal>
  <module_emandate>1</module_emandate>
  <due_date>${dueDate}</due_date>
  <return_url>${returnUrl}</return_url>
  <variable1>${signRequestPayload.acceptantIBAN}</variable1>
  <invoices>
    <invoice>
      <invoice_number>${invoiceNumber}</invoice_number>
      <invoice_description>${invoiceDescription}</invoice_description>
      <invoice_amount>${invoiceAmount}</invoice_amount>
      <invoice_date>${invoiceDate}</invoice_date>
      <invoice_date_due>${AFIS_EMANDATE_RECURRING_DATE_END}</invoice_date_due>
    </invoice>
  </invoices>
</request>`;
}

export async function fetchEmandateRedirectUrlFromProvider(
  eMandateSignRequestPayload: EMandateSignRequestPayload,
  authProfile: AuthProfile
) {
  const acceptant = EMandateAcceptantenGemeenteAmsterdam.find(
    (acceptant) => acceptant.iban === eMandateSignRequestPayload.acceptantIBAN
  );

  if (!acceptant) {
    return apiErrorResult(
      'Acceptant not found',
      null,
      HttpStatusCode.BadRequest
    );
  }

  const businessPartnerResponse = await fetchAfisBusinessPartnerDetails(
    eMandateSignRequestPayload
  );

  if (businessPartnerResponse.status !== 'OK') {
    return businessPartnerResponse;
  }

  const config = await getApiConfig('POM', {
    method: 'POST',
    formatUrl: ({ url }) => {
      return `${url}/paylinks`;
    },
    transformResponse: (responseData) =>
      transformEMandatesRedirectUrlResponse(authProfile.sid, responseData),
    data: createEMandateProviderPayload(
      businessPartnerResponse.content,
      acceptant,
      eMandateSignRequestPayload
    ),
  });

  const eMandateSignUrlResponse =
    await requestData<AfisEMandateSignRequestResponse | null>(config);

  return eMandateSignUrlResponse;
}

function transformEmandateSignRequestStatus(
  responseDataSource: POMSignRequestStatusResponseSource
): AfisEMandateSignRequestStatusResponse {
  return {
    status: signRequestStatusCodes[responseDataSource.status_code] ?? 'unknown',
    code: responseDataSource.status_code,
  };
}

export async function fetchEmandateSignRequestStatus(
  eMandateSignRequestStatusPayload: EMandateSignRequestStatusPayload
) {
  const config = await getApiConfig('POM', {
    method: 'GET',
    formatUrl: ({ url }) => {
      return `${url}/paylinks/${eMandateSignRequestStatusPayload.mpid}`;
    },
    transformResponse: transformEmandateSignRequestStatus,
  });

  const eMandateSignRequestStatusResponse =
    await requestData<AfisEMandateSignRequestResponse | null>(config);

  return eMandateSignRequestStatusResponse;
}

export async function changeEMandateStatus(
  eMandateStatusChangePayload: EMandateStatusChangePayload
) {
  return updateAfisEMandate(eMandateStatusChangePayload);
}

export const forTesting = {
  transformEMandatesResponse,
};
