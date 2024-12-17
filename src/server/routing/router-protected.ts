import express, { NextFunction, Request, Response } from 'express';

import { IS_OT } from '../../universal/config/env';
import { getAuth } from '../auth/auth-helpers';
import {
  fetchAantalBewoners,
  fetchVergunningenDocument,
  fetchVergunningenDocumentsList,
} from '../services';
import { BffEndpoints } from './bff-routes';
import { handleCheckProtectedRoute, isAuthenticated } from './route-handlers';
import { sendUnauthorized } from './route-helpers';
import { HTTP_STATUS_CODES } from '../../universal/constants/errorCodes';
import { getFromEnv } from '../helpers/env';
import { fetchAfisBusinessPartnerDetails } from '../services/afis/afis-business-partner';
import { fetchAfisDocument } from '../services/afis/afis-documents';
import {
  changeEMandateStatus,
  fetchAfisEMandates,
  fetchEmandateRedirectUrlFromProvider,
  fetchEmandateSignRequestStatus,
} from '../services/afis/afis-e-mandates';
import {
  AfisFacturenRouteParams,
  handleAfisRequestWithEncryptedPayloadQueryParam,
  handleFetchAfisFacturen,
} from '../services/afis/afis-route-handlers';
import {
  BusinessPartnerIdPayload,
  EMandateSignRequestPayload,
  EMandateSignRequestStatusPayload,
  EMandateStatusChangePayload,
} from '../services/afis/afis-types';
import {
  fetchBezwaarDetail,
  fetchBezwaarDocument,
} from '../services/bezwaren/bezwaren';
import { fetchLoodMetingDocument } from '../services/bodem/loodmetingen';
import {
  NOTIFICATIONS,
  loadServicesAll,
  loadServicesSSE,
} from '../services/controller';
import { fetchDecosDocument } from '../services/decos/decos-service';
import {
  fetchZorgnedAVDocument,
  handleBlockStadspas,
  handleFetchTransactionsRequest,
} from '../services/hli/hli-route-handlers';
import { attachDocumentDownloadRoute } from '../services/shared/document-download-route-handler';
import { fetchErfpachtV2DossiersDetail } from '../services/simple-connect/erfpacht';
import { fetchBBDocument } from '../services/toeristische-verhuur/toeristische-verhuur-powerbrowser-bb-vergunning';
import {
  fetchVergunningDetail,
  fetchZakenFromSource,
} from '../services/vergunningen-v2/vergunningen-route-handlers';
import { fetchZorgnedJZDDocument } from '../services/wmo/wmo-route-handlers';
import { fetchWpiDocument } from '../services/wpi/api-service';

export const router = express.Router();

router.BFF_ID = 'router-protected';

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
      const response = await NOTIFICATIONS(res.locals.requestID, req);
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
  (req: Request, res: Response, next: NextFunction) => {
    // See https://nodejs.org/api/net.html#net_socket_setnodelay_nodelay
    req.socket.setNoDelay(true);
    // Tell the client we respond with an event stream
    res.writeHead(HTTP_STATUS_CODES.OK, {
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

router.get(
  BffEndpoints.MKS_AANTAL_BEWONERS,
  async (req: Request, res: Response) => {
    const authProfileAndToken = getAuth(req);

    if (authProfileAndToken) {
      const bewonersResponse = await fetchAantalBewoners(
        res.locals.requestID,
        authProfileAndToken,
        req.params.addressKeyEncrypted
      );

      return res.send(bewonersResponse);
    }
    return sendUnauthorized(res);
  }
);

// Deprecated, will be removed in MIJN-8916
router.get(
  BffEndpoints.VERGUNNINGEN_LIST_DOCUMENTS,
  async (req: Request, res: Response) => {
    const authProfileAndToken = getAuth(req);

    if (authProfileAndToken) {
      const documentsListResponse = await fetchVergunningenDocumentsList(
        res.locals.requestID,
        authProfileAndToken,
        req.params.id
      );

      return res.send(documentsListResponse);
    }

    return sendUnauthorized(res);
  }
);

// Deprecated, will be removed in MIJN-8916
router.get(
  BffEndpoints.VERGUNNINGEN_DOCUMENT_DOWNLOAD,
  async (req: Request, res: Response) => {
    const authProfileAndToken = getAuth(req);
    if (authProfileAndToken) {
      const documentResponse = await fetchVergunningenDocument(
        res.locals.requestID,
        authProfileAndToken,
        req.params.id
      );

      const contentType = documentResponse.headers['content-type'];
      res.setHeader('content-type', contentType);
      return documentResponse.data.pipe(res);
    }
    return sendUnauthorized(res);
  }
);

// Vergunningen V2
if (IS_OT) {
  router.get(BffEndpoints.VERGUNNINGENv2_ZAKEN_SOURCE, fetchZakenFromSource);
}
router.get(BffEndpoints.VERGUNNINGENv2_DETAIL, fetchVergunningDetail);

attachDocumentDownloadRoute(
  router,
  BffEndpoints.VERGUNNINGENv2_DOCUMENT_DOWNLOAD,
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

router.get(
  BffEndpoints.BEZWAREN_DETAIL,
  async (req: Request, res: Response) => {
    const authProfileAndToken = getAuth(req);
    if (authProfileAndToken) {
      const response = await fetchBezwaarDetail(
        res.locals.requestID,
        authProfileAndToken,
        req.params.id
      );

      return res.send(response);
    }
    return sendUnauthorized(res);
  }
);

router.get(
  BffEndpoints.ERFPACHTv2_DOSSIER_DETAILS,
  async (req: Request, res: Response) => {
    const authProfileAndToken = getAuth(req);
    if (authProfileAndToken) {
      const response = await fetchErfpachtV2DossiersDetail(
        res.locals.requestID,
        authProfileAndToken,
        req.params.dossierNummerUrlParam
      );

      if (response.status === 'ERROR') {
        res.status(
          typeof response.code === 'number'
            ? response.code
            : HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR
        );
      }

      return res.send(response);
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
  type ServiceReturnType = ReturnType<typeof fetchAfisEMandates>;

  router.get(
    BffEndpoints.AFIS_EMANDATES,
    handleAfisRequestWithEncryptedPayloadQueryParam<
      QueryPayload,
      ServiceReturnType
    >(fetchAfisEMandates)
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
  // TODO: This is a temporary solution to redirect the user back to the frontend after signing the mandate.
  // This should be replaced with a proper solution.
  router.get(
    BffEndpoints.AFIS_EMANDATES_SIGN_REQUEST_RETURNTO,
    (req: Request, res: Response, next: NextFunction) => {
      return res.redirect(getFromEnv('MA_FRONTEND_URL') ?? '/');
    }
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
