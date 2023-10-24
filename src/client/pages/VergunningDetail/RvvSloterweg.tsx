import type { RVVSloterweg } from '../../../server/services';
import { defaultDateFormat } from '../../../universal/helpers';
import { StatusLineItem } from '../../../universal/types';
import { InfoDetail } from '../../components';
import { InfoDetailGroup } from '../../components/InfoDetail/InfoDetail';

const RVV_SLOTERWEG_RESULT_NOT_APPLICABLE = 'Ingetrokken';
const RVV_SLOTERWEG_RESULT_UPDATED_WIHT_NEW_KENTEKEN = 'Verlopen';
const RVV_SLOTERWEG_RESULT_GRANTED = 'Verleend';
const RVV_SLOTERWEG_RESULT_MATURED = 'Vervallen';

export function getRVVSloterwegLineItems(
  vergunning: RVVSloterweg
): StatusLineItem[] {
  const isExpired =
    (vergunning.dateEnd && vergunning.decision === RVV_SLOTERWEG_RESULT_GRANTED
      ? new Date(vergunning.dateEnd) < new Date()
      : false) ||
    vergunning.decision === RVV_SLOTERWEG_RESULT_UPDATED_WIHT_NEW_KENTEKEN;

  const isRevoked = vergunning.decision === RVV_SLOTERWEG_RESULT_NOT_APPLICABLE;
  const isMatured = vergunning.decision === RVV_SLOTERWEG_RESULT_MATURED;
  const isReceived = !vergunning.decision && !vergunning.dateWorkflowActive;
  const isGranted =
    vergunning.decision === RVV_SLOTERWEG_RESULT_GRANTED &&
    !!vergunning.dateWorkflowVerleend;

  const lineItems = [
    {
      id: 'status-ontvangen',
      status: 'Ontvangen',
      datePublished: vergunning.dateRequest,
      description: '',
      documents: [],
      isActive: isReceived,
      isChecked: true,
    },
    {
      id: 'status-in-verleend',
      status: 'Verleend',
      datePublished: vergunning.dateWorkflowVerleend ?? '',
      description: '',
      documents: [],
      isActive: isGranted && !isRevoked && !isMatured && !isExpired,
      isChecked: !isReceived,
    },
  ];

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
      description: '',
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
        (vergunning.decision === RVV_SLOTERWEG_RESULT_GRANTED
          ? vergunning.dateEnd // NOTE: Verloopt obv einde ontheffing
          : vergunning.dateDecision) ?? '',
      description:
        vergunning.decision === RVV_SLOTERWEG_RESULT_UPDATED_WIHT_NEW_KENTEKEN
          ? 'Uw heeft een nieuw kenteken aangevraagd. Bekijk uw ontheffing in het overzicht.'
          : '',
      documents: [],
      isActive: true,
      isChecked: true,
    });
  }

  return lineItems;
}

export function RvvSloterweg({ vergunning }: { vergunning: RVVSloterweg }) {
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

        <InfoDetail
          label="Tot"
          value={
            vergunning.dateEnd ? defaultDateFormat(vergunning.dateEnd) : '-'
          }
        />
      </InfoDetailGroup>

      {!!vergunning.decision && (
        <InfoDetail label="Resultaat" value={vergunning.decision} />
      )}
    </>
  );
}
