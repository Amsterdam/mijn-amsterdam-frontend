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

const configEntries = entries(config);

export async function loadServicesDirect(sessionID: SessionID) {
  // Cache the promises for re-use
  const promises = configEntries.map(([apiStateKey, fetchFn]) => {
    const promise = fetchFn();
    dataCache.add(sessionID, apiStateKey, promise);
    return promise;
  });

  // Create dynamic types for the given config
  type ApiConfig = typeof config;
  type ApiKey = keyof ApiConfig;
  type ApiData<K extends ApiKey> = ResolvedType<ReturnType<ApiConfig[K]>>;

  //  TODO: How to creatae this dynamically?
  type ApiDataIndex = {
    FOCUS: ApiData<'FOCUS'>;
    WMO: ApiData<'WMO'>;
    ERFPACHT: ApiData<'ERFPACHT'>;
    BELASTINGEN: ApiData<'BELASTINGEN'>;
    MILIEUZONE: ApiData<'MILIEUZONE'>;
  };

  // Load wait for all promises to be resolved
  // TODO: Fix by removin the as any assignment and use correct typing
  const resolvedPromises: ApiData<ApiKey>[] = await Promise.all(
    promises as any
  );

  // combine resolved data into an index with the specific api keys
  // TODO: How to assign ApiDataIndex automatically
  const data = resolvedPromises.reduce<ApiDataIndex>((acc, data, index) => {
    const apiStateKey = configEntries[index][0];
    return Object.assign(acc, {
      [apiStateKey]: data,
    });
  }, {} as ApiDataIndex);

  return data;
}
