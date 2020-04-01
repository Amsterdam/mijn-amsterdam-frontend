import { ApiStateKey, UserData } from '../config/app';

export const dataLoaderCache: Record<SessionID, UserData> = {};

function init(sessionID: SessionID) {
  if (!dataLoaderCache[sessionID]) {
    dataLoaderCache[sessionID] = {} as UserData;
  }
}

export function addDataLoader(
  sessionID: SessionID,
  apiStateKey: ApiStateKey,
  dataLoaderPromise: Promise<any>
) {
  init(sessionID);
  return (dataLoaderCache[sessionID][apiStateKey] = dataLoaderPromise);
}

export function getDataLoader(sessionID: SessionID, apiStateKey: ApiStateKey) {
  init(sessionID);
  return dataLoaderCache[sessionID][apiStateKey] || null;
}

export function getOrAddDataLoader(
  sessionID: SessionID,
  apiStateKey: ApiStateKey,
  dataLoaderPromise: Promise<any>
) {
  return (
    getDataLoader(sessionID, apiStateKey) ||
    addDataLoader(sessionID, apiStateKey, dataLoaderPromise)
  );
}

export function clearDataLoader(
  sessionID: SessionID,
  apiStateKey: ApiStateKey
) {
  init(sessionID);
  if (apiStateKey in dataLoaderCache[sessionID]) {
    delete dataLoaderCache[sessionID][apiStateKey];
  }
}

export function clearAll(sessionID: SessionID) {
  if (sessionID in dataLoaderCache) {
    delete dataLoaderCache[sessionID];
  }
}
