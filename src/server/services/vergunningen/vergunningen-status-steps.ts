import { RVVSloterweg, VergunningFrontend } from './config-and-types';
import { StatusLineItem } from '../../../universal/types/App.types';
import {
  DecosZaakBase,
  DecosZaakFrontend,
  DecosZaakTransformer,
} from '../decos/config-and-types';
import { getStatusDate } from '../decos/decos-helpers';

function getStatusStepsRVVSloterweg(
  vergunning: VergunningFrontend<RVVSloterweg>
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

export function getStatusSteps<DZ extends DecosZaakBase>(
  vergunning: VergunningFrontend<DZ>,
  zaakTransformer?: DecosZaakTransformer<DZ>
) {
  if (vergunning.caseType === 'RVV Sloterweg') {
    return getStatusStepsRVVSloterweg(
      vergunning as unknown as DecosZaakFrontend<RVVSloterweg>
    );
  }

  const isAfgehandeld = vergunning.processed;
  const dateInBehandeling = getStatusDate('In behandeling', vergunning) || '';
  const hasWorkflowDateForStatusInBehandeling =
    !!zaakTransformer?.fetchWorkflowStatusDatesFor?.some(
      ({ status }) => status === 'In behandeling'
    );
  const isInBehandeling = hasWorkflowDateForStatusInBehandeling
    ? !!dateInBehandeling && !isAfgehandeld
    : !isAfgehandeld;
  const isVerlopen = vergunning.isExpired === true;
  const isIngetrokken = vergunning.decision?.includes('Ingetrokken');
  const isVerleend = vergunning.decision === 'Verleend';

  const statusOntvangen: StatusLineItem = {
    id: 'step-1',
    status: 'Ontvangen',
    datePublished: vergunning.dateRequest,
    description: '',
    documents: [],
    isActive: !isInBehandeling && !isAfgehandeld,
    isChecked: true,
  };

  const statusInBehandeling: StatusLineItem = {
    id: 'step-2',
    status: 'In behandeling',
    datePublished: hasWorkflowDateForStatusInBehandeling
      ? dateInBehandeling
      : vergunning.dateRequest,
    description: '',
    documents: [],
    isActive: isInBehandeling,
    isChecked: isInBehandeling || isAfgehandeld,
  };

  const statusAfgehandeld: StatusLineItem = {
    id: 'step-3',
    status: 'Afgehandeld',
    datePublished: vergunning.dateDecision || '',
    description:
      isAfgehandeld &&
      vergunning.decision &&
      ['Verleend', 'Niet verleend', 'Geweigerd'].includes(vergunning.decision)
        ? `Wij hebben uw aanvraag ${vergunning.title} <strong>${vergunning.decision}</strong>`
        : '', // Complex decisions cannot be captured in a generic text. They should be handled in the specific case.
    documents: [],
    isActive: !isVerlopen && !isIngetrokken && isAfgehandeld,
    isChecked: isAfgehandeld,
  };

  const steps: StatusLineItem[] = [
    statusOntvangen,
    statusInBehandeling,
    statusAfgehandeld,
  ];

  if (isAfgehandeld && ((isVerleend && isVerlopen) || isIngetrokken)) {
    let datePublished = vergunning.dateDecision ?? '';

    // dateEnd is generic enough for most types of vergunningen.
    // If it is not this status should be customized with a custom transformer for the statusteps.
    if (isVerlopen && 'dateEnd' in vergunning && vergunning.dateEnd) {
      datePublished = vergunning.dateEnd as string;
    }

    const statusGewijzigd: StatusLineItem = {
      id: 'step-4',
      status: isIngetrokken ? 'Ingetrokken' : 'Verlopen',
      datePublished,
      description: isIngetrokken
        ? `Wij hebben uw ${vergunning.title} ingetrokken.`
        : `Uw ${vergunning.title} is verlopen.`,
      isActive: true,
      isChecked: true,
    };

    steps.push(statusGewijzigd);
  }

  return steps;
}

export function getDisplayStatus(
  vergunning: VergunningFrontend,
  steps: StatusLineItem[]
) {
  if (vergunning.processed && !vergunning.isExpired && vergunning.decision) {
    return vergunning.decision;
  }

  return steps.find((step) => step.isActive)?.status ?? 'Onbekend';
}

export const forTesting = {
  getStatusStepsRVVSloterweg,
};
