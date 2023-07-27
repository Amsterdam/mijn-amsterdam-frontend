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

  if (vergunning.requestType === 'Nieuw') {
    const decision =
      vergunning.decision === 'Verleend'
        ? 'Verlopen'
        : // Splits "Ingetrokken door gemeente" to "Ingetrokken"
          vergunning.decision?.split(' ')[0] ?? 'Verlopen';
    return [
      {
        id: 'item-1',
        status: 'Ontvangen',
        datePublished: vergunning.dateRequest,
        description: '',
        documents: [],
        isActive: false,
        isChecked: true,
      },
      {
        id: 'mid-item',
        status: 'Verleend',
        datePublished: vergunning.dateDecision ?? '',
        description: '',
        documents: [],
        isActive: !isExpired,
        isChecked: true,
      },
      {
        id: 'last-item',
        status: decision,
        datePublished:
          vergunning.decision === 'Verleend' ||
          vergunning.decision === 'Verlopen'
            ? vergunning.dateEnd ?? ''
            : vergunning.dateDecision ?? '',
        description: '',
        documents: [],
        isActive: isExpired,
        isChecked: isExpired,
      },
    ];
  }

  let decision = 'Afgehandeld';

  if (
    vergunning.decision === 'Verleend' ||
    vergunning.decision === 'Verlopen'
  ) {
    decision = 'Verleend';
  } else {
    decision = vergunning.decision?.split(' ')[0] ?? 'Verleend'; // Splits "Ingetrokken door gemeente" to "Ingetrokken"
  }

  // vergunning.decision === 'Verleend'
  //   ? 'Verlopen'

  const lineItems = [
    {
      id: 'item-1',
      status: 'Ontvangen',
      datePublished: vergunning.dateRequest,
      description: '',
      documents: [],
      isActive: false,
      isChecked: true,
    },
    {
      id: 'item-2',
      status: 'In behandeling',
      datePublished: vergunning.dateWorkflowActive || '',
      description: '',
      documents: [],
      isActive: inProgressActive,
      isChecked: hasDateWorkflowActive,
    },
    {
      id: 'item-3',
      status: decision,
      datePublished: vergunning.dateDecision || '',
      description: '',
      documents: [],
      isActive: isDone && !isExpired,
      isChecked: isDone,
    },
    {
      id: 'last-item',
      status: 'Verlopen',
      datePublished: vergunning.dateEnd ?? '',
      description: '',
      documents: [],
      isActive: isExpired,
      isChecked: isExpired,
    },
  ];

  // Ingetrokken/Geweigerde vergunningen kunnen niet verlopen
  if (
    vergunning.decision !== 'Verleend' &&
    vergunning.decision !== 'Verlopen'
  ) {
    lineItems.pop();
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
