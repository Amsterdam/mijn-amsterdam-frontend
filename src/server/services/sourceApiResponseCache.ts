import { ApiStateKey, BFFApiData } from '../../universal/config';
import { Deferred } from '../helpers/deferred';

type ApiLoaderDeferred = Deferred<BFFApiData[ApiStateKey]>;
type DataCache = Record<ApiStateKey, ApiLoaderDeferred>;

export const dataLoaderCache: Record<SessionID, DataCache> = {};

function init(sessionID: SessionID, apiStateKey: ApiStateKey) {
  if (!dataLoaderCache[sessionID]) {
    dataLoaderCache[sessionID] = {};
  }
  if (!dataLoaderCache[sessionID][apiStateKey]) {
    dataLoaderCache[sessionID][apiStateKey] = new Deferred();
  }
}

function add(
  sessionID: SessionID,
  apiStateKey: ApiStateKey,
  dataPromise: Promise<any>
) {
  init(sessionID, apiStateKey);
  // TODO: we might need something more controllable here...
  const deferred = dataLoaderCache[sessionID][apiStateKey];
  dataPromise.then(deferred.resolve);
  return deferred.promise;
}

function get(sessionID: SessionID, apiStateKey: ApiStateKey) {
  init(sessionID, apiStateKey);
  return dataLoaderCache[sessionID][apiStateKey].promise;
}

function clear(sessionID: SessionID, apiStateKey: ApiStateKey) {
  if (
    !!dataLoaderCache[sessionID] &&
    apiStateKey in dataLoaderCache[sessionID]
  ) {
    dataLoaderCache[sessionID][apiStateKey].reject();
    delete dataLoaderCache[sessionID][apiStateKey];
  }
}

function clearAll(sessionID: SessionID) {
  if (sessionID in dataLoaderCache) {
    const keys = Object.keys(dataLoaderCache[sessionID]);
    for (const key of keys) {
      clear(sessionID, key);
    }
    delete dataLoaderCache[sessionID];
  }
}

export const dataCache = {
  add,
  clear,
  clearAll,
  get,
};
