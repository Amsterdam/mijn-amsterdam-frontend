import { HttpStatusCode } from 'axios';
import { add, isAfter, parseISO } from 'date-fns';
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
  AFIS_EMANDATE_COMPANY_NAME,
  AFIS_EMANDATE_RECURRING_DATE_END,
  AFIS_EMANDATE_SIGN_REQUEST_URL_VALIDITY_IN_DAYS,
  afisEMandatePostbodyStatic,
  EMandateCreditorsGemeenteAmsterdam,
  eMandateReceiver,
} from './afis-e-mandates-config';
import {
  debugEmandates,
  EMANDATE_STATUS_FRONTEND,
  formatBusinessPartnerId,
  getAfisApiConfig,
  getEmandateDisplayStatus,
  getEmandateStatusFrontend,
  getEmandateValidityDateFormatted,
  getFeedEntryProperties,
  isEmandateActive,
  type EmandateStatusFrontend,
} from './afis-helpers';
import {
  type AfisBusinessPartnerDetailsTransformed,
  type AfisEMandateCreatePayload,
  type AfisEMandatesResponseDataSource,
  type AfisEMandateUpdatePayload,
  type AfisEMandateFrontend,
  type AfisEMandateSignRequestResponse,
  type AfisEMandateSource,
  type AfisEMandateCreditor,
  type EMandateSignRequestPayload,
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
import { AuthProfile } from '../../auth/auth-types';
import { encryptPayloadAndSessionID } from '../../helpers/encrypt-decrypt';
import { getFromEnv } from '../../helpers/env';
import { getApiConfig } from '../../helpers/source-api-helpers';
import { requestData } from '../../helpers/source-api-request';
import { generateFullApiUrlBFF } from '../../routing/route-helpers';
import { captureException } from '../monitoring';
import { routes } from './afis-service-config';
import {
  isoDateFormat,
  isoDateTimeFormatCompact,
} from '../../../universal/helpers/date';
import { toDateFormatted } from '../../../universal/helpers/date';
import { sortByNumber } from '../../../universal/helpers/utils';

export async function createOrUpdateEMandateFromStatusNotificationPayload(
  payload: EMandateSignRequestPayload & EMandateSignRequestNotificationPayload
) {
  const creditor = EMandateCreditorsGemeenteAmsterdam.find(
    (creditor) => creditor.iban === payload.creditorIBAN
  );

  if (!creditor) {
    throw new Error(`Invalid creditor IBAN: ${payload.creditorIBAN}.`);
  }

  const businessPartnerId = formatBusinessPartnerId(payload.businessPartnerId);

  const businessPartnerResponse = await fetchAfisBusinessPartnerDetails({
    businessPartnerId,
  });

  debugEmandates(
    'Fetched business partner details for businessPartnerId %s with response: %o',
    businessPartnerId,
    businessPartnerResponse
  );

  if (businessPartnerResponse.status !== 'OK') {
    throw new Error(
      `Error fetching business partner details - ${'message' in businessPartnerResponse ? businessPartnerResponse.message : ''}`
    );
  }

  const businessPartnerDetails = businessPartnerResponse.content;
  const senderIBAN = payload.senderIBAN;
  const senderBIC = payload.senderBIC;

  // Check if this bank account exists in the sender's bank account list.
  // If not add it to the list.
  const bankAccountResponse = await fetchCheckIfIBANexists(
    senderIBAN,
    businessPartnerId
  );
  const bankAccountExists = bankAccountResponse.content === true;

  debugEmandates(
    'Checked if sender bank account exists for businessPartnerId %s with IBAN %s. Bank account exists: %s. Response: %o',
    businessPartnerId,
    senderIBAN,
    bankAccountExists,
    bankAccountResponse
  );

  if (bankAccountResponse.status !== 'OK') {
    throw new Error(
      `Error checking if bank account exists - ${'message' in bankAccountResponse ? bankAccountResponse.message : ''}`
    );
  }

  if (!bankAccountExists) {
    const bankAccountPayload: AfisBusinessPartnerBankPayload = {
      businessPartnerId,
      iban: senderIBAN,
      bic: senderBIC,
      swiftCode: senderBIC,
      senderName: payload.senderName,
    };

    const createBankAccountResponse =
      await createBusinessPartnerBankAccount(bankAccountPayload);

    debugEmandates(
      'Created sender bank account for businessPartnerId %s with payload: %o. Response: %o',
      businessPartnerId,
      bankAccountPayload,
      createBankAccountResponse
    );

    if (createBankAccountResponse.status !== 'OK') {
      throw new Error(
        `Error creating bank account - ${'message' in createBankAccountResponse ? createBankAccountResponse.message : ''}`
      );
    }
  }

  // We start the e-mandate lifetime with an end date far in the future.
  // The user can later adjust this date.
  const lifetimeTo = AFIS_EMANDATE_RECURRING_DATE_END;
  const houseNumber = businessPartnerDetails.address?.HouseNumber ?? '';
  const houseNumberSupplement =
    businessPartnerDetails.address?.HouseNumberSupplementText ?? '';

  const payloadCreateEmandate: AfisEMandateCreatePayload = {
    // Fixed values needed for API (black box)
    ...afisEMandatePostbodyStatic,

    // Gegevens van de crediteur van het EMandaat (De gemeente Amsterdam)
    ...eMandateReceiver,

    // Gegevens van de debiteur/afgever van het EMandaat
    SndId: businessPartnerId,

    // SndDebtorId is the reference ID of the creditor for this business partner.
    SndDebtorId: creditor.refId,

    // Gegevens geleverd door Debtor bank via EMandaat request
    SndIban: senderIBAN,
    SndBic: senderBIC,

    // These fields are always the same as BusinessPartnerDetails, not coupled to the bankaccount (IBAN) holder.
    SndCity: businessPartnerDetails.address?.CityName ?? '',
    SndCountry: businessPartnerDetails.address?.Country ?? '',
    SndHouse: `${houseNumber}${houseNumberSupplement ? ` ${houseNumberSupplement}` : ''}`,
    SndName1:
      payload.senderName ||
      businessPartnerDetails.firstName ||
      businessPartnerDetails.fullName ||
      '',
    SndName2: businessPartnerDetails.lastName ?? '',
    SndPostal: businessPartnerDetails.address?.PostalCode ?? '',
    SndStreet: businessPartnerDetails.address?.StreetName ?? '',

    SignDate: payload.eMandateSignDate,
    // This data is not available in the payload of the sign request status notification.
    // Therefore, we fill this field with the city of the municipality of Amsterdam.
    SignCity: eMandateReceiver.RecCity,
    LifetimeFrom: isoDateTimeFormatCompact(new Date()),
    LifetimeTo: lifetimeTo,
  };

  debugEmandates('Creating new e-mandate.', payloadCreateEmandate);

  const response = await createAfisEMandate(payloadCreateEmandate);

  debugEmandates('Create e-mandate response: %o', response);

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

  debugEmandates('Create e-mandate with payload: %o', payload);

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

  debugEmandates('Updating e-mandate with payload: %o', payload);

  return requestData<unknown>(config);
}

function getSignRequestApiUrl(
  sessionID: SessionID,
  businessPartnerId: BusinessPartnerId,
  creditor: AfisEMandateCreditor
) {
  const signRequestPayload: EMandateSignRequestPayload = {
    creditorIBAN: creditor.iban,
    businessPartnerId,
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

function getEmandateApiUrl(
  route: string,
  sessionID: SessionID,
  afisEMandateSource: AfisEMandateSource
) {
  const url = generateFullApiUrlBFF(route, [
    {
      payload: encryptPayloadAndSessionID(sessionID, {
        IMandateId: afisEMandateSource.IMandateId.toString(),
      }),
    },
  ]);

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
    eMandate.deactivateUrl = getEmandateApiUrl(
      routes.protected.AFIS_EMANDATES_DEACTIVATE,
      sessionID,
      afisEMandateSource
    );
    eMandate.lifetimeUpdateUrl = getEmandateApiUrl(
      routes.protected.AFIS_EMANDATES_UPDATE_LIFETIME,
      sessionID,
      afisEMandateSource
    );
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
  const dateValidFrom = afisEMandateSource?.LifetimeFrom
    ? isoDateFormat(afisEMandateSource.LifetimeFrom)
    : null;
  const dateValidFromFormatted = toDateFormatted(dateValidFrom);

  const dateValidTo = afisEMandateSource?.LifetimeTo
    ? isoDateFormat(afisEMandateSource.LifetimeTo)
    : null;
  const dateValidToFormatted = getEmandateValidityDateFormatted(dateValidTo);
  const currentStatus = (afisEMandateSource?.Status.toString() ??
    EMANDATE_STATUS_FRONTEND.OFF) as EmandateStatusFrontend;
  const isActive = isEmandateActive(dateValidTo);
  const id = slug(creditor.name);
  const eMandate: AfisEMandateFrontend = {
    id,
    eMandateIdSource: afisEMandateSource?.IMandateId ?? null,
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
    status: getEmandateStatusFrontend(currentStatus, dateValidTo),
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
  sourceMandatesASC: AfisEMandateSource[],
  creditor: AfisEMandateCreditor
): AfisEMandateSource | undefined {
  return sourceMandatesASC.findLast((eMandateSource) => {
    return eMandateSource.SndDebtorId === creditor.refId;
  });
}

function transformEMandatesResponse(
  responseData: AfisEMandatesResponseDataSource,
  sessionID: SessionID,
  businessPartnerId: BusinessPartnerId
): AfisEMandateFrontend[] {
  const sourceMandatesASC = getFeedEntryProperties(responseData).toSorted(
    sortByNumber('IMandateId', 'asc')
  );

  return EMandateCreditorsGemeenteAmsterdam.map((creditor) => {
    const afisEMandateSource = getEMandateSourceByCreditor(
      sourceMandatesASC,
      creditor
    );

    const eMandate = transformEMandateSource(
      sessionID,
      businessPartnerId,
      creditor,
      afisEMandateSource
    );

    return eMandate;
  }).toSorted(
    firstBy(function sortByStatus(eMandate: AfisEMandateFrontend) {
      return eMandate.status.toString() === EMANDATE_STATUS_FRONTEND.ON
        ? -1
        : 1;
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
        sourceMandates
          .toSorted(sortByNumber('IMandateId', 'asc'))
          .findLast((mandate) => mandate.SndDebtorId === creditorRefID)
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
    validateStatus(status) {
      // Afis api's are wired through a proxy that handles errors poorly. The SAP api responds with a 400 error that is translated to a 500 error by the proxy.
      return (
        status === HttpStatusCode.Ok ||
        status === HttpStatusCode.InternalServerError
      );
    },
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
  if (responseData?.paylink) {
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

  // Required property in the sign request payload to create a unique payment reference for the E-Mandate sign request.
  const paymentReference = `${creditor.refId}-${businessPartner.businessPartnerId}`;
  const idBatch = `mijnamsterdam-emandates-batch-${isoDateFormat(today)}`;
  const idRequestClient = `${creditor.refId}-${businessPartner.businessPartnerId}-${isoDateString}`;

  // Paylinks are valid for 1 day
  const dueDate = add(today, {
    days: AFIS_EMANDATE_SIGN_REQUEST_URL_VALIDITY_IN_DAYS,
  })
    .toISOString()
    .split('T')[0];

  const concerning = `Automatische incasso ${creditor.name}`;

  return {
    last_name:
      businessPartner.lastName || businessPartner.fullName || 'Achternaam',
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
    // The Payment provider API cannot handle an E-Mandate request without at least 1 invoice, even if the invoice is not relevant for the E-Mandate.
    // Therefore we add a dummy invoice with the most basic data possible.
    invoices: [
      {
        invoice_number: invoiceNumber,
        invoice_date: invoiceDate,
        invoice_description: concerning,
        invoice_amount: 1,
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

export async function deactivateEmandate(
  eMandateStatusChangePayload: EMandateUpdatePayload
) {
  const now = new Date();
  // The PUT endpoint does not reply with data. Only a status.
  // So we derive the new status from the change payload.
  const LifetimeTo = isoDateTimeFormatCompact(now);

  function transformResponse() {
    const dateValidTo = isoDateFormat(now);
    const dateValidToFormatted = getEmandateValidityDateFormatted(dateValidTo);
    const dateValidFrom = null;
    const dateValidFromFormatted =
      getEmandateValidityDateFormatted(dateValidFrom);
    return {
      dateValidTo,
      dateValidToFormatted,
      status: getEmandateStatusFrontend(
        EMANDATE_STATUS_FRONTEND.OFF,
        dateValidTo
      ),
      displayStatus: getEmandateDisplayStatus(
        dateValidTo,
        dateValidFromFormatted
      ),
    };
  }

  return updateAfisEMandate(
    { ...eMandateStatusChangePayload, LifetimeTo },
    transformResponse
  );
}

export async function handleEmandateLifetimeUpdate(
  eMandateStatusChangePayload: EMandateUpdatePayload,
  _authProfile: AuthProfile,
  req: Request
) {
  const eMandateUploadPayload = z.object({
    LifetimeTo: z.iso
      .date()
      .refine((isoDate) => {
        return isAfter(parseISO(isoDate), new Date());
      })
      .transform((isoDate) => isoDateTimeFormatCompact(isoDate)),
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
    const dateValidTo = payload.LifetimeTo
      ? isoDateFormat(payload.LifetimeTo)
      : null;
    return {
      dateValidTo,
      dateValidToFormatted: getEmandateValidityDateFormatted(dateValidTo),
    };
  }

  return updateAfisEMandate(payload, transformResponse);
}

export const forTesting = {
  addEmandateApiUrls,
  deactivateEmandate,
  createEMandate: createOrUpdateEMandateFromStatusNotificationPayload,
  createEMandateSignRequestPayload,
  fetchEMandates,
  fetchEmandateSignRequestRedirectUrlFromPaymentProvider,
  getEMandateSourceByCreditor,
  getSignRequestApiUrl,
  getEmandateApiUrl,
  handleEmandateLifeTimeUpdate: handleEmandateLifetimeUpdate,
  transformEmandateSignRequestStatus,
  transformEMandateSource,
  transformEMandatesRedirectUrlResponse,
  transformEMandatesResponse,
  updateAfisEMandate,
  createAfisEMandate,
};
