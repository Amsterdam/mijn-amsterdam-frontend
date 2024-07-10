import { defaultDateFormat } from '../../../../../universal/helpers/date';
import InfoDetail, { InfoDetailGroup } from '../../../InfoDetail/InfoDetail';

interface DateStartEndProps {
  dateStart?: string;
  dateEnd?: string;
  timeStart?: string;
  timeEnd?: string;
  label?: string;
}

export default function DateStartEnd({
  dateStart,
  timeStart,
  dateEnd,
  timeEnd,
  label,
}: DateStartEndProps) {
  return (
    <>
      <InfoDetailGroup label={label}>
        {dateStart && (
          <InfoDetail
            label={`Datum ${dateStart !== dateEnd ? 'van' : ''}`}
            value={defaultDateFormat(dateStart)}
          />
        )}
        {dateStart !== dateEnd && dateEnd && (
          <InfoDetail
            label="Datum tot en met"
            value={defaultDateFormat(dateEnd)}
          />
        )}
      </InfoDetailGroup>
      {(timeStart || timeEnd) && (
        <InfoDetailGroup>
          {timeStart && <InfoDetail label="Tijd van" value={timeStart} />}
          {timeEnd && <InfoDetail label="Tijd tot" value={timeEnd} />}
        </InfoDetailGroup>
      )}
    </>
  );
}
