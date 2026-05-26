import cors from 'cors';
import express from 'express';
import type { NextFunction, Request, Response } from 'express';

import { logger } from './logger.ts';
import { registerRoutes } from './route-registry.ts';
import { loadRoutes } from './route-file-discovery.ts';
import { MOCK_PORT } from './settings.ts';

const app = express();

app.disable('x-powered-by');

app.use(
  cors({
    preflightContinue: false,
    origin: 'http://localhost:3000',
    credentials: true,
  })
);

app.use(express.json({ strict: false }));
app.use(express.urlencoded({ extended: true }));

app.use((req: Request, _res: Response, next: NextFunction) => {
  logger.info(
    {
      method: req.method,
      url: req.originalUrl,
    },
    'incoming request'
  );
  next();
});

const routes = await loadRoutes();

registerRoutes(app, routes);

app.use((_req: Request, res: Response) => {
  if (!res.headersSent) {
    res.status(404).send({ message: 'Mock route not found' });
    return;
  }
  res.end();
});

app.use(
  (err: Error, _req: Request, res: Response, _next: NextFunction): Response => {
    logger.error({ err }, 'unhandled mock server error');
    return res.status(500).send({ message: 'Internal mock server error' });
  }
);

app.listen(MOCK_PORT, () => {
  logger.info(`Mock server listening on port ${MOCK_PORT}`);
});
