import { HttpStatusCode } from 'axios';
import { NextFunction, Request, Response } from 'express';

import { BffEndpoints } from './bff-routes';
import {
  createBFFRouter,
  sendBadRequest,
  sendResponse,
  type RequestWithQueryParams,
  type ResponseAuthenticated,
} from './route-helpers';
import type { streamEndpointQueryParamKeys } from '../../universal/config/app';
import { IS_PRODUCTION } from '../../universal/config/env';
import { FeatureToggle } from '../../universal/config/feature-toggles';
import { setAdHocDependencyRequestCacheTtlMs } from '../config/source-api';
import { fetchAfisDocument } from '../services/afis/afis-documents';
import {
  handleFetchAfisBusinessPartner,
  handleFetchAfisFacturen,
} from '../services/afis/afis-route-handlers';
import { fetchBezwaarDocument } from '../services/bezwaren/bezwaren';
import { handleFetchBezwaarDetail } from '../services/bezwaren/bezwaren-route-handlers';
import { fetchLoodMetingDocument } from '../services/bodem/loodmetingen';
import { brpRouter } from '../services/brp/brp-router';
import {
  NOTIFICATIONS,
  loadServicesAll,
  loadServicesSSE,
} from '../services/controller';
import {
  handleFetchDecosDocumentsList,
  fetchZaakByKey,
  fetchZakenByUserIDs,
} from '../services/decos/decos-route-handlers';
import {
  fetchDecosDocument,
  fetchDecosWorkflows,
} from '../services/decos/decos-service';
import { fetchErfpachtDossiersDetail as fetchErfpachtDossiersDetail } from '../services/erfpacht/erfpacht';
import { hliRouter } from '../services/hli/hli-router';
import { fetchZorgnedLLVDocument } from '../services/jeugd/route-handlers';
import { fetchDocument as fetchBBDocument } from '../services/powerbrowser/powerbrowser-service';
import { attachDocumentDownloadRoute } from '../services/shared/document-download-route-handler';
import { wmoRouter } from '../services/wmo/wmo-router';
import { fetchWpiDocument } from '../services/wpi/api-service';

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

router.use(wmoRouter.protected, hliRouter.protected, brpRouter.protected);

// LLV Zorgned Doc download
attachDocumentDownloadRoute(
  router,
  BffEndpoints.LLV_DOCUMENT_DOWNLOAD,
  fetchZorgnedLLVDocument
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

attachDocumentDownloadRoute(
  router,
  BffEndpoints.BEZWAREN_DOCUMENT_DOWNLOAD,
  fetchBezwaarDocument
);

router.get(BffEndpoints.BEZWAREN_DETAIL, handleFetchBezwaarDetail);

router.get(
  BffEndpoints.ERFPACHT_DOSSIER_DETAILS,
  async (req: Request, res: ResponseAuthenticated) => {
    const response = await fetchErfpachtDossiersDetail(
      res.locals.authProfileAndToken,
      req.params.dossierNummerUrlParam
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

// AFIS facturen en betalen
router.get(BffEndpoints.AFIS_BUSINESSPARTNER, handleFetchAfisBusinessPartner);
attachDocumentDownloadRoute(
  router,
  BffEndpoints.AFIS_DOCUMENT_DOWNLOAD,
  fetchAfisDocument
);
router.get(BffEndpoints.AFIS_FACTUREN, handleFetchAfisFacturen);
