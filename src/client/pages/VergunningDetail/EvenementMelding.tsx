import { EvenementMelding as EvenementMeldingType } from '../../../server/services';
import { defaultDateFormat } from '../../../universal/helpers';
import InfoDetail, {
  InfoDetailGroup,
} from '../../components/InfoDetail/InfoDetail';
import { Location } from './Location';

export function EvenementMelding({
  vergunning,
}: {
  vergunning: EvenementMeldingType;
}) {
  return (
    <>
      <InfoDetail label="Kenmerk" value={vergunning?.identifier || '-'} />
      <InfoDetail
        label="Soort vergunning"
        value={vergunning?.caseType || '-'}
      />
      <InfoDetail label="Omschrijving" value={vergunning?.title || '-'} />

      <InfoDetail
        label="Soort evenement"
        value={vergunning?.eventType || '-'}
      />
      <InfoDetail
        label="Activiteit tijdens evenement"
        value={vergunning?.activities || '-'}
      />
      <InfoDetail
        label="Aantal bezoekers"
        value={vergunning?.visitorCount || '-'}
      />
      {!!vergunning.location && <Location location={vergunning.location} />}

      <InfoDetailGroup>
        <InfoDetail
          label="Vanaf"
          value={
            (vergunning?.dateStart
              ? defaultDateFormat(vergunning.dateStart)
              : '-') +
            (vergunning?.timeStart ? ` - ${vergunning.timeStart} uur` : '')
          }
        />
        <InfoDetail
          label="Tot en met"
          value={
            (vergunning?.dateEnd
              ? defaultDateFormat(vergunning.dateEnd)
              : '-') +
            (vergunning?.timeEnd ? ` - ${vergunning.timeEnd} uur` : '')
          }
        />
      </InfoDetailGroup>
      {!!vergunning?.decision && (
        <InfoDetail label="Resultaat" value={vergunning.decision} />
      )}
    </>
  );
}
