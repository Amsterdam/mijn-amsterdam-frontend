import { BFFApiData } from '../../universal/config';
import { entries } from '../../universal/helpers';
import {
  dataCache,
  fetchBELASTING,
  fetchERFPACHT,
  fetchFOCUS,
  fetchMILIEUZONE,
  fetchWMO,
} from './index';

const userDataLoaderConfig = {
  FOCUS: fetchFOCUS,
  WMO: fetchWMO,
  ERFPACHT: fetchERFPACHT,
  BELASTINGEN: fetchBELASTING,
  MILIEUZONE: fetchMILIEUZONE,
};

export function loadServicesDirect(sessionID: SessionID) {
  const index: Partial<BFFApiData> = {};

  entries(userDataLoaderConfig).forEach(([apiStateKey, fetch]) => {
    index[apiStateKey] = dataCache.getOrAdd(sessionID, apiStateKey, fetch());
  });

  return index;
}
