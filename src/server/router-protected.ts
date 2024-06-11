import express, { NextFunction, Request, Response } from 'express';
import proxy from 'express-http-proxy';
import { pick } from '../universal/helpers/utils';
import { BffEndpoints } from './config';
import { getAuth, isAuthenticated, isProtectedRoute } from './helpers/app';
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
import { captureException } from './services/monitoring';
import { isBlacklistedHandler } from './services/session-blacklist';
import { fetchErfpachtV2DossiersDetail } from './services/simple-connect/erfpacht';
import { fetchTransacties } from './services/stadspas/stadspas-gpass-service';
import { fetchBBDocument } from './services/toeristische-verhuur/bb-vergunning';

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

router.get(
  BffEndpoints.LOODMETING_DOCUMENT_DOWNLOAD,
  async (req: Request, res: Response) => {
    const authProfileAndToken = await getAuth(req);

    const documentResponse = await fetchLoodMetingDocument(
      res.locals.requestID,
      authProfileAndToken,
      req.params.id
    );

    if (
      documentResponse.status === 'ERROR' ||
      !documentResponse.content?.documentbody
    ) {
      return res.status(500).end();
    }

    res.type('application/pdf');
    res.header(
      'Content-Disposition',
      `attachment; filename="${documentResponse.content!.filename}.pdf"`
    );
    return res.send(
      Buffer.from(documentResponse.content.documentbody, 'base64')
    );
  }
);

router.get(
  BffEndpoints.BEZWAREN_DOCUMENT_DOWNLOAD,
  async (req: Request<{ id: string }>, res: Response) => {
    const authProfileAndToken = await getAuth(req);

    const documentResponse = await fetchBezwaarDocument(
      res.locals.requestID,
      authProfileAndToken,
      req.params.id
    );

    if (documentResponse.status === 'ERROR') {
      return res
        .status(
          typeof documentResponse.code === 'number'
            ? documentResponse.code
            : 500
        )
        .end();
    }

    const contentType = documentResponse.headers['content-type'];
    res.setHeader('content-type', contentType);
    documentResponse.data.pipe(res);
  }
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
      return res
        .status(typeof response.code === 'number' ? response.code : 500)
        .end();
    }

    return res.send(response);
  }
);

// Toeristische verhuur
router.get(
  BffEndpoints.TOERISTISCHE_VERHUUR_BB_DOCUMENT_DOWNLOAD,
  async (req: Request, res: Response) => {
    const authProfileAndToken = await getAuth(req);

    const documentResponse = await fetchBBDocument(
      res.locals.requestID,
      authProfileAndToken,
      req.params.docIdEncrypted
    );

    const contentType = documentResponse.headers['content-type'];
    res.setHeader('content-type', contentType);
    documentResponse.data.pipe(res);
  }
);

router.get(
  BffEndpoints.STADSPAS_TRANSACTIONS,
  async (req: Request<{ transactionsKey: string }>, res: Response) => {
    const authProfileAndToken = await getAuth(req);
    const response = await fetchTransacties(
      res.locals.requestID,
      authProfileAndToken,
      req.params.transactionsKey
    );

    if (response.status === 'ERROR') {
      return res
        .status(typeof response.code === 'number' ? response.code : 500)
        .end();
    }

    return res.send(response);
  }
);
