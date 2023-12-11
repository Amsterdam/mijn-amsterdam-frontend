import type { RVVSloterweg } from '../../../server/services';
import { defaultDateFormat } from '../../../universal/helpers';
import { StatusLineItem } from '../../../universal/types';
import { InfoDetail } from '../../components';
import { InfoDetailGroup } from '../../components/InfoDetail/InfoDetail';

const RVV_SLOTERWEG_RESULT_NOT_APPLICABLE = 'Ingetrokken';
const RVV_SLOTERWEG_RESULT_EXPIRED = 'Verlopen';
const RVV_SLOTERWEG_RESULT_UPDATED_WITH_NEW_KENTEKEN = 'Vervallen';

export function getRVVSloterwegLineItems(
  vergunning: RVVSloterweg
): StatusLineItem[] {
  const isChangeRequest = vergunning.requestType !== 'Nieuw';

  const isReceived =
    (!vergunning.dateWorkflowActive || !vergunning.dateWorkflowVerleend) &&
    !vergunning.decision;

  const isInprogress = !!vergunning.dateWorkflowActive || !isChangeRequest;
  const isGranted = !!vergunning.dateWorkflowVerleend;
  const isExpiredByEndDate =
    vergunning.dateEnd &&
    isGranted &&
    new Date(vergunning.dateEnd) <= new Date();
  const isExpired =
    isExpiredByEndDate || vergunning.decision === RVV_SLOTERWEG_RESULT_EXPIRED;

  const dateInProgress =
    (isChangeRequest
      ? vergunning.dateWorkflowActive
      : vergunning.dateRequest) ?? '';

  const hasDecision = [
    RVV_SLOTERWEG_RESULT_NOT_APPLICABLE,
    RVV_SLOTERWEG_RESULT_EXPIRED,
    RVV_SLOTERWEG_RESULT_UPDATED_WITH_NEW_KENTEKEN,
  ].includes(vergunning.decision);

  const isIngetrokken =
    vergunning.decision === RVV_SLOTERWEG_RESULT_NOT_APPLICABLE;

  const hasUpdatedKenteken =
    vergunning.decision === RVV_SLOTERWEG_RESULT_UPDATED_WITH_NEW_KENTEKEN;

  const descriptionIngetrokken = `Wij hebben uw RVV ontheffing ${vergunning.area} voor kenteken ${vergunning.licensePlates} ingetrokken. Zie het intrekkingsbesluit voor meer informatie.`;

  let descriptionAfgehandeld = '';

  switch (true) {
    case isGranted && isChangeRequest:
      descriptionAfgehandeld = `Wij hebben uw kentekenwijziging voor een ${vergunning.title} verleend.`;
      break;
    case isGranted && !isChangeRequest:
      descriptionAfgehandeld = `Wij hebben uw aanvraag voor een RVV ontheffing ${vergunning.area} ${vergunning.licensePlates} verleend.`;
      break;
    case !isGranted && isIngetrokken:
      descriptionAfgehandeld = descriptionIngetrokken;
      break;
  }

  const lineItems: StatusLineItem[] = [
    {
      id: 'status-ontvangen',
      status: 'Ontvangen',
      datePublished: vergunning.dateRequest,
      description: '',
      documents: [],
      isActive: isReceived && !isGranted && !isInprogress,
      isChecked: true,
    },
    {
      id: 'status-in-behandeling',
      status: 'In behandeling',
      datePublished: dateInProgress,
      description: '',
      documents: [],
      isActive: isInprogress && !isGranted && !hasDecision,
      isChecked: isInprogress || isGranted || hasDecision,
    },
    {
      id: 'status-afgehandeld',
      status: 'Afgehandeld',
      datePublished: !!vergunning.dateDecision
        ? vergunning.dateDecision
        : !!vergunning.dateWorkflowVerleend
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
        description = `Uw RVV ontheffing ${vergunning.area} voor kenteken ${vergunning.licensePlates} is verlopen.`;
        break;
      case hasUpdatedKenteken:
        description =
          'U heeft een nieuw kenteken doorgegeven. Bekijk de ontheffing voor het nieuwe kenteken in het overzicht.';
        break;
    }

    lineItems.push({
      id: 'status-gewijzigd',
      status: 'Gewijzigd',
      datePublished:
        (isExpired ? vergunning.dateEnd : vergunning.dateDecision) ?? '',
      description,
      documents: [],
      isActive: true,
      isChecked: true,
    });
  }

  return lineItems;
}

export function RvvSloterweg({ vergunning }: { vergunning: RVVSloterweg }) {
  const isGranted = !!vergunning.dateWorkflowVerleend;
  const isChangeRequest = vergunning.requestType === 'Wijziging';

  return (
    <>
      <InfoDetail label="Kenmerk" value={vergunning.identifier} />
      {vergunning.requestType === 'Wijziging' && (
        <InfoDetail label="Verzoek" value={vergunning.requestType} />
      )}
      <InfoDetail label="Zone" value={vergunning.area} />

      <InfoDetail
        label={isChangeRequest ? 'Nieuw kenteken' : 'Kenteken'}
        value={vergunning.licensePlates}
      />
      {vergunning.previousLicensePlates && (
        <InfoDetail
          label="Oud kenteken"
          value={vergunning.previousLicensePlates}
        />
      )}
      <InfoDetailGroup>
        <InfoDetail
          label="Van"
          value={
            vergunning.dateStart ? defaultDateFormat(vergunning.dateStart) : '-'
          }
        />
        {isGranted && (
          <InfoDetail
            label="Tot"
            value={
              vergunning.dateEnd ? defaultDateFormat(vergunning.dateEnd) : '-'
            }
          />
        )}
      </InfoDetailGroup>

      {!!vergunning.decision && (
        <InfoDetail label="Resultaat" value={vergunning.decision} />
      )}
    </>
  );
}
