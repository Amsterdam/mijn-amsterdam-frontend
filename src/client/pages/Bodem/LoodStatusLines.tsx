import type { LoodMeting } from '../../../server/services/bodem/types';
import { StatusLineItem } from '../../../universal/types';
import { StatusLine } from '../../components';
import styles from './LoodMeting.module.scss';

export default function LoodStatusLines({ request }: { request: LoodMeting }) {
  const status = request.status.toLowerCase();
  const isInProgress = status === 'in behandeling';
  const isDenied = status === 'afgewezen';
  const isDone = status === 'afgehandeld' || isDenied;

  const statusLines: StatusLineItem[] = [
    {
      id: 'first-item',
      status: 'Ontvangen',
      datePublished: request.datumAanvraag,
      description: '',
      documents: [],
      isActive: !isInProgress && !isDone,
      isChecked: true,
    },
    {
      id: 'second-item',
      status: 'In behandeling',
      datePublished:
        // Sometimes requests are immediately declined and don't have a datumInBehandeling date. We then show datumBeoordeling (which should be there if a request is declined).
        request.datumInbehandeling || request.datumBeoordeling || '',
      description: '',
      documents: [],
      isActive: isInProgress,
      isChecked: isInProgress || isDone,
    },
  ];

  statusLines.push({
    id: 'third-item',
    status: isDenied ? 'Afgewezen' : 'Afgehandeld',
    datePublished:
      (isDenied ? request.datumBeoordeling : request.datumAfgehandeld) ?? '',
    description: '',
    documents: [],
    isActive: isDone,
    isChecked: isDone,
  });

  return (
    <StatusLine
      className={styles.LoodStatusLines}
      trackCategory="Loodmeting detail / status"
      items={statusLines}
      id={`loodmeting-detail-${request.kenmerk}`}
    />
  );
}
