import { Request, Response } from 'express';
import { getOrAddDataLoader } from '../helpers/dataLoaderCache';
import { fetch as fetchAFVAL } from './afval';
import { fetch as fetchBAG } from './bag';
import { fetch as fetchBRP } from './brp';

export async function loadUserData(sessionID: SessionID) {
  const BRP = await getOrAddDataLoader(sessionID, 'BRP', fetchBRP());
  const BAG = await getOrAddDataLoader(sessionID, 'BAG', fetchBAG(BRP.adres));
  const AFVAL = await getOrAddDataLoader(
    sessionID,
    'AFVAL',
    fetchAFVAL(BAG.latlng)
  );

  return {
    BRP,
    BAG,
    AFVAL,
  };
}

export async function handleRoute(req: Request, res: Response) {
  const { BRP, BAG, AFVAL } = await loadUserData(req.sessionID!);

  return res.send({
    BAG,
    BRP,
    AFVAL,
  });
}
