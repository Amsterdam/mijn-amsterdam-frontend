import { Request, Response } from 'express';
import { UserData } from '../config/app';
import { fetch as fetchFOCUS } from './focus';
import { fetch as fetchWMO } from './wmo';

export async function loadSessionData(userData: UserData) {
  const FOCUS = userData.FOCUS || (userData.FOCUS = await fetchFOCUS());
  const WMO = userData.WMO || (userData.WMO = await fetchWMO());

  return {
    FOCUS,
    WMO,
  };
}

export async function handleRoute(req: Request, res: Response) {
  const userData = req.session!.userData as UserData;

  // const afvalData = await fetchAFVAL()

  const { FOCUS, WMO } = await loadSessionData(userData);

  return res.send({
    WMO,
    FOCUS,
  });
}
