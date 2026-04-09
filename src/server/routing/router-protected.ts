import { HttpStatusCode } from 'axios';
import type { NextFunction, Request, Response } from 'express';

import { BffEndpoints } from './bff-routes.ts';
import {
  createBFFRouter,
  sendBadRequest,
  sendResponse,
  type RequestWithQueryParams,
  type ResponseAuthenticated,
} from './route-helpers.ts';
import type { streamEndpointQueryParamKeys } from '../../universal/config/app.ts';
import { IS_PRODUCTION } from '../../universal/config/env.ts';
import { FeatureToggle } from '../../universal/config/feature-toggles.ts';
import { setAdHocDependencyRequestCacheTtlMs } from '../config/source-api.ts';
import { afisRouter } from '../services/afis/afis-router.ts';
import { bezwarenRouter } from '../services/bezwaren/bezwaren-router.ts';
import { fetchLoodMetingDocument } from '../services/bodem/loodmetingen.ts';
import { brpRouter } from '../services/brp/brp-router.ts';
import {
  NOTIFICATIONS,
  loadServicesAll,
  loadServicesSSE,
} from '../services/controller.ts';
import {
  handleFetchDecosDocumentsList,
  fetchZaakByKey,
  fetchZakenByUserIDs,
} from '../services/decos/decos-route-handlers.ts';
import {
  fetchDecosDocument,
  fetchDecosWorkflows,
} from '../services/decos/decos-service.ts';
import { fetchErfpachtDossiersDetail as fetchErfpachtDossiersDetail } from '../services/erfpacht/erfpacht.ts';
import { hliRouter } from '../services/hli/hli-router.ts';
import { jzdRouter } from '../services/jzd/wmo-router.ts';
import { fetchDocument as fetchBBDocument } from '../services/powerbrowser/powerbrowser-service.ts';
import { attachDocumentDownloadRoute } from '../services/shared/document-download-route-handler.ts';
import { userFeedbackRouter } from '../services/user-feedback/user-feedback.router.ts';
import { fetchWpiDocument } from '../services/wpi/api-service.ts';

export const router = createBFFRouter({ id: 'router-protected' });

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

router.use(
  jzdRouter.protected,
  hliRouter.protected,
  brpRouter.protected,
  afisRouter.protected,
  bezwarenRouter.protected,
  userFeedbackRouter.protected
);

// Decos (Vergunningen, Horeca, Toeristische verhuur, Parkeren)
router.get(BffEndpoints.DECOS_DOCUMENTS_LIST, handleFetchDecosDocumentsList);

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
router.get(
  BffEndpoints.ERFPACHT_DOSSIER_DETAILS,
  async (req: Request<{ dossierId: string }>, res: ResponseAuthenticated) => {
    const response = await fetchErfpachtDossiersDetail(
      res.locals.authProfileAndToken,
      req.params.dossierId
    );

    return sendResponse(res, response);
  }
);

// Toeristische verhuur Bed and Breakfast
attachDocumentDownloadRoute(
  router,
  BffEndpoints.POWERBROWSER_DOCUMENT_DOWNLOAD,
  fetchBBDocument
);
