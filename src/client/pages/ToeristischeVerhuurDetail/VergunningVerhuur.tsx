import {
  TransformedVakantieverhuurVergunningaanvraag as VakantieVergunningType,
  TransformedBBVergunning as BBVergunningType,
} from '../../../server/services';
import InfoDetail, {
  InfoDetailGroup,
} from '../../components/InfoDetail/InfoDetail';

export default function VergunningVerhuur({
  vergunning,
}: {
  vergunning: VakantieVergunningType | BBVergunningType;
}) {
  return (
    <>
      <InfoDetail label="Kenmerk" value={vergunning?.identifier || '-'} />
      <InfoDetail
        label="Soort vergunning"
        value={vergunning?.caseType || '-'}
      />
      <InfoDetailGroup>
        <InfoDetail label="Vanaf" value={vergunning?.dateStart ?? '-'} />
        <InfoDetail label="Tot en met" value={vergunning?.dateEnd ?? '-'} />
      </InfoDetailGroup>
      <InfoDetailGroup>
        <InfoDetail label="Eigenaar woning" value={'-'} />
        <InfoDetail label="Aanvrager vergunning" value={'-'} />
      </InfoDetailGroup>
      <InfoDetail label={'Adres'} value={vergunning?.location ?? '-'} />
    </>
  );
}
