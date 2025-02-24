import type { ZwaarVerkeer as ZwaarVerkeerType } from '../../../../server/services';
import { defaultDateFormat } from '../../../../universal/helpers/date';
import InfoDetail, {
  InfoDetailGroup,
} from '../../../components/InfoDetail/InfoDetail';

export function ZwaarVerkeer({ vergunning }: { vergunning: ZwaarVerkeerType }) {
  const isAfgehandeld = vergunning.processed;

  return (
    <>
      <InfoDetail label="Kenmerk" value={vergunning.identifier || '-'} />

      <InfoDetail
        label="Soort ontheffing"
        value={vergunning.exemptionKind || '-'}
      />

      <InfoDetail label="Kentekens" value={vergunning.licensePlates || '-'} />

      <InfoDetailGroup>
        <InfoDetail
          label="Vanaf"
          value={
            vergunning.dateStart ? defaultDateFormat(vergunning.dateStart) : '-'
          }
        />
        <InfoDetail
          label="Tot en met"
          value={
            vergunning.dateEnd ? defaultDateFormat(vergunning.dateEnd) : '-'
          }
        />
      </InfoDetailGroup>

      {isAfgehandeld && (
        <InfoDetail label="Resultaat" value={vergunning.decision} />
      )}
    </>
  );
}
