import {
  fetchFOCUS,
  fetchWMO,
  fetchERFPACHT,
  fetchBELASTING,
  fetchMILIEUZONE,
} from './index';
import { dataCache } from './sourceApiResponseCache';
import { entries } from '../../universal/helpers';

const config = {
  FOCUS: fetchFOCUS,
  WMO: fetchWMO,
  ERFPACHT: fetchERFPACHT,
  BELASTINGEN: fetchBELASTING,
  MILIEUZONE: fetchMILIEUZONE,
};

export async function loadServicesDirect(sessionID: SessionID) {
  const configEntries = entries(config);

  // Cache the promises for re-use
  const promises = configEntries.map(([apiStateKey, fetchFn]) => {
    const promise = fetchFn();
    dataCache.add(sessionID, apiStateKey, promise);
    return promise;
  });

  // Create dynamic types for the given config
  type ApiConfig = typeof config;
  type ApiKey = keyof ApiConfig;
  type ApiData = ResolvedType<ReturnType<ApiConfig[ApiKey]>>;
  type ApiDataIndex = Record<ApiKey, ApiData>;

  // Load wait for all promises to be resolved
  // TODO: Fix by removin the as any assignment and use correct typing
  const resolvedPromises: ApiData[] = await Promise.all(promises as any);

  // combine resolved data into an index with the specific api keys
  const data = resolvedPromises.reduce<ApiDataIndex>((acc, data, index) => {
    const apiStateKey = configEntries[index][0];
    return Object.assign(acc, {
      [apiStateKey]: data,
    });
  }, {} as ApiDataIndex);

  return data;
}
