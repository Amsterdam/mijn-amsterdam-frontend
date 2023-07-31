import type { RVVSloterweg } from '../../../server/services';
import { defaultDateFormat } from '../../../universal/helpers';
import { StatusLineItem } from '../../../universal/types';
import { InfoDetail } from '../../components';
import { InfoDetailGroup } from '../../components/InfoDetail/InfoDetail';

export function getRVVSloterwegLineItems(
  vergunning: RVVSloterweg
): StatusLineItem[] {
  const isDone = vergunning.processed;
  const hasDateWorkflowActive = !!vergunning.dateWorkflowActive;
  const inProgressActive = hasDateWorkflowActive && !isDone;

  const isExpired = vergunning.dateEnd
    ? new Date(vergunning.dateEnd) < new Date()
    : false;

  const lineItems = [
    {
      id: 'status-ontvangen',
      status: 'Ontvangen',
      datePublished: vergunning.dateRequest,
      description: '',
      documents: [],
      isActive: false,
      isChecked: true,
    },
    {
      id: 'status-in-behandeling',
      status: 'In behandeling',
      datePublished: vergunning.dateRequest ?? '',
      description: '',
      documents: [],
      isActive: !isExpired,
      isChecked: true,
    },
    {
      id: 'status-afgehandeld',
      status: 'Afgehandeld',
      datePublished: vergunning.dateDecision ?? '',
      description: '',
      documents: [],
      isActive: !isExpired,
      isChecked: true,
    },
  ];

  if (
    vergunning.decision === 'Verleend' ||
    vergunning.decision === 'Verlopen'
  ) {
    lineItems.push({
      id: 'status-verlopen',
      status: 'Verlopen',
      datePublished:
        vergunning.decision === 'Verleend'
          ? vergunning.dateEnd ?? ''
          : vergunning.dateDecision ?? '',
      description:
        vergunning.decision === 'Verlopen'
          ? 'Uw heeft een nieuw kenteken aangevraagd. Bekijk uw ontheffing in het overzicht.'
          : '',
      documents: [],
      isActive: isExpired,
      isChecked: isExpired,
    });
  }

  return lineItems;
}

export function RvvSloterweg({ vergunning }: { vergunning: RVVSloterweg }) {
  return (
    <>
      <InfoDetail label="Kenmerk" value={vergunning.identifier} />
      <InfoDetailGroup>
        <InfoDetail label="Verzoek" value={vergunning.requestType} />
        <InfoDetail label="Zone" value={vergunning.area} />
      </InfoDetailGroup>
      <InfoDetailGroup>
        <InfoDetail label="Kenteken(s)" value={vergunning.licencePlates} />

        {!!vergunning.previousLicensePlates && (
          <InfoDetail
            label="Oude kenteken(s)"
            value={vergunning.previousLicensePlates}
          />
        )}
      </InfoDetailGroup>

      <InfoDetailGroup>
        <InfoDetail
          label="Van"
          value={
            vergunning.dateStart ? defaultDateFormat(vergunning.dateStart) : '-'
          }
        />

        <InfoDetail
          label="Tot en met"
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
