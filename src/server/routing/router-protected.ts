import { HttpStatusCode } from 'axios';
import { NextFunction, Request, Response } from 'express';
import express from 'express';

import { BffEndpoints } from './bff-routes';
import { handleCheckProtectedRoute, isAuthenticated } from './route-handlers';
import {
  createBFFRouter,
  sendBadRequest,
  sendResponse,
  sendUnauthorized,
  type RequestWithQueryParams,
} from './route-helpers';
import type { streamEndpointQueryParamKeys } from '../../universal/config/app';
import { IS_PRODUCTION } from '../../universal/config/env';
import { FeatureToggle } from '../../universal/config/feature-toggles';
import { getAuth } from '../auth/auth-helpers';
import { setAdHocDependencyRequestCacheTtlMs } from '../config/source-api';
import { fetchAfisBusinessPartnerDetails } from '../services/afis/afis-business-partner';
import { fetchAfisDocument } from '../services/afis/afis-documents';
import {
  fetchEMandates,
  changeEMandateStatus,
  fetchEmandateRedirectUrlFromProvider,
  fetchEmandateSignRequestStatus,
  handleEmandateUpdate,
} from '../services/afis/afis-e-mandates';
import {
  handleAfisRequestWithEncryptedPayloadQueryParam,
  handleFetchAfisFacturen,
  type AfisFacturenRouteParams,
} from '../services/afis/afis-route-handlers';
import type {
  BusinessPartnerIdPayload,
  EMandateStatusChangePayload,
  EMandateSignRequestPayload,
  EMandateSignRequestStatusPayload,
  EMandateUpdatePayload,
} from '../services/afis/afis-types';
import { fetchBezwaarDocument } from '../services/bezwaren/bezwaren';
import { handleFetchBezwaarDetail } from '../services/bezwaren/bezwaren-route-handlers';
import { fetchLoodMetingDocument } from '../services/bodem/loodmetingen';
import {
  NOTIFICATIONS,
  loadServicesAll,
  loadServicesSSE,
} from '../services/controller';
import {
  fetchDecosDocumentsList,
  fetchZaakByKey,
  fetchZakenByUserIDs,
} from '../services/decos/decos-route-handlers';
import {
  fetchDecosDocument,
  fetchDecosWorkflows,
} from '../services/decos/decos-service';
import { fetchErfpachtDossiersDetail as fetchErfpachtDossiersDetail } from '../services/erfpacht/erfpacht';
import {
  fetchZorgnedAVDocument,
  handleBlockStadspas,
  handleFetchTransactionsRequest,
  handleUnblockStadspas,
} from '../services/hli/hli-route-handlers';
import { fetchZorgnedLLVDocument } from '../services/jeugd/route-handlers';
import { fetchAantalBewoners } from '../services/profile/brp';
import { attachDocumentDownloadRoute } from '../services/shared/document-download-route-handler';
import { fetchBBDocument } from '../services/toeristische-verhuur/toeristische-verhuur-powerbrowser-bb-vergunning';
import { fetchZorgnedJZDDocument } from '../services/wmo/wmo-route-handlers';
import { fetchWpiDocument } from '../services/wpi/api-service';

export const router = createBFFRouter({ id: 'router-protected' });

router.use(handleCheckProtectedRoute, isAuthenticated);

router.get(
  BffEndpoints.SERVICES_ALL,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const response = await loadServicesAll(req, res);
      return res.json(response);
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  BffEndpoints.SERVICES_TIPS,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const response = await NOTIFICATIONS(req);
      const tips =
        response.content?.filter((notification) => notification.isTip) ?? [];
      return res.json(tips);
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  BffEndpoints.SERVICES_STREAM,
  (
    req: RequestWithQueryParams<{
      [key in keyof typeof streamEndpointQueryParamKeys]: string;
    }>,
    res: Response,
    next: NextFunction
  ) => {
    if (
      'adHocDependencyRequestCacheTtlMs' in req.query &&
      FeatureToggle.adHocDependencyRequestCacheTtlMs
    ) {
      let adHocCacheTtlMs = undefined;

      if (req.query.adHocDependencyRequestCacheTtlMs) {
        adHocCacheTtlMs = parseInt(
          req.query.adHocDependencyRequestCacheTtlMs,
          10
        );
        if (adHocCacheTtlMs < 0 || isNaN(adHocCacheTtlMs)) {
          adHocCacheTtlMs = undefined;
        }
      }

      setAdHocDependencyRequestCacheTtlMs(adHocCacheTtlMs);
    }
    return next();
  },
  (req: Request, res: Response) => {
    // See https://nodejs.org/api/net.html#net_socket_setnodelay_nodelay
    req.socket.setNoDelay(true);
    // Tell the client we respond with an event stream
    res.writeHead(HttpStatusCode.Ok, {
      'Content-type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    });

    res.write('retry: 1000\n');
    loadServicesSSE(req, res);
  }
);

////////////////////////////////////////////////////
//// BFF Service Api Endpoints /////////////////////
////////////////////////////////////////////////////

// WMO Zorgned Doc download
attachDocumentDownloadRoute(
  router,
  BffEndpoints.WMO_DOCUMENT_DOWNLOAD,
  fetchZorgnedJZDDocument
);

// LLV Zorgned Doc download
attachDocumentDownloadRoute(
  router,
  BffEndpoints.LLV_DOCUMENT_DOWNLOAD,
  fetchZorgnedLLVDocument
);

router.get(
  BffEndpoints.MKS_AANTAL_BEWONERS,
  async (req: Request, res: Response) => {
    const authProfileAndToken = getAuth(req);

    if (authProfileAndToken) {
      const bewonersResponse = await fetchAantalBewoners(
        authProfileAndToken,
        req.params.addressKeyEncrypted
      );

      return sendResponse(res, bewonersResponse);
    }
    return sendUnauthorized(res);
  }
);

// Decos (Vergunningen, Horeca, Toeristische verhuur, Parkeren)
router.get(BffEndpoints.DECOS_DOCUMENTS_LIST, fetchDecosDocumentsList);

if (!IS_PRODUCTION) {
  router.get(BffEndpoints.DECOS_ZAKEN_BY_USERIDS_RAW, fetchZakenByUserIDs);
  router.get(BffEndpoints.DECOS_ZAAK_BY_KEY_RAW, fetchZaakByKey);
  router.get(
    BffEndpoints.DECOS_WORKFLOW_BY_KEY_RAW,
    async (
      req: RequestWithQueryParams<{
        key: string;
      }>,
      res: Response
    ) => {
      if (!req.query.key) {
        return sendBadRequest(res, 'no zaak.key found in query');
      }
      sendResponse(res, await fetchDecosWorkflows(req.query.key));
    }
  );
}

attachDocumentDownloadRoute(
  router,
  BffEndpoints.DECOS_DOCUMENT_DOWNLOAD,
  fetchDecosDocument
);

attachDocumentDownloadRoute(
  router,
  BffEndpoints.WPI_DOCUMENT_DOWNLOAD,
  fetchWpiDocument
);

attachDocumentDownloadRoute(
  router,
  BffEndpoints.LOODMETING_DOCUMENT_DOWNLOAD,
  fetchLoodMetingDocument
);

attachDocumentDownloadRoute(
  router,
  BffEndpoints.BEZWAREN_DOCUMENT_DOWNLOAD,
  fetchBezwaarDocument
);

router.get(BffEndpoints.BEZWAREN_DETAIL, handleFetchBezwaarDetail);

router.get(
  BffEndpoints.ERFPACHT_DOSSIER_DETAILS,
  async (req: Request, res: Response) => {
    const authProfileAndToken = getAuth(req);
    if (authProfileAndToken) {
      const response = await fetchErfpachtDossiersDetail(
        authProfileAndToken,
        req.params.dossierNummerUrlParam
      );

      return sendResponse(res, response);
    }
    return sendUnauthorized(res);
  }
);

// Toeristische verhuur
attachDocumentDownloadRoute(
  router,
  BffEndpoints.TOERISTISCHE_VERHUUR_BB_DOCUMENT_DOWNLOAD,
  fetchBBDocument
);

// HLI Stadspas transacties
router.get(BffEndpoints.STADSPAS_TRANSACTIONS, handleFetchTransactionsRequest);
router.get(BffEndpoints.STADSPAS_BLOCK_PASS, handleBlockStadspas);
router.get(BffEndpoints.STADSPAS_UNBLOCK_PASS, handleUnblockStadspas);

// HLI Regelingen / doc download
attachDocumentDownloadRoute(
  router,
  BffEndpoints.HLI_DOCUMENT_DOWNLOAD,
  fetchZorgnedAVDocument
);

// AFIS facturen en betalen

{
  type QueryPayload = BusinessPartnerIdPayload;
  type ServiceReturnType = ReturnType<typeof fetchAfisBusinessPartnerDetails>;

  router.get(
    BffEndpoints.AFIS_BUSINESSPARTNER,
    handleAfisRequestWithEncryptedPayloadQueryParam<
      QueryPayload,
      ServiceReturnType
    >(fetchAfisBusinessPartnerDetails)
  );
}

{
  type QueryPayload = BusinessPartnerIdPayload;
  type ServiceReturnType = ReturnType<typeof fetchEMandates>;

  router.get(
    BffEndpoints.AFIS_EMANDATES,
    handleAfisRequestWithEncryptedPayloadQueryParam<
      QueryPayload,
      ServiceReturnType
    >(fetchEMandates)
  );
}

{
  type QueryPayload = EMandateStatusChangePayload;
  type ServiceReturnType = ReturnType<typeof changeEMandateStatus>;

  router.get(
    BffEndpoints.AFIS_EMANDATES_STATUS_CHANGE,
    handleAfisRequestWithEncryptedPayloadQueryParam<
      QueryPayload,
      ServiceReturnType
    >(changeEMandateStatus)
  );
}

{
  type QueryPayload = EMandateUpdatePayload;
  type ServiceReturnType = ReturnType<typeof handleEmandateUpdate>;

  router.post(
    BffEndpoints.AFIS_EMANDATES_UPDATE,
    express.urlencoded({ extended: true }),
    handleAfisRequestWithEncryptedPayloadQueryParam<
      QueryPayload,
      ServiceReturnType
    >(handleEmandateUpdate)
  );
}

{
  type QueryPayload = EMandateSignRequestPayload;
  type ServiceReturnType = ReturnType<
    typeof fetchEmandateRedirectUrlFromProvider
  >;

  router.get(
    BffEndpoints.AFIS_EMANDATES_SIGN_REQUEST_URL,
    handleAfisRequestWithEncryptedPayloadQueryParam<
      QueryPayload,
      ServiceReturnType
    >(fetchEmandateRedirectUrlFromProvider)
  );
}

{
  type QueryPayload = EMandateSignRequestStatusPayload;
  type ServiceReturnType = ReturnType<typeof fetchEmandateSignRequestStatus>;

  router.get(
    BffEndpoints.AFIS_EMANDATES_SIGN_REQUEST_STATUS,
    handleAfisRequestWithEncryptedPayloadQueryParam<
      QueryPayload,
      ServiceReturnType
    >(fetchEmandateSignRequestStatus)
  );
}

{
  type QueryPayload = BusinessPartnerIdPayload;
  type ServiceReturnType = ReturnType<typeof handleFetchAfisFacturen>;

  router.get(
    BffEndpoints.AFIS_FACTUREN,
    handleAfisRequestWithEncryptedPayloadQueryParam<
      QueryPayload,
      ServiceReturnType,
      AfisFacturenRouteParams
    >(handleFetchAfisFacturen)
  );
}

attachDocumentDownloadRoute(
  router,
  BffEndpoints.AFIS_DOCUMENT_DOWNLOAD,
  fetchAfisDocument
);
router.get(BffEndpoints.AFIS_FACTUREN, handleFetchAfisFacturen);
