import { Location } from './Location';
import type { Flyeren as FlyerenVergunning } from '../../../server/services';
import { defaultDateFormat } from '../../../universal/helpers/date';
import { InfoDetail } from '../../components';
import { InfoDetailGroup } from '../../components/InfoDetail/InfoDetail';

// Controleren of van/tot dezelfde datum is, in dat geval niet de velden van/tot tonen.
// In dat geval allen de datum tonen.
export function Flyeren({ vergunning }: { vergunning: FlyerenVergunning }) {
  const isVerleend = vergunning.decision === 'Verleend';
  const isAfgehandeld = vergunning.status === 'Afgehandeld';
  const isSameDate =
    vergunning.dateStart === vergunning.dateEnd || vergunning.dateEnd === null;

  return (
    <>
      <InfoDetail label="Kenmerk" value={vergunning?.identifier || '-'} />
      {isVerleend && <Location location={vergunning.location} />}
      {isVerleend && !isSameDate && (
        <InfoDetailGroup>
          <InfoDetail
            label="Vanaf"
            value={
              vergunning?.dateStart
                ? defaultDateFormat(vergunning.dateStart)
                : '-'
            }
          />
          <InfoDetail
            label="Tot en met"
            value={
              vergunning?.dateEnd ? defaultDateFormat(vergunning.dateEnd) : '-'
            }
          />
          <InfoDetail
            label="Tussen"
            value={`${vergunning?.timeStart} - ${vergunning?.timeEnd} uur`}
          />
        </InfoDetailGroup>
      )}
      {isVerleend && isSameDate && (
        <InfoDetailGroup>
          <InfoDetail
            label="Op"
            value={
              vergunning?.dateStart
                ? defaultDateFormat(vergunning.dateStart)
                : '-'
            }
          />
          <InfoDetail
            label="Van"
            value={vergunning?.timeStart ? `${vergunning.timeStart} uur` : '-'}
          />
          <InfoDetail
            label="Tot"
            value={vergunning?.timeEnd ? `${vergunning.timeEnd} uur` : '-'}
          />
        </InfoDetailGroup>
      )}
      {isAfgehandeld && (
        <InfoDetail label="Resultaat" value={vergunning.decision} />
      )}
    </>
  );
}
