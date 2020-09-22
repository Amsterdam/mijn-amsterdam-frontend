import express, { NextFunction, Request, Response } from 'express';

import VergunningenDocuments from './json/vergunningen-documenten.json';

export const routerDevelopment = express.Router();

routerDevelopment.get(
  '/decosjoin/listdocuments/:key',
  (req: Request, res: Response, next: NextFunction) => {
    setTimeout(() => {
      res.json(VergunningenDocuments).end();
    }, 2000);
  }
);

routerDevelopment.post(
  '/brp/aantal_bewoners',
  (req: Request, res: Response, next: NextFunction) => {
    setTimeout(() => {
      res.json({ residentCount: 3 }).end();
    }, 2000);
  }
);
