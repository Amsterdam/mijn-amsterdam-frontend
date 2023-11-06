import type { RVVSloterweg } from '../../../server/services';
import { defaultDateFormat } from '../../../universal/helpers';
import { StatusLineItem } from '../../../universal/types';
import { InfoDetail } from '../../components';
import { InfoDetailGroup } from '../../components/InfoDetail/InfoDetail';

export function getRVVSloterwegLineItems(
  vergunning: RVVSloterweg
): StatusLineItem[] {
  const isChangeRequest = vergunning.requestType === 'Wijziging';

  const isReceived =
    (!vergunning.dateWorkflowActive || !vergunning.dateWorkflowVerleend) &&
    !vergunning.decision;
  const isInprogress = !!vergunning.dateWorkflowActive || !isChangeRequest;
  const isGranted = !!vergunning.dateWorkflowVerleend;

  const hasDecision = !!vergunning.decision;

  let dateInProgress = vergunning.dateWorkflowActive ?? '';

  if (!isChangeRequest) {
    dateInProgress = vergunning.dateRequest;
  }

  let decisionText = isGranted
    ? `<p>Ontheffing verleend op ${defaultDateFormat(
        vergunning.dateWorkflowVerleend ?? ''
      )}.</p>`
    : '';

  if (hasDecision) {
    decisionText = `${decisionText}<p>Ontheffing ${vergunning.decision.toLowerCase()} op ${defaultDateFormat(
      vergunning.dateDecision ?? ''
    )}.</p>`;
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
      id: 'status-in-in-behandeling',
      status: 'In behandeling',
      datePublished: dateInProgress,
      description: '',
      documents: [],
      isActive: isInprogress && !isGranted && !hasDecision,
      isChecked: isInprogress,
    },
    {
      id: 'status-in-afgehandeld',
      status: 'Afgehandeld',
      datePublished: !!vergunning.dateWorkflowVerleend
        ? vergunning.dateWorkflowVerleend
        : !!vergunning.dateDecision
        ? vergunning.dateDecision
        : '',
      description: decisionText,
      documents: [],
      isActive: isGranted || hasDecision,
      isChecked: isGranted || hasDecision,
    },
  ];

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
