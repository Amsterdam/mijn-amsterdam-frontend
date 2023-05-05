import type { RVVHeleStad } from '../../../server/services';
import { defaultDateFormat } from '../../../universal/helpers';
import { InfoDetail } from '../../components';

export function RvvHeleStad({ vergunning }: { vergunning: RVVHeleStad }) {
  const isAfgehandeld = vergunning.processed;

  return (
    <>
      <InfoDetail label="Kenmerk" value={vergunning.identifier} />

      <InfoDetail label="Kenteken(s)" value={vergunning.licencePlates || '-'} />

      <InfoDetail
        label="Van"
        value={
          vergunning.dateStart ? defaultDateFormat(vergunning.dateStart) : '-'
        }
      />

      <InfoDetail
        label="Tot en met"
        value={vergunning.dateEnd ? defaultDateFormat(vergunning.dateEnd) : '-'}
      />

      {isAfgehandeld && (
        <InfoDetail label="Resultaat" value={vergunning.decision} />
      )}
    </>
  );
}
