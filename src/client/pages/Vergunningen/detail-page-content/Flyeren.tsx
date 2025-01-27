import { Location } from './Location';
import type {
  Flyeren,
  VergunningFrontendV2,
} from '../../../../server/services/vergunningen/config-and-types';
import { defaultDateFormat } from '../../../../universal/helpers/date';
import { InfoDetail } from '../../../components';
import { InfoDetailGroup } from '../../../components/InfoDetail/InfoDetail';

// Controleren of van/tot dezelfde datum is, in dat geval niet de velden van/tot tonen.
// In dat geval allen de datum tonen.
export function Flyeren({ vergunning }: { vergunning: VergunningFrontendV2 }) {
  const vergunningData = vergunning as VergunningFrontendV2<Flyeren>;
  const isVerleend = vergunningData.decision === 'Verleend';
  const isAfgehandeld = vergunningData.status === 'Afgehandeld';
  const isSameDate =
    vergunningData.dateStart === vergunningData.dateEnd ||
    vergunningData.dateEnd === null;

  return (
    <>
      <InfoDetail label="Kenmerk" value={vergunningData.identifier || '-'} />
      {isVerleend && <Location location={vergunningData.location} />}
      {isVerleend && !isSameDate && (
        <InfoDetailGroup>
          <InfoDetail
            label="Vanaf"
            value={
              vergunningData.dateStart
                ? defaultDateFormat(vergunningData.dateStart)
                : '-'
            }
          />
          <InfoDetail
            label="Tot en met"
            value={
              vergunningData.dateEnd
                ? defaultDateFormat(vergunningData.dateEnd)
                : '-'
            }
          />
          <InfoDetail
            label="Tussen"
            value={`${vergunningData.timeStart} - ${vergunningData.timeEnd} uur`}
          />
        </InfoDetailGroup>
      )}
      {isVerleend && isSameDate && (
        <InfoDetailGroup>
          <InfoDetail
            label="Op"
            value={
              vergunningData.dateStart
                ? defaultDateFormat(vergunningData.dateStart)
                : '-'
            }
          />
          <InfoDetail
            label="Van"
            value={
              vergunningData.timeStart ? `${vergunningData.timeStart} uur` : '-'
            }
          />
          <InfoDetail
            label="Tot"
            value={
              vergunningData.timeEnd ? `${vergunningData.timeEnd} uur` : '-'
            }
          />
        </InfoDetailGroup>
      )}
      {isAfgehandeld && (
        <InfoDetail label="Resultaat" value={vergunningData.decision} />
      )}
    </>
  );
}
