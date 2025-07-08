import { HttpStatusCode } from 'axios';
import { NextFunction, Request, Response } from 'express';
import net from 'node:net';

import { BffEndpoints } from './bff-routes.ts';
import {
  handleCheckProtectedRoute,
  isAuthenticated,
} from './route-handlers.ts';
import {
  createBFFRouter,
  sendBadRequest,
  sendResponse,
  sendUnauthorized,
  type RequestWithQueryParams,
} from './route-helpers.ts';
import type { streamEndpointQueryParamKeys } from '../../universal/config/app.ts';
import { IS_DEVELOPMENT, IS_PRODUCTION } from '../../universal/config/env.ts';
import { FeatureToggle } from '../../universal/config/feature-toggles.ts';
import { getAuth } from '../auth/auth-helpers.ts';
import { setAdHocDependencyRequestCacheTtlMs } from '../config/source-api.ts';
import { fetchAfisDocument } from '../services/afis/afis-documents.ts';
import {
  handleFetchAfisBusinessPartner,
  handleFetchAfisFacturen,
} from '../services/afis/afis-route-handlers.ts';
import { handleFetchBezwaarDetail } from '../services/bezwaren/bezwaren-route-handlers.ts';
import { fetchBezwaarDocument } from '../services/bezwaren/bezwaren.ts';
import { fetchLoodMetingDocument } from '../services/bodem/loodmetingen.ts';
import {
  NOTIFICATIONS,
  loadServicesAll,
  loadServicesSSE,
} from '../services/controller.ts';
import {
  fetchDecosDocumentsList,
  fetchZaakByKey,
  fetchZakenByUserIDs,
} from '../services/decos/decos-route-handlers.ts';
import {
  fetchDecosDocument,
  fetchDecosWorkflows,
} from '../services/decos/decos-service.ts';
import { fetchErfpachtDossiersDetail as fetchErfpachtDossiersDetail } from '../services/erfpacht/erfpacht.ts';
import {
  fetchZorgnedAVDocument,
  handleBlockStadspas,
  handleFetchTransactionsRequest,
  handleUnblockStadspas,
} from '../services/hli/hli-route-handlers.ts';
import { fetchZorgnedLLVDocument } from '../services/jeugd/route-handlers.ts';
import { fetchAantalBewoners } from '../services/profile/brp.ts';
import { attachDocumentDownloadRoute } from '../services/shared/document-download-route-handler.ts';
import { fetchBBDocument } from '../services/toeristische-verhuur/toeristische-verhuur-powerbrowser-bb-vergunning.ts';
import { fetchZorgnedJZDDocument } from '../services/wmo/wmo-route-handlers.ts';
import { fetchWpiDocument } from '../services/wpi/api-service.ts';
import { logger } from '../logging.ts';

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
    _res: Response,
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
    console.log(req.socket instanceof net.Socket);
    // Deno uses a FakeSocket that does not have this method.
    if (req.socket.setNoDelay) {
      // RP TODO: Just here to check if we have a Socket instance outside of our development environment.
      logger.info("Nagle's algorithm disabled.");
      req.socket.setNoDelay();
    } else if (!IS_DEVELOPMENT) {
      logger.error(
        "req.socket.setNoDelay is not called since it does not exist. Streaming with Nagle's algorithm is enabled."
      );
    }

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
router.get(BffEndpoints.AFIS_BUSINESSPARTNER, handleFetchAfisBusinessPartner);
router.get(BffEndpoints.AFIS_FACTUREN, handleFetchAfisFacturen);
attachDocumentDownloadRoute(
  router,
  BffEndpoints.AFIS_DOCUMENT_DOWNLOAD,
  fetchAfisDocument
);
