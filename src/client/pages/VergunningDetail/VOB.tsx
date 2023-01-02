import type { Ligplaatsvergunning } from '../../../server/services';
import { defaultDateFormat } from '../../../universal/helpers';
import InfoDetail from '../../components/InfoDetail/InfoDetail';
import { Location } from './Location';

export function VOB({ vergunning }: { vergunning: Ligplaatsvergunning }) {
  const isAfgehandeld = vergunning.processed;

  return (
    <>
      <InfoDetail label="Kenmerk" value={vergunning?.identifier || '-'} />
      {isAfgehandeld && (
        <InfoDetail label="Resultaat" value={vergunning.decision} />
      )}
      {!!vergunning.location && <Location location={vergunning.location} />}
      <InfoDetail
        label="Soort aanvraag"
        value={vergunning?.requestKind || '-'}
      />
      <InfoDetail label="Reden" value={vergunning?.reason || '-'} />
      <InfoDetail
        label="Tot en met"
        value={
          vergunning?.dateEnd ? defaultDateFormat(vergunning.dateEnd) : '-'
        }
      />
    </>
  );
}
