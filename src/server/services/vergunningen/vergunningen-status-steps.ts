import { RVVSloterweg, VergunningFrontend } from './config-and-types';
import { StatusLineItem } from '../../../universal/types';
import { CaseTypeV2 } from '../../../universal/types/decos-zaken';
import { getStatusDate } from '../decos/decos-helpers';

export function getStatusStepsRVVSloterweg(
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

export function getStatusSteps<V extends VergunningFrontend>(vergunning: V) {
  // TODO: Ask Terry to assess this compiler problem
  if (vergunning.caseType === CaseTypeV2.RVVSloterweg) {
    return getStatusStepsRVVSloterweg(
      vergunning as unknown as VergunningFrontend<RVVSloterweg>
    );
  }

  const isAfgehandeld = vergunning.processed;
  const dateInBehandeling = getStatusDate('In behandeling', vergunning);
  const hasDateInBehandeling = !!dateInBehandeling;
  const isInBehandeling = hasDateInBehandeling && !isAfgehandeld;
  const isExpiredByEndDate =
    !!vergunning.dateEnd &&
    vergunning.decision === 'Verleend' &&
    new Date(vergunning.dateEnd) <= new Date();
  const isExpired = isExpiredByEndDate;

  const steps: StatusLineItem[] = [
    {
      id: 'step-1',
      status: 'Ontvangen',
      datePublished: vergunning.dateRequest,
      description: '',
      documents: [],
      isActive: !isInBehandeling && !isAfgehandeld,
      isChecked: true,
    },
    {
      id: 'step-2',
      status: 'In behandeling',
      datePublished: dateInBehandeling || '',
      description: '',
      documents: [],
      isActive: isInBehandeling,
      isChecked: hasDateInBehandeling || isAfgehandeld,
    },
    {
      id: 'step-3',
      status: 'Afgehandeld',
      datePublished: vergunning.dateDecision || '',
      description:
        isAfgehandeld &&
        vergunning.decision &&
        ['Verleend', 'Ingetrokken', 'Niet verleend', 'Geweigerd'].includes(
          vergunning.decision
        )
          ? `Wij hebben uw aanvraag ${vergunning.title} <strong>${vergunning.decision}</strong>`
          : '', // Complex decisions cannot be captured in a generic text.
      documents: [],
      isActive: !isExpired && isAfgehandeld,
      isChecked: isAfgehandeld,
    },
  ];

  if ('isExpired' in vergunning) {
    if (isExpired) {
      steps.push({
        id: 'step-4',
        status: 'Gewijzigd',
        datePublished: vergunning.dateEnd ?? '',
        description: `Uw ${vergunning.title} is verlopen.`,
        documents: [],
        isActive: true,
        isChecked: true,
      });
    }
  }

  return steps;
}
