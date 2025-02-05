import { HttpStatusCode } from 'axios';
import express, { NextFunction, Request, Response } from 'express';

import { getAuth } from '../auth/auth-helpers';
import { fetchAantalBewoners } from '../services';
import { BffEndpoints } from './bff-routes';
import { handleCheckProtectedRoute, isAuthenticated } from './route-handlers';
import { sendUnauthorized } from './route-helpers';
import { fetchAfisDocument } from '../services/afis/afis-documents';
import {
  handleFetchAfisBusinessPartner,
  handleFetchAfisFacturen,
} from '../services/afis/afis-route-handlers';
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
import { fetchDecosDocumentsList } from '../services/decos/decos-route-handlers';
import { fetchDecosDocument } from '../services/decos/decos-service';
import {
  fetchZorgnedAVDocument,
  handleBlockStadspas,
  handleFetchTransactionsRequest,
} from '../services/hli/hli-route-handlers';
import { attachDocumentDownloadRoute } from '../services/shared/document-download-route-handler';
import { fetchErfpachtV2DossiersDetail } from '../services/simple-connect/erfpacht';
import { fetchBBDocument } from '../services/toeristische-verhuur/toeristische-verhuur-powerbrowser-bb-vergunning';

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

// Decos (Vergunningen, Horeca, Toeristische verhuur, Parkeren)
router.get(BffEndpoints.DECOS_DOCUMENTS_LIST, fetchDecosDocumentsList);

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
            : HttpStatusCode.InternalServerError
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
router.get(BffEndpoints.AFIS_BUSINESSPARTNER, handleFetchAfisBusinessPartner);
router.get(BffEndpoints.AFIS_FACTUREN, handleFetchAfisFacturen);
attachDocumentDownloadRoute(
  router,
  BffEndpoints.AFIS_DOCUMENT_DOWNLOAD,
  fetchAfisDocument
);
