import { Location } from './Location';
import type { GPP as GPPType } from '../../../server/services';
import InfoDetail from '../../components/InfoDetail/InfoDetail';

export function GPP({ vergunning }: { vergunning: GPPType }) {
  return (
    <>
      <InfoDetail label="Kenmerk" value={vergunning?.identifier || '-'} />
      {!!vergunning.location && <Location location={vergunning.location} />}
      <InfoDetail label="Kenteken" value={vergunning?.kenteken || '-'} />

      {!!vergunning?.decision && (
        <InfoDetail label="Resultaat" value={vergunning.decision} />
      )}
    </>
  );
}
