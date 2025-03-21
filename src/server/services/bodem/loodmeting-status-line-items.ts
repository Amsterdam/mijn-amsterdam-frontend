import {
  LoodMetingFrontend,
  LoodMetingStatus,
  LoodMetingStatusLowerCase,
} from '../../../server/services/bodem/types';
import { StatusLineItem } from '../../../universal/types';

export function getBodemStatusLineItems(
  request: LoodMetingFrontend,
  lowercaseStatus: LoodMetingStatusLowerCase
): StatusLineItem<LoodMetingStatus>[] {
  const status: LoodMetingStatusLowerCase = lowercaseStatus;

  const isInProgress = status === 'in behandeling';
  const isDeclined = status === 'afgewezen';
  const isDone = status === 'afgehandeld' || status === 'afgewezen';

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
      status: 'Afgehandeld',
      datePublished:
        (isDeclined ? request.datumBeoordeling : request.datumAfgehandeld) ??
        '',
      description: '',
      documents: [],
      isActive: isDone,
      isChecked: isDone,
    },
  ];
}
