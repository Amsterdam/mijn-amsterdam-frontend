import { RVVSloterweg } from './config-and-types';
import { StatusLineItem } from '../../../universal/types/App.types';
import { MA_VERLEEND_DECISIONS_COMMOM } from '../decos/decos-field-transformers';
import { getStatusDate, getWorkflowStatusDate } from '../decos/decos-helpers';
import { DecosZaakBase } from '../decos/decos-types';

function getStatusStepsRVVSloterweg(
  vergunning: RVVSloterweg
): StatusLineItem[] {
  const RVV_SLOTERWEG_RESULT_NOT_APPLICABLE = 'Ingetrokken';
  const RVV_SLOTERWEG_RESULT_EXPIRED = 'Verlopen';
  const RVV_SLOTERWEG_RESULT_UPDATED_WITH_NEW_KENTEKEN = 'Vervallen';

  // Update of the kentekens on an active permit.
  const isChangeRequest = vergunning.requestType !== 'Nieuw';

  const statusDateInProgress = getStatusDate('In behandeling', vergunning);
  const isReceived =
    (!statusDateInProgress || !vergunning.dateWorkflowVerleend) &&
    !vergunning.decision;

  const isInprogress = !!statusDateInProgress || !isChangeRequest;
  const isGranted = !!vergunning.dateWorkflowVerleend;
  const isExpiredByEndDate =
    vergunning.dateEnd &&
    isGranted &&
    new Date(vergunning.dateEnd) <= new Date();
  const isExpired =
    isExpiredByEndDate || vergunning.decision === RVV_SLOTERWEG_RESULT_EXPIRED;

  const dateInProgress =
    (isChangeRequest ? statusDateInProgress : vergunning.dateRequest) ?? '';

  const hasDecision = [
    RVV_SLOTERWEG_RESULT_NOT_APPLICABLE,
    RVV_SLOTERWEG_RESULT_EXPIRED,
    RVV_SLOTERWEG_RESULT_UPDATED_WITH_NEW_KENTEKEN,
  ].includes(vergunning.decision);

  const isIngetrokken =
    vergunning.decision === RVV_SLOTERWEG_RESULT_NOT_APPLICABLE;

  const hasUpdatedKenteken =
    vergunning.decision === RVV_SLOTERWEG_RESULT_UPDATED_WITH_NEW_KENTEKEN;

  const descriptionIngetrokken = `Wij hebben uw RVV ontheffing ${vergunning.area} voor kenteken ${vergunning.kentekens} ingetrokken. Zie het intrekkingsbesluit voor meer informatie.`;

  let descriptionAfgehandeld = '';

  switch (true) {
    case isGranted && isChangeRequest:
      descriptionAfgehandeld = `Wij hebben uw kentekenwijziging voor een ${vergunning.title} verleend.`;
      break;
    case isGranted && !isChangeRequest:
      descriptionAfgehandeld = `Wij hebben uw aanvraag voor een RVV ontheffing ${vergunning.area} ${vergunning.kentekens} verleend.`;
      break;
    case !isGranted && isIngetrokken:
      descriptionAfgehandeld = descriptionIngetrokken;
      break;
  }

  const steps: StatusLineItem[] = [
    {
      id: 'step-1',
      status: 'Ontvangen',
      datePublished: vergunning.dateRequest,
      description: '',
      documents: [],
      isActive: isReceived && !isGranted && !isInprogress,
      isChecked: true,
    },
    {
      id: 'step-2',
      status: 'In behandeling',
      datePublished: dateInProgress,
      description: '',
      documents: [],
      isActive: isInprogress && !isGranted && !hasDecision,
      isChecked: isInprogress || isGranted || hasDecision,
    },
    {
      id: 'step-3',
      status: 'Afgehandeld',
      datePublished:
        !vergunning.dateWorkflowVerleend && !!vergunning.dateDecision
          ? vergunning.dateDecision
          : vergunning.dateWorkflowVerleend
            ? vergunning.dateWorkflowVerleend
            : '',
      description: descriptionAfgehandeld,
      documents: [],
      isActive: (isGranted && !hasDecision) || (!isGranted && hasDecision),
      isChecked: isGranted || hasDecision,
    },
  ];

  if (isGranted && (isIngetrokken || isExpired || hasUpdatedKenteken)) {
    let description = '';

    switch (true) {
      case isIngetrokken:
        description = descriptionIngetrokken;
        break;
      case isExpired:
        description = `Uw RVV ontheffing ${vergunning.area} voor kenteken ${vergunning.kentekens} is verlopen.`;
        break;
      case hasUpdatedKenteken:
        description =
          'U heeft een nieuw kenteken doorgegeven. Bekijk de ontheffing voor het nieuwe kenteken in het overzicht.';
        break;
    }

    steps.push({
      id: 'step-4',
      status: 'Gewijzigd',
      datePublished:
        (isExpiredByEndDate ? vergunning.dateEnd : vergunning.dateDecision) ??
        '',
      description,
      documents: [],
      isActive: true,
      isChecked: true,
    });
  }

  return steps;
}

export function getStatusSteps<DZ extends DecosZaakBase>(zaak: DZ) {
  if (zaak.caseType === 'RVV Sloterweg') {
    return getStatusStepsRVVSloterweg(zaak as unknown as RVVSloterweg);
  }

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
      isAfgehandeld && ((!isVerlopen && !isIngetrokken) || !zaak.isVerleend),
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
    const isVerlopenActive = isVerlopen || isIngetrokken;

    let datePublished = ''; // Ingetrokken status does not have a date associated with it.

    // dateEnd is generic enough for most types of vergunningen.
    // If it is not this status should be customized with a custom transformer for the statusteps.
    if (isVerlopen && 'dateEnd' in zaak && zaak.dateEnd) {
      datePublished = zaak.dateEnd as string;
    }

    let description = '';

    if (isIngetrokken) {
      description = `Wij hebben uw ${zaak.title} ingetrokken.`;
      datePublished = zaak.dateDecision || ''; // TODO: Verify if this is the right date to use.
    } else if (isVerlopen) {
      description = `Uw ${zaak.title} is verlopen.`;
    } else if ('dateEndFormatted' in zaak && zaak.dateEndFormatted) {
      description = `Uw vergunning verloopt op ${zaak.dateEndFormatted}.`;
    }

    const statusGewijzigd: StatusLineItem = {
      id: 'step-4',
      status: isIngetrokken ? 'Ingetrokken' : 'Verlopen',
      datePublished,
      description,
      isActive: isVerlopenActive,
      isChecked: isVerlopenActive,
    };

    steps.push(statusGewijzigd);
  }

  return steps;
}

export const forTesting = {
  getStatusStepsRVVSloterweg,
};
