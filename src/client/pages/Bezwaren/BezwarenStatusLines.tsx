import type { BezwaarStatus } from '../../../server/services/bezwaren/types';
import { StatusLine } from '../../components';

const EMPTY_UUID = '00000000-0000-0000-0000-000000000000';

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

export function BezwarenStatusLines({
  statussen,
}: {
  statussen: BezwaarStatus[];
}) {
  const statusLineItems = transformBezwaarStatusToStatusLines(statussen);

  return (
    <StatusLine
      trackCategory="Bezwaar detail / status"
      items={statusLineItems}
    />
  );
}
