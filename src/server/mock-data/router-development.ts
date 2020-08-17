import express, { NextFunction, Request, Response } from 'express';

import VergunningenDocuments from './json/vergunningen-documenten.json';

export const routerDevelopment = express.Router();

routerDevelopment.get(
  '/decosjoin/listdocuments/:key',
  (req: Request, res: Response, next: NextFunction) => {
    res.json(VergunningenDocuments);
    next();
  }
);
