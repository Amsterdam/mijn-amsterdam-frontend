import express, { NextFunction, Request, Response } from 'express';
import path from 'path';
import VergunningenDocuments from './json/vergunningen-documenten.json';
import { apiSuccesResult } from '../../universal/helpers/api';

export const routerDevelopment = express.Router();

routerDevelopment.get(
  '/decosjoin/listdocuments/:key',
  (req: Request, res: Response, next: NextFunction) => {
    res.json(VergunningenDocuments).end();
  }
);

routerDevelopment.get(
  '/focus/document',
  (req: Request, res: Response, next: NextFunction) => {
    res.type('application/pdf');
    res.sendFile(path.join(__dirname, 'document.pdf'));
    // res.end();
  }
);

routerDevelopment.get(
  '/focus/stadspastransacties/:id',
  (req: Request, res: Response, next: NextFunction) => {
    res
      .json(
        apiSuccesResult([
          {
            id: 'xx1',
            title: 'Hema',
            amount: -31.3,
            date: '2020-01-04',
          },
          {
            id: 'xx2',
            title: 'Aktiesport',
            amount: 21.3,
            date: '2019-12-16',
          },
          {
            id: 'xx3',
            title: 'Hema',
            amount: -0.99,
            date: '2019-10-21',
          },
        ])
      )
      .end();
  }
);

routerDevelopment.post(
  '/brp/aantal_bewoners',
  (req: Request, res: Response, next: NextFunction) => {
    res.json({ residentCount: 3 }).end();
  }
);
