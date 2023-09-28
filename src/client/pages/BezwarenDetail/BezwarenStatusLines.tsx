import type { BezwaarStatus } from '../../../server/services/bezwaren/types';
import { EMPTY_UUID } from '../../../universal/helpers/bezwaren';
import { StatusLine } from '../../components';

function transformBezwaarStatusToStatusLines(statussen: BezwaarStatus[]) {
  const index = statussen.findIndex((s) => s.uuid === EMPTY_UUID);
  const activeIndex =
    index > 0 ? index - 1 : index === 0 ? index : statussen.length - 1;

  return statussen.map((status, index) => ({
    id: status.statustoelichting,
    status: status.statustoelichting,
    datePublished: status.datum,
    description: '',
    documents: [],
    isActive: activeIndex === index,
    isChecked: status.uuid !== EMPTY_UUID,
  }));
}

const BezwarenStatusLines = ({
  id,
  statussen,
}: {
  id: string;
  statussen: BezwaarStatus[];
}) => {
  const statusLineItems = transformBezwaarStatusToStatusLines(statussen);

  return (
    <StatusLine
      className=""
      trackCategory="AVG verzoek detail / status"
      items={statusLineItems}
      id={`bezwaar-detail-${id}`}
      documentPathForTracking={(document) =>
        `/downloads/avg-verzoek/${document.title}`
      }
    />
  );
};

export default BezwarenStatusLines;
