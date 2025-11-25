import { PBVergunning } from './config-and-types';
import { StatusLineItem } from '../../../universal/types/App.types';

// TODO: MIJN-12348 - add correct status steps and logic for all vergunningen product types
export function getStatusStepsPB<T extends PBVergunning>(
  zaak: T
): StatusLineItem[] {
  const getStatusDate = (status: string) =>
    zaak.statusDates?.find((sd) => sd.status === status)?.datePublished ?? null;

  const datumInBehandeling = getStatusDate('In behandeling') ?? '';
  const dateDecision: string =
    getStatusDate('Afgehandeld') ??
    getStatusDate('Gereed') ??
    zaak.dateDecision ??
    '';

  const isVerlopen = zaak.isExpired;
  const hasInBehandeling = !!datumInBehandeling;
  const hasDecision = !!zaak.decision && !!dateDecision;

  const statusOntvangen: StatusLineItem = {
    id: 'step-1',
    status: 'Ontvangen',
    datePublished: zaak.dateRequest ?? '',
    description: '',
    documents: [],
    isActive: !datumInBehandeling && !hasDecision,
    isChecked: true,
  };

  const statusInBehandeling: StatusLineItem = {
    id: 'step-2',
    status: 'In behandeling',
    datePublished: datumInBehandeling,
    description: '',
    documents: [],
    isActive: !hasDecision && hasInBehandeling,
    isChecked: hasDecision || hasInBehandeling,
  };

  const statusAfgehandeld: StatusLineItem = {
    id: 'step-3',
    status: 'Afgehandeld',
    datePublished: dateDecision,
    description: '',
    documents: [],
    isActive: !isVerlopen && hasDecision,
    isChecked: hasDecision,
  };

  const statusVerlopen: StatusLineItem = {
    id: 'step-4',
    status: 'Verlopen',
    datePublished: zaak.dateEnd ?? '',
    description: '',
    documents: [],
    isActive: true,
    isChecked: true,
  };

  const steps: StatusLineItem[] = [];
  steps.push(statusOntvangen, statusInBehandeling, statusAfgehandeld);
  if (isVerlopen) {
    steps.push(statusVerlopen);
  }
  return steps;
}
