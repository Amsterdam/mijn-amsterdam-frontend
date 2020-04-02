import { dataCache, fetchAFVAL, fetchBAG, fetchBRP } from './index';

export async function loadServicesRelated(sessionID: SessionID) {
  const BRP = await dataCache.getOrAdd(sessionID, 'BRP', fetchBRP());
  const BAG = await dataCache.getOrAdd(sessionID, 'BAG', fetchBAG(BRP.adres));
  const AFVAL = await dataCache.getOrAdd(
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
