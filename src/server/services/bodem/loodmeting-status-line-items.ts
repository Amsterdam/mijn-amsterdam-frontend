import {
  LoodMetingFrontend,
  LoodMetingStatus,
} from '../../../server/services/bodem/types';
import { StatusLineItem } from '../../../universal/types';

export function getBodemStatusLineItems(
  request: LoodMetingFrontend
): StatusLineItem<LoodMetingStatus>[] {
  const status: LoodMetingStatus = request.status;
  const isInProgress = status === 'In behandeling';
  const isDone = status === 'Afgehandeld' || status === 'Afgewezen';

  return [
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
    {
      id: 'third-item',
      status: status === 'Afgewezen' ? 'Afgewezen' : 'Afgehandeld',
      datePublished:
        (status === 'Afgewezen'
          ? request.datumBeoordeling
          : request.datumAfgehandeld) ?? '',
      description: '',
      documents: [],
      isActive: isDone,
      isChecked: isDone,
    },
  ];
}
