import type { ZwaarVerkeer as ZwaarVerkeerType } from '../../../server/services';
import { defaultDateFormat } from '../../../universal/helpers';
import InfoDetail, {
  InfoDetailGroup,
} from '../../components/InfoDetail/InfoDetail';

export function ZwaarVerkeer({ vergunning }: { vergunning: ZwaarVerkeerType }) {
  return (
    <>
      <InfoDetail label="Kenmerk" value={vergunning.identifier || '-'} />

      <InfoDetail label="Soort ontheffing" value={vergunning.kind || '-'} />

      <InfoDetail label="Kentekens" value={vergunning.licencePlates || '-'} />

      {!!vergunning?.decision && (
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
            label="Tot en met"
            value={
              vergunning.dateEnd ? defaultDateFormat(vergunning.dateEnd) : '-'
            }
          />
        </InfoDetailGroup>
      )}
      {!!vergunning?.decision && (
        <InfoDetail label="Resultaat" value={vergunning.decision} />
      )}
    </>
  );
}
