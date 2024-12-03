import type { LoodMeting } from '../../../server/services/bodem/types';
import { StatusLineItem } from '../../../universal/types';
import { StatusLine } from '../../components';

const STATUS_RECEIVED = 'ontvangen';
const STATUS_IN_PROGRESS = 'in behandeling';
const STATUS_DENIED = 'afgewezen';
const STATUS_DONE = 'afgehandeld';

function getStatusLines(request: LoodMeting): StatusLineItem[] {
  const status = request.status.toLowerCase();
  const isInProgress = status === STATUS_IN_PROGRESS;
  const isDenied = status === STATUS_DENIED;
  const isDone = status === STATUS_DONE || isDenied;

  return [
    {
      id: 'first-item',
      status: STATUS_RECEIVED,
      datePublished: request.datumAanvraag,
      description: '',
      documents: [],
      isActive: !isInProgress && !isDone,
      isChecked: true,
    },
    {
      id: 'second-item',
      status: STATUS_IN_PROGRESS,
      datePublished:
        request.datumInbehandeling || request.datumBeoordeling || '',
      description: '',
      documents: [],
      isActive: isInProgress,
      isChecked: isInProgress || isDone,
    },
    {
      id: 'third-item',
      status: isDenied ? STATUS_DENIED : STATUS_DONE,
      datePublished:
        (isDenied ? request.datumBeoordeling : request.datumAfgehandeld) ?? '',
      description: '',
      documents: [],
      isActive: isDone,
      isChecked: isDone,
    },
  ];
}

export default function LoodStatusLines({ request }: { request: LoodMeting }) {
  const statusLines = getStatusLines(request);

  return (
    <StatusLine
      trackCategory="Loodmeting detail / status"
      items={statusLines}
      id={`loodmeting-detail-${request.kenmerk}`}
    />
  );
}
