import express, { NextFunction, Request, Response } from 'express';
import proxy from 'express-http-proxy';
import { BFF_MS_API_BASE, BFF_MS_API_BASE_PATH, BffEndpoints } from './config';
import { getAuth, isAuthenticated, isProtectedRoute } from './helpers/app';
import { fetchBezwaarDocument } from './services/bezwaren/bezwaren';
import { fetchLoodMetingDocument } from './services/bodem/loodmetingen';
import { loadServicesAll, loadServicesSSE } from './services/controller';
import { fetchSignalAttachments, fetchSignalHistory } from './services/sia';

export const router = express.Router();

router.use((req: Request, res: Response, next: NextFunction) => {
  // Skip router if we've entered a public route.
  if (!isProtectedRoute(req.path)) {
    return next('router');
  }
  return next();
}, isAuthenticated());

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

router.use(
  BffEndpoints.API_RELAY,
  proxy(BFF_MS_API_BASE, {
    proxyReqPathResolver: function (req) {
      return BFF_MS_API_BASE_PATH + req.url;
    },
    proxyReqOptDecorator: async function (proxyReqOpts, srcReq) {
      const { token } = await getAuth(srcReq);
      const headers = proxyReqOpts.headers || {};
      headers['Authorization'] = `Bearer ${token}`;
      proxyReqOpts.headers = headers;
      return proxyReqOpts;
    },
  })
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

router.get(
  BffEndpoints.BEZWAREN_ATTACHMENTS,
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
  BffEndpoints.LOODMETING_ATTACHMENTS,
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
      return res.status(500);
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
