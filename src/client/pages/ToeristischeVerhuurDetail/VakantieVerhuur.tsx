import {
  TransformedVakantieverhuur as VakantieVerhuurType,
  TransformedVakantieverhuurAfmelding as VakantieVerhuurAfmeldingType,
} from '../../../server/services';
import { defaultDateFormat } from '../../../universal/helpers/date';
import InfoDetail, {
  InfoDetailGroup,
} from '../../components/InfoDetail/InfoDetail';

export default function VakantieVerhuur({
  vergunning,
}: {
  vergunning: VakantieVerhuurType | VakantieVerhuurAfmeldingType;
}) {
  return (
    <>
      <InfoDetail
        label="Gemeentelijk zaaknummer"
        value={vergunning?.identifier || '-'}
      />
      <InfoDetail
        label="Ontvangen op"
        value={
          vergunning?.dateRequest
            ? defaultDateFormat(vergunning.dateRequest)
            : '-'
        }
      />
      <InfoDetailGroup>
        <InfoDetail
          label="Datum start verhuur"
          value={vergunning?.dateStart ?? '-'}
        />
        <InfoDetail
          label="Datum einde verhuur"
          value={vergunning?.dateEnd ?? '-'}
        />
      </InfoDetailGroup>
      <InfoDetail label={'Adres'} value={vergunning?.location ?? '-'} />
    </>
  );
}
