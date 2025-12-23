import { WithDateEnd } from './config-and-types';
import { dateTimeEndFormatted } from '../../../client/pages/Thema/Vergunningen/Vergunningen-helpers';
import { StatusLineItem } from '../../../universal/types/App.types';
import { MA_VERLEEND_DECISIONS_COMMOM } from '../decos/decos-field-transformers';
import { getWorkflowStatusDate } from '../decos/decos-helpers';
import { DecosZaakBase } from '../decos/decos-types';

export function getStatusStepsDecos<
  DZ extends DecosZaakBase & Partial<WithDateEnd>,
>(zaak: DZ) {
  const isAfgehandeld = zaak.processed;
  const dateInBehandeling = getWorkflowStatusDate('In behandeling', zaak);
  const isInBehandeling = !!dateInBehandeling;
  const isVerlopen = 'isExpired' in zaak ? zaak.isExpired === true : false;
  const isIngetrokken = !!zaak.decision?.includes('Ingetrokken');

  const statusOntvangen: StatusLineItem = {
    id: 'step-1',
    status: 'Ontvangen',
    datePublished: zaak.dateRequest,
    description: '',
    documents: [],
    isActive: !isInBehandeling && !isAfgehandeld,
    isChecked: true,
  };

  const statusInBehandeling: StatusLineItem = {
    id: 'step-2',
    status: 'In behandeling',
    datePublished: dateInBehandeling || '',
    description: '',
    documents: [],
    isActive: isInBehandeling && !isAfgehandeld,
    isChecked: isInBehandeling || isAfgehandeld,
  };

  const statusAfgehandeld: StatusLineItem = {
    id: 'step-3',
    status: 'Afgehandeld',
    datePublished: zaak.dateDecision || '',
    description:
      isAfgehandeld &&
      zaak.decision &&
      [...MA_VERLEEND_DECISIONS_COMMOM, 'Niet verleend', 'Geweigerd'].includes(
        zaak.decision
      )
        ? `Wij hebben uw aanvraag ${zaak.title} <strong>${zaak.decision}</strong>`
        : '', // Complex decisions cannot be captured in a generic text. They should be handled in the specific case.
    documents: [],
    isActive:
      isAfgehandeld && !isIngetrokken && (!isVerlopen || !zaak.isVerleend),
    isChecked: isAfgehandeld,
  };

  const steps: StatusLineItem[] = [
    statusOntvangen,
    statusInBehandeling,
    statusAfgehandeld,
  ];

  if (
    isAfgehandeld &&
    // TODO: Discuss with the team if this is the right way to check for a valid decision.
    (('isExpired' in zaak && zaak.isVerleend) || isIngetrokken)
  ) {
    const isActive = isVerlopen || isIngetrokken;

    let datePublished = ''; // Ingetrokken status does not have a date associated with it.
    let description = '';

    if (isIngetrokken) {
      description = `Wij hebben uw ${zaak.title} ingetrokken.`;
    } else if (isVerlopen) {
      description = `Uw ${zaak.title} is verlopen.`;
      datePublished = zaak.dateEnd as string; // Verlopen status always has a dateEbd associated with it.
    } else if (zaak.dateEndFormatted) {
      description = `Uw vergunning verloopt op ${dateTimeEndFormatted(zaak)}.`;
    }

    const statusGewijzigd: StatusLineItem = {
      id: 'step-4',
      status: isIngetrokken ? 'Ingetrokken' : 'Verlopen',
      datePublished,
      description,
      isActive: isActive,
      isChecked: isActive,
    };

    steps.push(statusGewijzigd);
  }

  return steps;
}
