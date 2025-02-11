import { Varen } from './config-and-types';
import { StatusLineItem } from '../../../universal/types';
import { getStatusDate } from '../decos/helpers';

export function getStatusSteps(decosZaak: Varen) {
  const isAfgehandeld = decosZaak.processed;

  const dateInBehandeling = getStatusDate('In behandeling', decosZaak);
  const hasDateInBehandeling = !!dateInBehandeling;

  const isExpiredByEndDate =
    !!decosZaak.dateEnd &&
    decosZaak.decision === 'Verleend' &&
    new Date(decosZaak.dateEnd) <= new Date();
  const isExpired = isExpiredByEndDate;

  const steps: StatusLineItem[] = [
    {
      id: 'step-1',
      status: 'Ontvangen',
      datePublished: decosZaak.dateRequest,
      description: '',
      documents: [],
      isActive: !hasDateInBehandeling && !isAfgehandeld,
      isChecked: true,
    },
    {
      id: 'step-2',
      status: 'In behandeling',
      datePublished: dateInBehandeling || '',
      description: '',
      documents: [],
      isActive: hasDateInBehandeling && !isAfgehandeld,
      isChecked: isAfgehandeld,
    },
    {
      id: 'step-3',
      status: 'Afgehandeld',
      datePublished: decosZaak.dateDecision || '',
      description:
        isAfgehandeld &&
        decosZaak.decision &&
        ['Verleend', 'Ingetrokken', 'Niet verleend', 'Geweigerd'].includes(
          decosZaak.decision
        )
          ? `Wij hebben uw aanvraag ${decosZaak.title} <strong>${decosZaak.decision}</strong>`
          : '', // Complex decisions cannot be captured in a generic text.
      documents: [],
      isActive: !isExpired && isAfgehandeld,
      isChecked: isAfgehandeld,
    },
  ];

  if ('isExpired' in decosZaak) {
    if (isExpired) {
      steps.push({
        id: 'step-4',
        status: 'Gewijzigd',
        datePublished: decosZaak.dateEnd ?? '',
        description: `Uw ${decosZaak.title} is verlopen.`,
        documents: [],
        isActive: true,
        isChecked: true,
      });
    }
  }

  return steps;
}
