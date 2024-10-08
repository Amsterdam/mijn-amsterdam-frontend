import styles from './VergunningDetail.module.scss';
import {
  TouringcarDagontheffing,
  TouringcarJaarontheffing,
} from '../../../server/services';
import {
  dateTimeFormatYear,
  defaultDateFormat,
} from '../../../universal/helpers/date';
import { CaseType } from '../../../universal/types/vergunningen';
import { InfoDetail } from '../../components';
import { InfoDetailGroup } from '../../components/InfoDetail/InfoDetail';

export function Touringcar({
  vergunning,
}: {
  vergunning: TouringcarDagontheffing | TouringcarJaarontheffing;
}) {
  const isGranted = vergunning.decision === 'Verleend';

  return (
    <>
      <InfoDetail label="Kenmerk" value={vergunning.identifier} />

      {vergunning.caseType === CaseType.TouringcarJaarontheffing ? (
        <InfoDetail
          valueWrapperElement="div"
          label={vergunning.routetest ? 'Kenteken' : 'Kenteken(s)'}
          value={
            vergunning.licensePlates?.includes(' | ') ? (
              <ul className={styles.LicensePlatesList}>
                {vergunning.licensePlates
                  ?.split(' | ')
                  .map((plate, index) => <li key={plate + index}>{plate}</li>)}
              </ul>
            ) : (
              vergunning.licensePlates
            )
          }
        />
      ) : (
        <InfoDetail label="Kenteken" value={vergunning.licensePlate} />
      )}

      <InfoDetail label="Bestemming" value={vergunning.destination} />

      {isGranted &&
        vergunning.caseType === CaseType.TouringcarJaarontheffing && (
          <InfoDetailGroup>
            <InfoDetail
              label="Van"
              value={
                vergunning.dateStart
                  ? defaultDateFormat(vergunning.dateStart)
                  : '-'
              }
            />
            <InfoDetail
              label="Tot"
              value={
                vergunning.dateEnd ? defaultDateFormat(vergunning.dateEnd) : '-'
              }
            />
          </InfoDetailGroup>
        )}

      {isGranted &&
        vergunning.caseType === CaseType.TouringcarDagontheffing && (
          <InfoDetailGroup>
            <InfoDetail
              label="Van"
              value={
                vergunning?.timeStart && vergunning?.dateStart
                  ? dateTimeFormatYear(
                      `${vergunning.dateStart}T${vergunning.timeStart}`
                    )
                  : vergunning.dateStart
                    ? defaultDateFormat(vergunning.dateStart)
                    : '-'
              }
            />
            <InfoDetail
              label="Tot"
              value={
                vergunning?.timeEnd && vergunning?.dateEnd
                  ? dateTimeFormatYear(
                      `${vergunning.dateEnd}T${vergunning.timeEnd}`
                    )
                  : vergunning.dateEnd
                    ? defaultDateFormat(vergunning.dateEnd)
                    : '-'
              }
            />
          </InfoDetailGroup>
        )}

      {!!vergunning.processed && (
        <InfoDetail label="Resultaat" value={vergunning.decision} />
      )}
    </>
  );
}
