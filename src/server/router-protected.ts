import express, { NextFunction, Request, Response } from 'express';
import { IS_OT } from '../universal/config/env';
import { BffEndpoints } from './config';
import { getAuth, isAuthenticated, isProtectedRoute } from './helpers/app';
import {
  fetchAantalBewoners,
  fetchVergunningenDocument,
  fetchVergunningenDocumentsList,
} from './services';
import {
  fetchBezwaarDetail,
  fetchBezwaarDocument,
} from './services/bezwaren/bezwaren';
import { fetchLoodMetingDocument } from './services/bodem/loodmetingen';
import {
  NOTIFICATIONS,
  loadServicesAll,
  loadServicesSSE,
} from './services/controller';
import {
  fetchZorgnedAVDocument,
  handleFetchTransactionsRequest,
} from './services/hli/hli-route-handlers';
import { isBlacklistedHandler } from './services/session-blacklist';
import { attachDocumentDownloadRoute } from './services/shared/document-download-route-handler';
import { fetchErfpachtV2DossiersDetail } from './services/simple-connect/erfpacht';
import { fetchBBDocument } from './services/toeristische-verhuur/bb-vergunning';
import { fetchDecosDocument } from './services/vergunningen-v2/decos-service';
import {
  fetchVergunningDetail,
  fetchZakenFromSource,
} from './services/vergunningen-v2/vergunningen-route-handlers';
import { fetchZorgnedJZDDocument } from './services/wmo/wmo-route-handlers';
import { fetchWpiDocument } from './services/wpi/api-service';
import { handleFetchAfisBusinessPartner } from './services/afis/afis-route-handlers';
import { fetchSSOParkerenURL } from './services/parkeren/parkeren';

export const router = express.Router();

router.use(
  (req: Request, res: Response, next: NextFunction) => {
    // Skip router if we've entered a public route.
    if (!isProtectedRoute(req.path)) {
      return next('router');
    }
    return next();
  },
  isAuthenticated,
  isBlacklistedHandler
);

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
      const tips = response.content.filter(
        (notification) => notification.isTip
      );
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
    res.writeHead(200, {
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
    const authProfileAndToken = await getAuth(req);

    const bewonersResponse = await fetchAantalBewoners(
      res.locals.requestID,
      authProfileAndToken,
      req.params.addressKeyEncrypted
    );

    return res.send(bewonersResponse);
  }
);

router.get(BffEndpoints.PARKEREN_SSO_REDIRECT, fetchSSOParkerenURL);

// Deprecated, will be removed in MIJN-8916
router.get(
  BffEndpoints.VERGUNNINGEN_LIST_DOCUMENTS,
  async (req: Request, res: Response) => {
    const authProfileAndToken = await getAuth(req);

    const documentsListResponse = await fetchVergunningenDocumentsList(
      res.locals.requestID,
      authProfileAndToken,
      req.params.id
    );

    return res.send(documentsListResponse);
  }
);

// Deprecated, will be removed in MIJN-8916
router.get(
  BffEndpoints.VERGUNNINGEN_DOCUMENT_DOWNLOAD,
  async (req: Request, res: Response) => {
    const authProfileAndToken = await getAuth(req);

    const documentResponse = await fetchVergunningenDocument(
      res.locals.requestID,
      authProfileAndToken,
      req.params.id
    );

    const contentType = documentResponse.headers['content-type'];
    res.setHeader('content-type', contentType);
    documentResponse.data.pipe(res);
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
    const authProfileAndToken = await getAuth(req);
    const response = await fetchBezwaarDetail(
      res.locals.requestID,
      authProfileAndToken,
      req.params.id
    );

    return res.send(response);
  }
);

router.get(
  BffEndpoints.ERFPACHTv2_DOSSIER_DETAILS,
  async (req: Request, res: Response) => {
    const authProfileAndToken = await getAuth(req);
    const response = await fetchErfpachtV2DossiersDetail(
      res.locals.requestID,
      authProfileAndToken,
      req.params.dossierNummerUrlParam
    );

    if (response.status === 'ERROR') {
      res.status(typeof response.code === 'number' ? response.code : 500);
    }

    return res.send(response);
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

// HLI Regelingen / doc download
attachDocumentDownloadRoute(
  router,
  BffEndpoints.HLI_DOCUMENT_DOWNLOAD,
  fetchZorgnedAVDocument
);

// AFIS facturen en betalen
router.get(BffEndpoints.AFIS_BUSINESSPARTNER, handleFetchAfisBusinessPartner);
