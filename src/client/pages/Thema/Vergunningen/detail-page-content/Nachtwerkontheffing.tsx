import { getRowsFlyeren } from './Flyeren';
import type {
  Nachtwerkontheffing,
  VergunningFrontend,
} from '../../../../../server/services/vergunningen/config-and-types';
import { Datalist } from '../../../../components/Datalist/Datalist';

export function Nachtwerkontheffing({
  vergunning,
}: {
  vergunning: VergunningFrontend<Nachtwerkontheffing>;
}) {
  return <Datalist rows={getRowsFlyeren(vergunning)} />;
}
