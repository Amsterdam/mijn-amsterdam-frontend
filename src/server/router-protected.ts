import * as Sentry from '@sentry/react';
import express, { NextFunction, Request, Response } from 'express';
import proxy from 'express-http-proxy';
import { IS_AZ } from '../universal/config/env';
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
import { isBlacklistedHandler } from './services/session-blacklist';
import {
  fetchSignalAttachments,
  fetchSignalHistory,
  fetchSignalsListByStatus,
} from './services/sia';
import { fetchErfpachtV2DossiersDetail } from './services/simple-connect/erfpacht';
import { fetchDocument } from './services/wmo/wmo-zorgned-service';
import { fetchTransacties } from './services/stadspas/stadspas-gpass-service';

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

// NOTE: Fix for legacy relayApi. WMONED api is archived and is not used anymore for downloads.
router.get(
  BffEndpoints.WMO_DOCUMENT_DOWNLOAD,
  async (req: Request, res: Response, next: NextFunction) => {
    const authProfileAndToken = await getAuth(req);
    const documentResponse = await fetchDocument(
      res.locals.requestID,
      authProfileAndToken,
      req.params.id
    );
    if (
      documentResponse.status === 'ERROR' ||
      !documentResponse.content?.data
    ) {
      res.status(500);
      return res.send(documentResponse);
    }

    res.type(documentResponse.content.mimetype ?? 'application/pdf');
    res.header(
      'Content-Disposition',
      `attachment; filename="${documentResponse.content.title}.pdf"`
    );
    return res.send(documentResponse.content.data);
  }
);

router.use(
  BffEndpoints.API_RELAY,
  proxy(
    (req: Request) => {
      let url = '';
      switch (true) {
        case req.path.startsWith('/decosjoin/'):
          url = String(process.env.BFF_VERGUNNINGEN_API_BASE_URL ?? '');
          break;
        case req.path.startsWith('/wpi/'):
          url = String(process.env.BFF_WPI_API_BASE_URL ?? '');
          break;
        case req.path.startsWith('/brp/'):
          url = String(process.env.BFF_MKS_API_BASE_URL ?? '');
          break;
      }
      return url;
    },
    {
      memoizeHost: false,
      proxyReqPathResolver: function (req) {
        return req.url;
      },
      proxyReqOptDecorator: async function (proxyReqOpts, srcReq) {
        const { token } = await getAuth(srcReq);
        const headers = proxyReqOpts.headers || {};
        headers['Authorization'] = `Bearer ${token}`;
        proxyReqOpts.headers = headers;
        return proxyReqOpts;
      },
      proxyErrorHandler: (err, res, next) => {
        Sentry.captureException(err);
        next();
      },
    }
  )
);

router.get(
  BffEndpoints.SIA_ATTACHMENTS,
  async (req: Request, res: Response) => {
    const authProfileAndToken = await getAuth(req);

    const attachmentsResponse = await fetchSignalAttachments(
      res.locals.requestID,
      authProfileAndToken,
      req.params.id
    );

    if (attachmentsResponse.status === 'ERROR') {
      res.status(500);
    }

    return res.send(attachmentsResponse);
  }
);

router.get(BffEndpoints.SIA_HISTORY, async (req: Request, res: Response) => {
  const authProfileAndToken = await getAuth(req);

  const attachmentsResponse = await fetchSignalHistory(
    res.locals.requestID,
    authProfileAndToken,
    req.params.id
  );

  if (attachmentsResponse.status === 'ERROR') {
    res.status(500);
  }

  return res.send(attachmentsResponse);
});

router.get(BffEndpoints.SIA_LIST, async (req: Request, res: Response) => {
  const authProfileAndToken = await getAuth(req);

  const siaResponse = await fetchSignalsListByStatus(
    res.locals.requestID,
    authProfileAndToken,
    {
      ...(pick(req.params, ['page', 'status']) as any),
      pageSize: '20',
    }
  );

  if (siaResponse.status === 'ERROR') {
    res.status(500);
  }

  return res.send(siaResponse);
});

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
  async (req: Request, res: Response) => {
    const authProfileAndToken = await getAuth(req);

    const documentResponse = await fetchBezwaarDocument(
      res.locals.requestID,
      authProfileAndToken,
      req.params.id
    );

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
      res.status(500);
    }

    return res.send(response);
  }
);

router.get(
  BffEndpoints.STADSPAS_TRANSACTIONS,
  async (req: Request, res: Response) => {
    const authProfileAndToken = await getAuth(req);
    const response = await fetchTransacties(
      res.locals.requestID,
      authProfileAndToken,
      req.params.transactionsKey
    );

    if (response.status === 'ERROR') {
      res.status(500);
    }

    return res.send(response);
  }
);
