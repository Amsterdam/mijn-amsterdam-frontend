import { ApiStateKey, BFFApiData } from '../../universal/config';

type DataCache = Record<ApiStateKey, Promise<BFFApiData[ApiStateKey]>>;

export const dataLoaderCache: Record<SessionID, DataCache> = {};

function init(sessionID: SessionID) {
  if (!dataLoaderCache[sessionID]) {
    dataLoaderCache[sessionID] = {};
  }
}

function add(
  sessionID: SessionID,
  apiStateKey: ApiStateKey,
  dataPromise: Promise<any>
) {
  init(sessionID);
  return (dataLoaderCache[sessionID][apiStateKey] = dataPromise);
}

function get(sessionID: SessionID, apiStateKey: ApiStateKey) {
  init(sessionID);
  return dataLoaderCache[sessionID][apiStateKey] || Promise.resolve(null);
}

function clear(sessionID: SessionID, apiStateKey: ApiStateKey) {
  init(sessionID);
  if (apiStateKey in dataLoaderCache[sessionID]) {
    delete dataLoaderCache[sessionID][apiStateKey];
  }
}

function clearAll(sessionID: SessionID) {
  if (sessionID in dataLoaderCache) {
    delete dataLoaderCache[sessionID];
  }
}

export const dataCache = {
  add,
  clear,
  clearAll,
  get,
};
