import { getRows } from './fields-config';
import type {
  EvenementVergunning,
  VergunningFrontend,
} from '../../../../../server/services/vergunningen/config-and-types';
import { StatusLineItem } from '../../../../../universal/types/App.types';
import { Datalist } from '../../../../components/Datalist/Datalist';

export function getEvenementVergunningLineItems(
  vergunning: VergunningFrontend<EvenementVergunning>
): StatusLineItem[] {
  const isDone = vergunning.processed;

  const lineItems = [
    {
      id: 'item-1',
      status: 'Ontvangen',
      datePublished: vergunning.dateRequest,
      description: '',
      documents: [],
      isActive: !isDone,
      isChecked: true,
    },
    {
      id: 'last-item',
      status: 'Afgehandeld',
      datePublished: vergunning.dateDecision || '',
      description: '',
      documents: [],
      isActive: isDone,
      isChecked: isDone,
    },
  ];

  return lineItems;
}

export function EvenementVergunning({
  vergunning,
}: {
  vergunning: VergunningFrontend<EvenementVergunning>;
}) {
  const rows = getRows(vergunning, [
    'identifier',
    'description',
    'location',
    'dateTimeRange',
    'decision',
  ]);
  return <Datalist rows={rows} />;
}
