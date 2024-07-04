import {
  GPP,
  VergunningFrontendV2,
} from '../../../../server/services/vergunningen-v2/config-and-types';
import { Datalist } from '../../../components/Datalist/Datalist';
import { getRows } from './fields-config';

export function GPPContent({
  vergunning,
}: {
  vergunning: VergunningFrontendV2<GPP>;
}) {
  console.log(vergunning);
  const rows = getRows(vergunning, [
    'identifier',
    'location',
    'kentekens',
    'decision',
  ]);

  return <Datalist rows={rows} />;
}
