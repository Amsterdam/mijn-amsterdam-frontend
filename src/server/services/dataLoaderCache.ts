import { ApiStateKey, BFFApiData } from '../../universal/config';

export const dataLoaderCache: Record<SessionID, BFFApiData> = {};

function init(sessionID: SessionID) {
  if (!dataLoaderCache[sessionID]) {
    dataLoaderCache[sessionID] = {} as BFFApiData;
  }
}

function add(
  sessionID: SessionID,
  apiStateKey: ApiStateKey,
  dataLoaderPromise: Promise<any>
) {
  init(sessionID);
  return (dataLoaderCache[sessionID][apiStateKey] = dataLoaderPromise);
}

function get(sessionID: SessionID, apiStateKey: ApiStateKey) {
  init(sessionID);
  return dataLoaderCache[sessionID][apiStateKey] || null;
}

function getOrAdd(
  sessionID: SessionID,
  apiStateKey: ApiStateKey,
  dataLoaderPromise: Promise<any>
) {
  return (
    get(sessionID, apiStateKey) ||
    add(sessionID, apiStateKey, dataLoaderPromise)
  );
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
  getOrAdd,
};
