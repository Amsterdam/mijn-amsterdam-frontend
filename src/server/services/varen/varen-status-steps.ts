import { Varen } from './config-and-types';
import { StatusLineItem } from '../../../universal/types';
import { getStatusDate } from '../decos/helpers';

export function getStatusSteps(decosZaak: Varen) {
  const isAfgehandeld = decosZaak.processed;

  const dateInBehandeling = getStatusDate('In behandeling', decosZaak);
  const hasDateInBehandeling = !!dateInBehandeling;

  const steps: StatusLineItem[] = [
    {
      id: 'step-1',
      status: 'Ontvangen',
      datePublished: decosZaak.dateRequest,
      description: '',
      isActive: !hasDateInBehandeling && !isAfgehandeld,
      isChecked: true,
    },
    {
      id: 'step-2',
      status: 'In behandeling',
      datePublished: dateInBehandeling || '',
      description: '',
      isActive: hasDateInBehandeling && !isAfgehandeld,
      isChecked: hasDateInBehandeling || isAfgehandeld,
    },
    {
      id: 'step-3',
      status: 'Besluit',
      datePublished: decosZaak.dateDecision || '',
      description: isAfgehandeld ? decosZaak.decision : '',
      isActive: isAfgehandeld,
      isChecked: isAfgehandeld,
    },
  ];

  return steps;
}
