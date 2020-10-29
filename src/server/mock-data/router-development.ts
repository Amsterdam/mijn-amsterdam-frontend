import express, { NextFunction, Request, Response } from 'express';

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
  '/focus/stadspastransacties/:id',
  (req: Request, res: Response, next: NextFunction) => {
    res
      .json(
        apiSuccesResult([
          {
            id: 'xx1',
            title: 'Hema',
            amount: '31,30',
            date: '2020-01-04',
          },
          {
            id: 'xx2',
            title: 'Aktiesport',
            amount: '21,30',
            date: '2019-12-16',
          },
          {
            id: 'xx3',
            title: 'Hema',
            amount: '24,40',
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
