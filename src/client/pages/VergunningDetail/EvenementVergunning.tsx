import type { EvenementVergunning as EvenementVergunningType } from '../../../server/services';
import {
  defaultDateFormat,
  defaultDateTimeFormat,
} from '../../../universal/helpers';
import { StatusLineItem } from '../../../universal/types';
import InfoDetail, {
  InfoDetailGroup,
} from '../../components/InfoDetail/InfoDetail';
import { Location } from './Location';

export function getEvenementVergunningLineItems(
  vergunning: EvenementVergunningType
): StatusLineItem[] {
  const isDone = vergunning.processed;

  const lineItems = [
    {
      id: 'item-1',
      status: 'Ontvangen',
      datePublished: vergunning.dateRequest,
      description: '',
      documents: [],
      isActive: !isDone,
      isChecked: true,
    },
    {
      id: 'last-item',
      status: 'Afgehandeld',
      datePublished: vergunning.dateDecision || '',
      description: '',
      documents: [],
      isActive: isDone,
      isChecked: isDone,
    },
  ];

  return lineItems;
}

export function EvenementVergunning({
  vergunning,
}: {
  vergunning: EvenementVergunningType;
}) {
  return (
    <>
      <InfoDetail label="Kenmerk" value={vergunning?.identifier || '-'} />
      <InfoDetail label="Omschrijving" value={vergunning.description || '-'} />
      {!!vergunning.location && <Location location={vergunning.location} />}

      <InfoDetailGroup>
        <InfoDetail
          label="Vanaf"
          value={
            vergunning?.timeStart && vergunning?.dateStart
              ? defaultDateTimeFormat(
                  `${vergunning.dateStart}T${vergunning.timeStart}`
                )
              : vergunning.dateStart
                ? defaultDateFormat(vergunning.dateStart)
                : '-'
          }
        />
        <InfoDetail
          label="Tot en met"
          value={
            vergunning?.timeEnd && vergunning?.dateEnd
              ? defaultDateTimeFormat(
                  `${vergunning.dateEnd}T${vergunning.timeEnd}`
                )
              : vergunning.dateEnd
                ? defaultDateFormat(vergunning.dateEnd)
                : '-'
          }
        />
      </InfoDetailGroup>
      {!!vergunning?.decision && (
        <InfoDetail label="Resultaat" value={vergunning.decision} />
      )}
    </>
  );
}
