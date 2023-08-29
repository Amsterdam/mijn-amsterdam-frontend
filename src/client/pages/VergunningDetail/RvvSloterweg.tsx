import type { RVVSloterweg } from '../../../server/services';
import { defaultDateFormat } from '../../../universal/helpers';
import { StatusLineItem } from '../../../universal/types';
import { InfoDetail } from '../../components';
import { InfoDetailGroup } from '../../components/InfoDetail/InfoDetail';

const RVV_SLOTERWEG_RESULT_NOT_APPLICABLE = 'Ingetrokken';
const RVV_SLOTERWEG_RESULT_UPDATED_WIHT_NEW_KENTEKEN = 'Verlopen';
const RVV_SLOTERWEG_RESULT_GRANTED = 'Verleend';

export function getRVVSloterwegLineItems(
  vergunning: RVVSloterweg
): StatusLineItem[] {
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
      datePublished: vergunning.dateRequest,
      description: '',
      documents: [],
      isActive: false,
      isChecked: true,
    },
    {
      id: 'status-afgehandeld',
      status: 'Afgehandeld',
      datePublished: vergunning.dateRequest,
      description: '',
      documents: [],
      isActive: !(
        vergunning.decision === RVV_SLOTERWEG_RESULT_NOT_APPLICABLE ||
        isExpired ||
        RVV_SLOTERWEG_RESULT_UPDATED_WIHT_NEW_KENTEKEN
      ),
      isChecked: true,
    },
  ];

  if (!!vergunning.decision) {
    lineItems.push({
      id: 'status-verlopen',
      status: 'Verlopen',
      datePublished:
        (vergunning.decision === RVV_SLOTERWEG_RESULT_GRANTED
          ? vergunning.dateEnd // NOTE: Verloopt obv einde ontheffing
          : vergunning.dateDecision) ?? '',
      description:
        vergunning.decision === RVV_SLOTERWEG_RESULT_UPDATED_WIHT_NEW_KENTEKEN // TODO: Uitvinden welke status we hier moeten checken.
          ? 'Uw heeft een nieuw kenteken aangevraagd. Bekijk uw ontheffing in het overzicht.'
          : '',
      documents: [],
      isActive:
        isExpired ||
        vergunning.decision === RVV_SLOTERWEG_RESULT_NOT_APPLICABLE,
      isChecked:
        isExpired ||
        vergunning.decision === RVV_SLOTERWEG_RESULT_NOT_APPLICABLE,
    });
  }

  return lineItems;
}

export function RvvSloterweg({ vergunning }: { vergunning: RVVSloterweg }) {
  return (
    <>
      <InfoDetail label="Kenmerk" value={vergunning.identifier} />
      <InfoDetailGroup>
        {vergunning.requestType === 'Kenteken wijziging' && (
          <InfoDetail label="Verzoek" value={vergunning.requestType} />
        )}
        <InfoDetail label="Zone" value={vergunning.area} />
      </InfoDetailGroup>
      <InfoDetail label="Kenteken(s)" value={vergunning.licensePlates} />
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
