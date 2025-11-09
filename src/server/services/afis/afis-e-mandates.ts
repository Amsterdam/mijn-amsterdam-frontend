import { HttpStatusCode } from 'axios';
import { add, isAfter, isSameDay, parseISO, subDays } from 'date-fns';
import { Request } from 'express';
import slug from 'slugme';
import { firstBy } from 'thenby';
import * as z from 'zod/v4';

import {
  createBusinessPartnerBankAccount,
  fetchAfisBusinessPartnerDetails,
  fetchCheckIfIBANexists,
} from './afis-business-partner';
import {
  EMandateCreditorsGemeenteAmsterdam,
  eMandateReceiver,
} from './afis-e-mandates-config';
import {
  EMANDATE_STATUS,
  getAfisApiConfig,
  getEmandateDisplayStatus,
  getEmandateStatus,
  getEmandateValidityDateFormatted,
  getFeedEntryProperties,
  isEmandateActive,
} from './afis-helpers';
import {
  type AfisBusinessPartnerDetailsTransformed,
  type AfisEMandateCreatePayload,
  type AfisEMandateSourceStatic,
  type AfisEMandatesResponseDataSource,
  type AfisEMandateUpdatePayload,
  type AfisEMandateFrontend,
  type AfisEMandateSignRequestResponse,
  type AfisEMandateSource,
  type AfisEMandateCreditor,
  type EMandateSignRequestPayload,
  type EMandateStatusChangePayload,
  type BusinessPartnerIdPayload,
  type POMSignRequestUrlResponseSource,
  type POMSignRequestStatusResponseSource,
  signRequestStatusCodes,
  type AfisEMandateSignRequestStatusResponse,
  type BusinessPartnerId,
  type EMandateSignRequestNotificationPayload,
  type AfisBusinessPartnerBankPayload,
  type POMSignRequestUrlPayload,
  type EMandateUpdatePayload,
} from './afis-types';
import { routeConfig } from '../../../client/pages/Thema/Afis/Afis-thema-config';
import { IS_AP } from '../../../universal/config/env';
import { apiErrorResult, ApiResponse } from '../../../universal/helpers/api';
import {
  defaultDateFormat,
  isoDateFormat,
} from '../../../universal/helpers/date';
import { AuthProfile } from '../../auth/auth-types';
import { encryptPayloadAndSessionID } from '../../helpers/encrypt-decrypt';
import { getFromEnv } from '../../helpers/env';
import { getApiConfig } from '../../helpers/source-api-helpers';
import { requestData } from '../../helpers/source-api-request';
import { generateFullApiUrlBFF } from '../../routing/route-helpers';
import { captureException } from '../monitoring';
import { routes } from './afis-service-config';

const AFIS_EMANDATE_RECURRING_DATE_END = '9999-12-31T00:00:00';
const AFIS_EMANDATE_COMPANY_NAME = 'Gemeente Amsterdam';
const AFIS_EMANDATE_SIGN_REQUEST_URL_VALIDITY_IN_DAYS = 1;

const afisEMandatePostbodyStatic: AfisEMandateSourceStatic = {
  PayType: getFromEnv('BFF_AFIS_EMANDATE_PAYTYPE') ?? '',
  SndType: getFromEnv('BFF_AFIS_EMANDATE_SNDTYPE') ?? '',
  RefType: getFromEnv('BFF_AFIS_EMANDATE_REFTYPE') ?? '',
  RecType: getFromEnv('BFF_AFIS_EMANDATE_RECTYPE') ?? '',
  RecId: getFromEnv('BFF_AFIS_EMANDATE_RECID') ?? '',
  Status: getFromEnv('BFF_AFIS_EMANDATE_STATUS') ?? '',
};

export async function createOrUpdateEMandateFromStatusNotificationPayload(
  payload: EMandateSignRequestPayload & EMandateSignRequestNotificationPayload
) {
  const creditor = EMandateCreditorsGemeenteAmsterdam.find(
    (creditor) => creditor.iban === payload.creditorIBAN
  );

  if (!creditor) {
    throw new Error(`Invalid creditor IBAN: ${payload.creditorIBAN}.`);
  }

  const businessPartnerResponse = await fetchAfisBusinessPartnerDetails({
    businessPartnerId: payload.businessPartnerId,
  });

  if (businessPartnerResponse.status !== 'OK') {
    throw new Error(
      `Error fetching business partner details - ${'message' in businessPartnerResponse ? businessPartnerResponse.message : ''}`
    );
  }

  const sender = businessPartnerResponse.content;
  const senderIBAN = payload.senderIBAN;
  const senderBIC = payload.senderBIC;

  // Check if this bank account exists in the sender's bank account list.
  // If not add it to the list.
  const bankAccountResponse = await fetchCheckIfIBANexists(senderIBAN);
  const bankAccountExists = bankAccountResponse.content === true;

  if (bankAccountResponse.status !== 'OK') {
    throw new Error(
      `Error checking if bank account exists - ${'message' in bankAccountResponse ? bankAccountResponse.message : ''}`
    );
  }

  if (!bankAccountExists) {
    const bankAccountPayload: AfisBusinessPartnerBankPayload = {
      businessPartnerId: payload.businessPartnerId,
      iban: senderIBAN,
      bic: senderBIC,
      swiftCode: senderBIC,
      senderName: payload.senderName,
    };

    const createBankAccountResponse =
      await createBusinessPartnerBankAccount(bankAccountPayload);

    if (createBankAccountResponse.status !== 'OK') {
      throw new Error(
        `Error creating bank account - ${'message' in createBankAccountResponse ? createBankAccountResponse.message : ''}`
      );
    }
  }

  // We start the e-mandate lifetime with an end date far in the future.
  // The user can later adjust this date.
  const lifetimeTo = AFIS_EMANDATE_RECURRING_DATE_END;

  const payloadFinal: AfisEMandateCreatePayload = {
    // Fixed values needed for API (black box)
    ...afisEMandatePostbodyStatic,

    // Gegevens van de crediteur van het EMandaat (De gemeente Amsterdam)
    ...eMandateReceiver,

    // Gegevens van de debiteur/afgever van het EMandaat
    SndId: payload.businessPartnerId,

    // Gegevens geleverd door Debtor bank via EMandaat request
    SndIban: senderIBAN,
    SndBic: senderBIC,

    // These fields are always the same as BusinessPartnerDetails, not coupled to the bankaccount (IBAN) holder.
    SndCity: sender.address?.CityName ?? '',
    SndCountry: sender.address?.Country ?? '',
    SndHouse: `${sender.address?.HouseNumber ?? ''} ${sender.address?.HouseNumberSupplementText ?? ''}`,
    SndName1: sender.firstName || sender.fullName || '',
    SndName2: sender.lastName ?? '',
    SndPostal: sender.address?.PostalCode ?? '',
    SndStreet: sender.address?.StreetName ?? '',

    SignDate: payload.eMandateSignDate,
    SignCity: eMandateReceiver.RecCity, // TODO: Hoe komen we aan dit gegeven, altijd Amsterdam?
    LifetimeFrom: new Date().toISOString(),
    LifetimeTo: lifetimeTo,
    SndDebtorId: creditor.refId,
  };

  const eMandateIdResponse = await fetchEmandateIdByCreditorRefId(
    payload.businessPartnerId,
    creditor.refId
  );

  const response = await (eMandateIdResponse.content
    ? updateAfisEMandate({
        ...payloadFinal,
        IMandateId: eMandateIdResponse.content,
      })
    : createAfisEMandate(payloadFinal));

  if (response.status !== 'OK') {
    throw new Error(
      `Error creating e-mandate - ${'message' in response ? response.message : ''}`
    );
  }

  return response;
}

async function createAfisEMandate(payload: AfisEMandateCreatePayload) {
  const config = await getAfisApiConfig({
    method: 'POST',
    data: payload,
    formatUrl: ({ url }) => {
      return `${url}/CreateMandate/ZGW_FI_MANDATE_SRV_01/Mandate_createSet`;
    },
    enableCache: false,
  });

  return requestData<AfisEMandateSource>(config);
}

async function updateAfisEMandate(
  payload: AfisEMandateUpdatePayload,
  transform?: (data: unknown) => Partial<AfisEMandateFrontend>
) {
  const config = await getAfisApiConfig({
    method: 'PUT',
    data: payload,
    enableCache: false,
    formatUrl: ({ url }) => {
      return `${url}/ChangeMandate/ZGW_FI_MANDATE_SRV_01/Mandate_changeSet(IMandateId='${payload.IMandateId}')`;
    },
    transformResponse: transform,
  });

  return requestData<unknown>(config);
}

function getStatusChangeApiUrl(
  sessionID: SessionID,
  afisEMandateSource: AfisEMandateSource
) {
  const changeToStatus = isEmandateActive(afisEMandateSource.LifetimeTo)
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

  return generateFullApiUrlBFF(routes.protected.AFIS_EMANDATES_STATUS_CHANGE, [
    {
      payload: encryptPayloadAndSessionID(sessionID, statusChangePayloadData),
    },
  ]);
}

function getSignRequestApiUrl(
  sessionID: SessionID,
  businessPartnerId: BusinessPartnerId,
  creditor: AfisEMandateCreditor
) {
  const signRequestPayload: EMandateSignRequestPayload = {
    creditorIBAN: creditor.iban,
    businessPartnerId: businessPartnerId,
    eMandateSignDate: new Date().toISOString(),
  };

  const url = generateFullApiUrlBFF(
    routes.protected.AFIS_EMANDATES_SIGN_REQUEST_URL,
    [
      {
        payload: encryptPayloadAndSessionID(sessionID, signRequestPayload),
      },
    ]
  );

  return url;
}

function getUpdateApiUrl(
  sessionID: SessionID,
  afisEMandateSource: AfisEMandateSource
) {
  const url = generateFullApiUrlBFF(
    routes.protected.AFIS_EMANDATES_UPDATE_LIFETIME,
    [
      {
        payload: encryptPayloadAndSessionID(sessionID, {
          IMandateId: afisEMandateSource.IMandateId.toString(),
        }),
      },
    ]
  );

  return url;
}

function addEmandateApiUrls(
  sessionID: SessionID,
  businessPartnerId: BusinessPartnerId,
  eMandate: AfisEMandateFrontend,
  creditor: AfisEMandateCreditor,
  afisEMandateSource?: AfisEMandateSource
) {
  if (afisEMandateSource?.IMandateId) {
    eMandate.statusChangeUrl = getStatusChangeApiUrl(
      sessionID,
      afisEMandateSource
    );
    eMandate.lifetimeUpdateUrl = getUpdateApiUrl(sessionID, afisEMandateSource);
  }

  eMandate.signRequestUrl = getSignRequestApiUrl(
    sessionID,
    businessPartnerId,
    creditor
  );
}

function transformEMandateSource(
  sessionID: SessionID,
  businessPartnerId: BusinessPartnerId,
  creditor: AfisEMandateCreditor,
  afisEMandateSource?: AfisEMandateSource
): Readonly<AfisEMandateFrontend> {
  const dateValidFrom = afisEMandateSource?.LifetimeFrom || null;
  const dateValidFromFormatted = dateValidFrom
    ? defaultDateFormat(dateValidFrom)
    : null;

  const dateValidTo = afisEMandateSource?.LifetimeTo || null;
  const dateValidToFormatted = getEmandateValidityDateFormatted(dateValidTo);

  const isActive = isEmandateActive(dateValidTo);
  const id = slug(creditor.name);
  const eMandate: AfisEMandateFrontend = {
    id,
    creditorName: creditor.name,
    creditorIBAN: creditor.iban,
    creditorDescription: creditor.description,
    senderIBAN: (isActive ? afisEMandateSource?.SndIban : null) ?? null,
    senderName: isActive
      ? [afisEMandateSource?.SndName1, afisEMandateSource?.SndName2]
          .filter(Boolean)
          .join(' ')
      : null, // Firstname + Lastname
    dateValidFrom,
    dateValidFromFormatted,
    dateValidTo,
    dateValidToFormatted,
    status: getEmandateStatus(dateValidTo),
    displayStatus: getEmandateDisplayStatus(
      dateValidTo,
      dateValidFromFormatted
    ),
    link: {
      to: `/facturen-en-betalen/betaalvoorkeuren/emandate/${id}`,
      title: creditor.name,
    },
  };

  addEmandateApiUrls(
    sessionID,
    businessPartnerId,
    eMandate,
    creditor,
    afisEMandateSource
  );

  return eMandate;
}

function getEMandateSourceByCreditor(
  sourceMandates: AfisEMandateSource[],
  creditor: AfisEMandateCreditor
): AfisEMandateSource | undefined {
  return sourceMandates.find((eMandateSource) => {
    return eMandateSource.SndDebtorId === creditor.refId;
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

  return EMandateCreditorsGemeenteAmsterdam.map((creditor) => {
    const afisEMandateSource = getEMandateSourceByCreditor(
      sourceMandates,
      creditor
    );

    const eMandate = transformEMandateSource(
      sessionID,
      businessPartnerId,
      creditor,
      afisEMandateSource
    );

    return eMandate;
  }).sort(
    firstBy(function sortByStatus(eMandate: AfisEMandateFrontend) {
      return eMandate.status === EMANDATE_STATUS.ON ? -1 : 1;
    }).thenBy('creditorName')
  );
}

export async function fetchEmandateIdByCreditorRefId(
  businessPartnerId: BusinessPartnerId,
  creditorRefID: AfisEMandateCreditor['refId']
): Promise<ApiResponse<AfisEMandateSource['IMandateId'] | null>> {
  const config = await getAfisApiConfig({
    formatUrl: ({ url }) => {
      return `${url}/Mandate/ZGW_FI_MANDATE_SRV_01/Mandate_readSet?$filter=SndId eq '${businessPartnerId}'`;
    },
    transformResponse: (responseData) => {
      const sourceMandates =
        getFeedEntryProperties<AfisEMandateSource>(responseData);
      return (
        sourceMandates.find((mandate) => mandate.SndDebtorId === creditorRefID)
          ?.IMandateId ?? null
      );
    },

    /**
     * We do not want to cache this request, because the e-mandates are updated without direct
     * user interaction.
     * If we would cache this request, the user would __not__ see the latest e-mandates.
     */
    enableCache: false,
  });

  return requestData<AfisEMandateSource['IMandateId'] | null>(config);
}

export async function fetchEMandates(
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
    /**
     * We do not want to cache this request, because the e-mandates are updated without direct
     * user interaction.
     * If we would cache this request, the user would __not__ see the latest e-mandates.
     */
    enableCache: false,
  });

  return requestData<AfisEMandateFrontend[] | null>(config);
}

function transformEMandatesRedirectUrlResponse(
  responseData: POMSignRequestUrlResponseSource
): AfisEMandateSignRequestResponse | null {
  if (responseData?.mpid) {
    return { redirectUrl: responseData.paylink };
  }
  return null;
}

function createEMandateSignRequestPayload(
  businessPartner: AfisBusinessPartnerDetailsTransformed,
  creditor: AfisEMandateCreditor,
  signRequestPayload: EMandateSignRequestPayload
): POMSignRequestUrlPayload {
  const returnUrl = generateFullApiUrlBFF(
    routeConfig.detailPageEMandate.path,
    [{ iban: creditor.iban }, { id: slug(creditor.name) }],
    getFromEnv('MA_FRONTEND_URL')
  );

  const today = new Date();
  const isoDateString = today.toISOString();
  const invoiceDate = isoDateFormat(today);
  const invoiceNumber = `EMandaat-${creditor.refId}-${invoiceDate}`;

  // TODO: Moet dit met een gegeven uit AFIS te koppelen zijn?
  const paymentReference = `${creditor.refId}-${businessPartner.businessPartnerId}`;
  const idBatch = `batch-${paymentReference}`;
  const idRequestClient = `${creditor.refId}-${businessPartner.businessPartnerId}-${isoDateString}`;

  // Paylinks are valid for 1 day
  const dueDate = add(today, {
    days: AFIS_EMANDATE_SIGN_REQUEST_URL_VALIDITY_IN_DAYS,
  })
    .toISOString()
    .split('T')[0];

  const concerning = `Automatische incasso ${creditor.name}`;

  return {
    first_name: businessPartner.firstName || 'Naam',
    last_name: businessPartner.lastName || 'Achternaam',
    debtor_number: businessPartner.businessPartnerId,
    payment_reference: paymentReference,
    concerning,
    batch_name: idBatch,
    request_id: idRequestClient,
    company_name: AFIS_EMANDATE_COMPANY_NAME,
    variable1: signRequestPayload.creditorIBAN,
    due_date: dueDate,
    return_url: returnUrl,
    cid: null,
    payment_modules: ['emandate_recurring'],
    invoices: [
      {
        invoice_number: invoiceNumber,
        invoice_date: invoiceDate,
        invoice_description: concerning,
        invoice_amount: 0,
        invoice_due_date: dueDate,
      },
    ],
  };
}

export async function fetchEmandateSignRequestRedirectUrlFromPaymentProvider(
  eMandateSignRequestPayload: EMandateSignRequestPayload
) {
  const creditor = EMandateCreditorsGemeenteAmsterdam.find(
    (creditor) => creditor.iban === eMandateSignRequestPayload.creditorIBAN
  );

  if (!creditor) {
    return apiErrorResult(
      'Creditor not found',
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
      return `${url}/v3/paylinks`;
    },
    transformResponse: transformEMandatesRedirectUrlResponse,
    data: createEMandateSignRequestPayload(
      businessPartnerResponse.content,
      creditor,
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

export async function changeEMandateStatus(
  eMandateStatusChangePayload: EMandateStatusChangePayload
) {
  function transformResponse() {
    const dateValidTo = eMandateStatusChangePayload?.LifetimeTo || null;
    const dateValidToFormatted = getEmandateValidityDateFormatted(dateValidTo);
    const dateValidFrom = eMandateStatusChangePayload?.LifetimeFrom || null;
    const dateValidFromFormatted =
      getEmandateValidityDateFormatted(dateValidFrom);
    return {
      dateValidTo,
      dateValidToFormatted,
      status: getEmandateStatus(dateValidTo),
      displayStatus: getEmandateDisplayStatus(
        dateValidTo,
        dateValidFromFormatted
      ),
    };
  }
  return updateAfisEMandate(eMandateStatusChangePayload, transformResponse);
}

export async function handleEmandateLifetimeUpdate(
  eMandateStatusChangePayload: EMandateUpdatePayload,
  _authProfile: AuthProfile,
  req: Request
) {
  const eMandateUploadPayload = z.object({
    LifetimeTo: z.iso.date().refine((isoDate) => {
      // The date must not be in the past.
      return isAfter(parseISO(isoDate), new Date());
    }),
    IMandateId: z.string(),
  });

  let payload: AfisEMandateUpdatePayload;

  try {
    payload = eMandateUploadPayload.parse({
      LifetimeTo: req.body.dateValidTo,
      ...eMandateStatusChangePayload,
    });
  } catch (error: unknown) {
    captureException(error);
    return apiErrorResult(
      !IS_AP
        ? z.prettifyError(error as z.ZodError)
        : 'Invalid request, failed to parse request body.',
      null,
      HttpStatusCode.BadRequest
    );
  }

  function transformResponse() {
    const dateValidTo = payload.LifetimeTo || null;
    return {
      dateValidTo,
      dateValidToFormatted: getEmandateValidityDateFormatted(dateValidTo),
    };
  }

  return updateAfisEMandate(payload, transformResponse);
}

export const forTesting = {
  addEmandateApiUrls,
  changeEMandateStatus,
  createEMandate: createOrUpdateEMandateFromStatusNotificationPayload,
  createEMandateSignRequestPayload,
  fetchEMandates,
  fetchEmandateSignRequestRedirectUrlFromPaymentProvider,
  getEMandateSourceByCreditor,
  getSignRequestApiUrl,
  getStatusChangeApiUrl,
  getUpdateApiUrl,
  handleEmandateLifeTimeUpdate: handleEmandateLifetimeUpdate,
  transformEmandateSignRequestStatus,
  transformEMandateSource,
  transformEMandatesRedirectUrlResponse,
  transformEMandatesResponse,
  updateAfisEMandate,
};
