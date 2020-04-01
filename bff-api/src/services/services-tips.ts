import { Request, Response } from 'express';
import { loadUserData as loadServicesDirect } from './services-direct';
import { loadUserData as loadServicesRelated } from './services-related';

export interface TIPSData {}

export async function handleRoute(req: Request, res: Response) {
  const relatedServicesData = await loadServicesRelated(req.sessionID!);
  const directServicesData = await loadServicesDirect(req.sessionID!);

  return res.send({
    ...relatedServicesData,
    ...directServicesData,
  });
}
