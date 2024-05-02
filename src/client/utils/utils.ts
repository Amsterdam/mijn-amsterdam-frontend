import { BFF_API_BASE_URL } from '../config/api';
import { WerkzaamhedenEnVervoerOpStraat } from '../../server/services';

export function relayApiUrl(path: string) {
  return `${BFF_API_BASE_URL}/relay${path}`;
}

export function hasMultiplePermits(vergunning: WerkzaamhedenEnVervoerOpStraat) {
  return (
    [
      vergunning.vezip || vergunning.rvv || vergunning.eRvv,
      vergunning.object,
      vergunning.parkingspace || vergunning.eParkingspace,
      vergunning.block,
      vergunning.night,
      vergunning.bicycleRack,
      vergunning.filming,
    ].filter(Boolean).length >= 2
  );
}
