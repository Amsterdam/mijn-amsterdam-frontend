import {
  LoodMetingFrontend,
  LoodMetingStatus,
  LoodMetingStatusLowerCase,
} from '../../../server/services/bodem/types.ts';
import { StatusLineItem } from '../../../universal/types/App.types.ts';

export function getBodemStatusSteps(
  request: LoodMetingFrontend,
  lowercaseStatus: LoodMetingStatusLowerCase
): StatusLineItem<LoodMetingStatus>[] {
  const status: LoodMetingStatusLowerCase = lowercaseStatus;

  const isInProgress = status === 'in behandeling';
  const isDone = request.processed;

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
        // Sometimes requests are immediately declined and don't have a datumInBehandeling date. We then show datumAfgehandeld.
        request.datumInbehandeling || request.datumAfgehandeld || '',
      description: '',
      documents: [],
      isActive: isInProgress,
      isChecked: isInProgress || isDone,
    },
    {
      id: 'third-item',
      status: 'Afgehandeld',
      datePublished: request.datumAfgehandeld || '',
      description: '',
      documents: [],
      isActive: isDone,
      isChecked: isDone,
    },
  ];
}
