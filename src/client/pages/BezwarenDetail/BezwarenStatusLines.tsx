import type { BezwaarStatus } from '../../../server/services/bezwaren/types';
import { StatusLine } from '../../components';

const EMPTY_UUID = '00000000-0000-0000-0000-000000000000';

function transformBezwaarStatusToStatusLines(statussen: BezwaarStatus[]) {
  const index = statussen.findIndex((s) => s.uuid === EMPTY_UUID);
  const activeIndex = index === -1 ? 0 : index - 1;

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
      showToggleMore={false}
      id={`bezwaar-detail-${id}`}
      documentPathForTracking={(document) =>
        `/downloads/avg-verzoek/${document.title}`
      }
    />
  );
};

export default BezwarenStatusLines;
