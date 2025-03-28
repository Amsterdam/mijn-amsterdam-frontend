import { Location } from './Location';
import type {
  EvenementVergunning,
  VergunningFrontend,
} from '../../../../server/services/vergunningen/config-and-types';
import {
  defaultDateFormat,
  defaultDateTimeFormat,
} from '../../../../universal/helpers/date';
import { StatusLineItem } from '../../../../universal/types';
import InfoDetail, {
  InfoDetailGroup,
} from '../../../components/InfoDetail/InfoDetail';

export function getEvenementVergunningLineItems(
  vergunning: VergunningFrontend<EvenementVergunning>
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
  vergunning: VergunningFrontend;
}) {
  const vergunningData = vergunning as VergunningFrontend<EvenementVergunning>;
  return (
    <>
      <InfoDetail label="Kenmerk" value={vergunningData.identifier || '-'} />
      <InfoDetail
        label="Omschrijving"
        value={vergunningData.description || '-'}
      />
      {!!vergunningData.location && (
        <Location location={vergunningData.location} />
      )}

      <InfoDetailGroup>
        <InfoDetail
          label="Vanaf"
          value={
            vergunningData.timeStart && vergunningData.dateStart
              ? defaultDateTimeFormat(
                  `${vergunningData.dateStart}T${vergunningData.timeStart}`
                )
              : vergunningData.dateStart
                ? defaultDateFormat(vergunningData.dateStart)
                : '-'
          }
        />
        <InfoDetail
          label="Tot en met"
          value={
            vergunningData.timeEnd && vergunningData.dateEnd
              ? defaultDateTimeFormat(
                  `${vergunningData.dateEnd}T${vergunningData.timeEnd}`
                )
              : vergunningData.dateEnd
                ? defaultDateFormat(vergunningData.dateEnd)
                : '-'
          }
        />
      </InfoDetailGroup>
      {!!vergunningData.decision && (
        <InfoDetail label="Resultaat" value={vergunningData.decision} />
      )}
    </>
  );
}
