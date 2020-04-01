import { Request, Response } from 'express';
import { UserData } from '../config/app';
import { loadSessionData as loadServicesDirect } from './services-direct';
import { loadSessionData as loadServicesRelated } from './services-related';

export async function handleRoute(req: Request, res: Response) {
  const userData = req.session!.userData as UserData;

  // const afvalData = await fetchAFVAL()

  const relatedServicesData = await loadServicesRelated(userData);
  const directServicesData = await loadServicesDirect(userData);

  return res.send({
    ...relatedServicesData,
    ...directServicesData,
  });
}
