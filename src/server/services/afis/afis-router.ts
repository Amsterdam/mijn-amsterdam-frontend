import express from 'express';

import { fetchAfisBusinessPartnerDetails } from './afis-business-partner';
import { fetchAfisDocument } from './afis-documents';
import {
  fetchEMandates,
  deactivateEmandate,
  handleEmandateLifetimeUpdate,
  fetchEmandateSignRequestRedirectUrlFromPaymentProvider,
} from './afis-e-mandates';
import {
  handleAfisEMandateSignRequestStatusNotification,
  handleAfisRequestWithEncryptedPayloadQueryParam,
  handleFetchAfisFacturen,
  type AfisFacturenRouteParams,
} from './afis-route-handlers';
import { routes } from './afis-service-config';
import type {
  BusinessPartnerIdPayload,
  EMandateLifetimeChangePayload,
  EMandateSignRequestPayload,
} from './afis-types';
import { createBFFRouter } from '../../routing/route-helpers';
import { attachDocumentDownloadRoute } from '../shared/document-download-route-handler';

const routerProtected = createBFFRouter({ id: 'afis-router-protected' });

/**
 * Fetches the Afis facturen PDF document download data.
 */
attachDocumentDownloadRoute(
  routerProtected,
  routes.protected.AFIS_DOCUMENT_DOWNLOAD,
  fetchAfisDocument
);

{
  /**
   * Fetches the business partner details for a given business partner ID.
   */
  type QueryPayload = BusinessPartnerIdPayload;
  type ServiceReturnType = ReturnType<typeof fetchAfisBusinessPartnerDetails>;

  routerProtected.get(
    routes.protected.AFIS_BUSINESSPARTNER,
    handleAfisRequestWithEncryptedPayloadQueryParam<
      QueryPayload,
      ServiceReturnType
    >(fetchAfisBusinessPartnerDetails, 'id')
  );
}

{
  /**
   * Fetches Afis Facturen for a given business partner ID.
   */
  type QueryPayload = BusinessPartnerIdPayload;
  type ServiceReturnType = ReturnType<typeof handleFetchAfisFacturen>;

  routerProtected.get(
    routes.protected.AFIS_FACTUREN,
    handleAfisRequestWithEncryptedPayloadQueryParam<
      QueryPayload,
      ServiceReturnType,
      AfisFacturenRouteParams
    >(handleFetchAfisFacturen, 'id')
  );
}

{
  /**
   * Fetches the E-mandates for a given business partner ID.
   */
  type QueryPayload = BusinessPartnerIdPayload;
  type ServiceReturnType = ReturnType<typeof fetchEMandates>;

  routerProtected.get(
    routes.protected.AFIS_EMANDATES,
    handleAfisRequestWithEncryptedPayloadQueryParam<
      QueryPayload,
      ServiceReturnType
    >(fetchEMandates, 'id')
  );
}

{
  /**
   * Used for the "Stopzetten" action.
   * Change the status of an E-mandate.
   * The status can be only be changed to OFF.
   */
  type QueryPayload = EMandateLifetimeChangePayload;
  type ServiceReturnType = ReturnType<typeof deactivateEmandate>;

  routerProtected.get(
    routes.protected.AFIS_EMANDATES_DEACTIVATE,
    handleAfisRequestWithEncryptedPayloadQueryParam<
      QueryPayload,
      ServiceReturnType
    >(deactivateEmandate)
  );
}

{
  /**
   * Used for the "Einddatum aanpassen" action.
   * Updates the end date of an E-mandate.
   */
  type QueryPayload = EMandateLifetimeChangePayload;
  type ServiceReturnType = ReturnType<typeof handleEmandateLifetimeUpdate>;

  routerProtected.post(
    routes.protected.AFIS_EMANDATES_UPDATE_LIFETIME,
    express.urlencoded({ extended: true }),
    handleAfisRequestWithEncryptedPayloadQueryParam<
      QueryPayload,
      ServiceReturnType
    >(handleEmandateLifetimeUpdate)
  );
}

{
  /**
   * Fetches the E-mandate sign request redirect URL from the payment provider.
   * This is used to initiate the E-mandate sign request flow.
   */
  type QueryPayload = EMandateSignRequestPayload;
  type ServiceReturnType = ReturnType<
    typeof fetchEmandateSignRequestRedirectUrlFromPaymentProvider
  >;

  routerProtected.get(
    routes.protected.AFIS_EMANDATES_SIGN_REQUEST_URL,
    handleAfisRequestWithEncryptedPayloadQueryParam<
      QueryPayload,
      ServiceReturnType
    >(fetchEmandateSignRequestRedirectUrlFromPaymentProvider)
  );
}

const routerPrivate = createBFFRouter({
  id: 'afis-router-private',
});

routerPrivate.post(
  routes.private.AFIS_EMANDATE_SIGN_REQUEST_STATUS_NOTIFY,
  handleAfisEMandateSignRequestStatusNotification
);

export const afisRouter = {
  private: routerPrivate,
  protected: routerProtected,
};

export const forTesting = {
  handleAfisEMandateSignRequestStatusNotify:
    handleAfisEMandateSignRequestStatusNotification,
};
