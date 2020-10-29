import express, { NextFunction, Request, Response } from 'express';

import VergunningenDocuments from './json/vergunningen-documenten.json';

export const routerDevelopment = express.Router();

routerDevelopment.get(
  '/decosjoin/listdocuments/:key',
  (req: Request, res: Response, next: NextFunction) => {
    res.json(VergunningenDocuments).end();
  }
);

routerDevelopment.get(
  '/focus/stadspas/transactions/:id',
  (req: Request, res: Response, next: NextFunction) => {
    res.json([]).end();
  }
);

routerDevelopment.post(
  '/brp/aantal_bewoners',
  (req: Request, res: Response, next: NextFunction) => {
    res.json({ residentCount: 3 }).end();
  }
);
