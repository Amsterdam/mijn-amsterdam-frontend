import { Request, Response } from 'express';
import { UserData } from '../config/app';
import { fetch as fetchAFVAL } from './afval';
import { fetch as fetchBAG } from './bag';
import { fetch as fetchBRP } from './brp';

export async function loadSessionData(userData: UserData) {
  const BRP = userData.BRP || (userData.BRP = await fetchBRP());
  const BAG = userData.BAG || (userData.BAG = await fetchBAG(BRP.adres));
  const AFVAL =
    userData.AFVAL || (userData.AFVAL = await fetchAFVAL(BAG.latlng));

  return {
    BRP,
    BAG,
    AFVAL,
  };
}

export async function handleRoute(req: Request, res: Response) {
  const userData = req.session!.userData as UserData;

  // const afvalData = await fetchAFVAL()

  const { BRP, BAG, AFVAL } = await loadSessionData(userData);

  return res.send({
    BAG,
    BRP,
    AFVAL,
  });
}
