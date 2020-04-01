import { Request, Response } from 'express';
import { UserData } from '../config/app';
import { getOrAddDataLoader } from '../helpers/dataLoaderCache';
import { entries } from '../helpers/utils';
import { fetch as fetchBELASTING } from './belasting';
import { fetch as fetchERFPACHT } from './erfpacht';
import { fetch as fetchFOCUS } from './focus';
import { fetch as fetchMILIEUZONE } from './milieuzone';
import { fetch as fetchWMO } from './wmo';

const userDataLoaderConfig = {
  FOCUS: fetchFOCUS,
  WMO: fetchWMO,
  ERFPACHT: fetchERFPACHT,
  BELASTING: fetchBELASTING,
  MILIEUZONE: fetchMILIEUZONE,
};

export function loadUserData(sessionID: SessionID) {
  const index: Partial<UserData> = {};

  entries(userDataLoaderConfig).forEach(([apiStateKey, fetch]) => {
    index[apiStateKey] = getOrAddDataLoader(sessionID, apiStateKey, fetch());
  });

  return index;
}

export async function handleRoute(req: Request, res: Response) {
  const userDataLoaders = loadUserData(req.sessionID!);

  Promise.all(Object.values(userDataLoaders)).then(
    ([FOCUS, WMO, ERFPACHT, BELASTING, MILIEUZONE]) => {
      res.send({
        FOCUS,
        WMO,
        ERFPACHT,
        BELASTING,
        MILIEUZONE,
      });
    }
  );
}
