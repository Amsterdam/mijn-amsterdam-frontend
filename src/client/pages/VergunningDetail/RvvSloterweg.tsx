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

  const isRevoked = vergunning.decision === RVV_SLOTERWEG_RESULT_NOT_APPLICABLE;
  const isMatured = vergunning.decision === RVV_SLOTERWEG_RESULT_MATURED;
  const isReceived =
    (!vergunning.dateWorkflowActive || !vergunning.dateWorkflowVerleend) &&
    !vergunning.decision;
  const isInprogress = !!vergunning.dateWorkflowActive && !vergunning.decision;
  const isGranted = !!vergunning.dateWorkflowVerleend && !vergunning.decision;

  const isExpired =
    (vergunning.dateEnd && isGranted
      ? new Date(vergunning.dateEnd) < new Date()
      : false) ||
    vergunning.decision === RVV_SLOTERWEG_RESULT_UPDATED_WIHT_NEW_KENTEKEN;

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
  ];

  if (isChangeRequest) {
    lineItems.push({
      id: 'status-in-in-behandeling',
      status: 'In behandeling',
      datePublished: vergunning.dateWorkflowActive ?? '',
      description: '',
      documents: [],
      isActive: isInprogress && !isGranted,
      isChecked: isInprogress,
    });
  }

  lineItems.push({
    id: 'status-in-verleend',
    status: 'Verleend',
    datePublished: vergunning.dateWorkflowVerleend ?? '',
    description: '',
    documents: [],
    isActive: isGranted,
    isChecked: !!vergunning.dateWorkflowVerleend,
  });

  if (isRevoked) {
    lineItems.push({
      id: 'status-ingetrokken',
      status: 'Ingetrokken',
      datePublished: vergunning.dateDecision ?? '',
      description: '',
      documents: [],
      isActive: true,
      isChecked: true,
    });
  }

  if (isMatured) {
    lineItems.push({
      id: 'status-vervallen',
      status: 'Vervallen',
      datePublished: vergunning.dateDecision ?? '',
      description:
        'Uw heeft een nieuw kenteken aangevraagd. Bekijk uw ontheffing in het overzicht.',
      documents: [],
      isActive: true,
      isChecked: true,
    });
  }

  if (isExpired) {
    lineItems.push({
      id: 'status-verlopen',
      status: 'Verlopen',
      datePublished:
        (isGranted
          ? vergunning.dateEnd // NOTE: Verloopt obv einde ontheffing
          : vergunning.dateDecision) ?? '',
      description: '',
      documents: [],
      isActive: true,
      isChecked: true,
    });
  }

  if (isGranted && !isExpired) {
    lineItems.push({
      id: 'status-verlopen-placeholder',
      status: 'Verlopen',
      datePublished: '',
      description: '',
      documents: [],
      isActive: false,
      isChecked: false,
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
          label="Vorige kenteken"
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
