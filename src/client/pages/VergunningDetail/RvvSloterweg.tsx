import type { RVVSloterweg } from '../../../server/services';
import { defaultDateFormat } from '../../../universal/helpers';
import { StatusLineItem } from '../../../universal/types';
import { InfoDetail } from '../../components';
import { InfoDetailGroup } from '../../components/InfoDetail/InfoDetail';

const RVV_SLOTERWEG_RESULT_NOT_APPLICABLE = 'Ingetrokken';
const RVV_SLOTERWEG_RESULT_UPDATED_WIHT_NEW_KENTEKEN = 'Verlopen';
const RVV_SLOTERWEG_RESULT_MATURED = 'Vervallen';

export function getRVVSloterwegLineItems(
  vergunning: RVVSloterweg
): StatusLineItem[] {
  const isChangeRequest = vergunning.requestType === 'Wijziging';

  const isReceived =
    (!vergunning.dateWorkflowActive || !vergunning.dateWorkflowVerleend) &&
    !vergunning.decision;
  const isInprogress = !!vergunning.dateWorkflowActive || !isChangeRequest;
  const isGranted = !!vergunning.dateWorkflowVerleend;

  const isExpired =
    vergunning.dateEnd && isGranted
      ? new Date(vergunning.dateEnd) < new Date()
      : false;

  const hasDecision = !!vergunning.decision;

  let dateInProgress = vergunning.dateWorkflowActive ?? '';

  if (!isChangeRequest) {
    dateInProgress = vergunning.dateRequest;
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
      datePublished: !!vergunning.dateWorkflowVerleend
        ? vergunning.dateWorkflowVerleend
        : !!vergunning.dateDecision
        ? vergunning.dateDecision
        : '',
      description:
        'Wij hebben uw aanvraag voor een RVV ontheffing Sloterweg verleend.',
      documents: [],
      isActive: isGranted && !(hasDecision || isExpired),
      isChecked: isGranted,
    },
  ];

  if (hasDecision || isExpired) {
    let description = '';
    if (
      isExpired ||
      vergunning.decision === RVV_SLOTERWEG_RESULT_UPDATED_WIHT_NEW_KENTEKEN
    ) {
      description = 'Uw RVV ontheffing Sloterweg is verlopen.';
    }

    if (vergunning.decision === RVV_SLOTERWEG_RESULT_NOT_APPLICABLE) {
      description =
        'Wij hebben uw RVV ontheffing Sloterweg ingetrokken. Bekijk het document voor details.';
    }

    if (vergunning.decision === RVV_SLOTERWEG_RESULT_MATURED) {
      description =
        'U heeft een ketekenwijziging doorgegeven. Bekijk de ontheffing voor het nieuwe kenteken in het overzicht.';
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

  return (
    <>
      <InfoDetail label="Kenmerk" value={vergunning.identifier} />
      {vergunning.requestType === 'Wijziging' && (
        <InfoDetail label="Verzoek" value={vergunning.requestType} />
      )}
      <InfoDetail label="Zone" value={vergunning.area} />

      <InfoDetail label="Kenteken" value={vergunning.licensePlates} />
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
