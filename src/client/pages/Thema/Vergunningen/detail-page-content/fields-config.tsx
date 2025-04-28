import { UnorderedList } from '@amsterdam/design-system-react';

import type {
  DecosZaakBase,
  WithDateEnd,
  WithDateRange,
  WithDateStart,
  WithDateTimeRange,
  WithKentekens,
  WithLocation,
  WithTimeRange,
} from '../../../../../server/services/decos/config-and-types';
import { VergunningFrontend } from '../../../../../server/services/vergunningen/config-and-types';
import {
  defaultDateFormat,
  defaultDateTimeFormat,
} from '../../../../../universal/helpers/date';
import {
  Row,
  RowSet,
  WrappedRow,
  type DatalistProps,
} from '../../../../components/Datalist/Datalist';
import { AddressDisplayAndModal } from '../../../../components/LocationModal/LocationModal';

type DataListRowOptions = {
  endDateIncluded?: boolean;
};

type VergunningDataListRow<T extends VergunningFrontend = VergunningFrontend> =
  (vergunning: T, options?: DataListRowOptions) => Row | RowSet | null;

export type RowTransformer<T extends VergunningFrontend = VergunningFrontend> =
  Record<string, VergunningDataListRow<T>>;

export const identifier: VergunningDataListRow = (vergunning) => {
  return {
    label: 'Kenmerk',
    content: vergunning.identifier,
  };
};

export const onFromTo: VergunningDataListRow<
  VergunningFrontend<DecosZaakBase & WithDateTimeRange>
> = (vergunning) => {
  if (!('timeStart' in vergunning && 'timeEnd' in vergunning)) {
    return null;
  }
  const on: WrappedRow = {
    label: 'Op',
    content: vergunning.dateStart
      ? defaultDateFormat(vergunning.dateStart)
      : '-',
    span: 4,
  };

  const from: WrappedRow = {
    label: 'Van',
    content: vergunning.timeStart ? `${vergunning.timeStart} uur` : '-',
    span: 4,
  };

  const to: WrappedRow = {
    label: 'Tot',
    content: vergunning.timeEnd ? `${vergunning.timeEnd} uur` : '-',
    span: 4,
  };

  return { rows: [on, from, to] };
};

export const dateTimeRange: VergunningDataListRow<
  VergunningFrontend<DecosZaakBase & WithDateTimeRange>
> = (vergunning) => {
  const isVerleend = vergunning?.decision === 'Verleend';
  if (!('timeStart' in vergunning && 'timeEnd' in vergunning) || !isVerleend) {
    return null;
  }

  const from: WrappedRow = {
    label: 'Van',
    content:
      vergunning?.timeStart && vergunning?.dateStart
        ? defaultDateTimeFormat(
            `${vergunning.dateStart}T${vergunning.timeStart}`
          )
        : vergunning.dateStart
          ? defaultDateFormat(vergunning.dateStart)
          : '-',
    span: 4,
  };

  const to: WrappedRow = {
    label: 'Tot en met',
    content:
      vergunning?.timeEnd && vergunning?.dateEnd
        ? defaultDateTimeFormat(`${vergunning.dateEnd}T${vergunning.timeEnd}`)
        : vergunning.dateEnd
          ? defaultDateFormat(vergunning.dateEnd)
          : '-',
    span: 4,
  };

  const rowSet: RowSet = { rows: [from, to] };

  return rowSet;
};

export const dateRange: VergunningDataListRow<
  VergunningFrontend<DecosZaakBase & WithDateRange>
> = (vergunning, options: DataListRowOptions = { endDateIncluded: true }) => {
  const from = commonTransformers.dateStart(vergunning) as WrappedRow;
  const to = commonTransformers.dateEnd(vergunning, options) as WrappedRow;

  const rowSet: RowSet = {
    rows: [
      { ...from, span: 4 },
      { ...to, span: 4 },
    ],
  };

  return rowSet;
};

export const dateTimeRangeBetween: VergunningDataListRow<
  VergunningFrontend<DecosZaakBase & WithDateTimeRange>
> = (vergunning) => {
  const dateTimeRangeRowSet = dateTimeRange(vergunning);
  if (!dateTimeRangeRowSet) {
    return null;
  }
  const rows = 'rows' in dateTimeRangeRowSet ? dateTimeRangeRowSet.rows : [];
  if (!rows.length) {
    return null;
  }
  const rowSet: RowSet = {
    rows: [...rows],
  };

  const timeRange = commonTransformers.timeRange(vergunning);

  if (timeRange && !('rows' in timeRange)) {
    rowSet.rows.push(timeRange);
  }

  return rowSet;
};

export const location: VergunningDataListRow<
  VergunningFrontend<DecosZaakBase & WithLocation>
> = (vergunning) =>
  'location' in vergunning && typeof vergunning.location === 'string'
    ? {
        label: 'Adres',
        content: <AddressDisplayAndModal address={vergunning.location} />,
      }
    : null;

export const decision: VergunningDataListRow<VergunningFrontend> = (
  vergunning
) =>
  vergunning.decision && vergunning.processed
    ? {
        label: 'Resultaat',
        content: vergunning.decision,
      }
    : null;

export const kentekens: VergunningDataListRow<
  VergunningFrontend<DecosZaakBase & WithKentekens>
> = (vergunning) => {
  const hasMultipleKentekens = vergunning?.kentekens?.includes('|');
  return 'kentekens' in vergunning && typeof vergunning.kentekens === 'string'
    ? {
        label: `Kenteken${hasMultipleKentekens ? 's' : ''}`,
        content: hasMultipleKentekens ? (
          <UnorderedList>
            {vergunning.kentekens.split('|').map((kenteken) => (
              <UnorderedList.Item key={kenteken}>
                {kenteken.trim()}
              </UnorderedList.Item>
            ))}
          </UnorderedList>
        ) : (
          vergunning.kentekens
        ),
      }
    : null;
};

export const dateStartedOn: VergunningDataListRow<
  VergunningFrontend<DecosZaakBase & WithDateStart>
> = (vergunning) => ({
  label: `Op`,
  content: vergunning.dateStartFormatted,
});

export const dateStart: VergunningDataListRow<
  VergunningFrontend<DecosZaakBase & WithDateStart>
> = (vergunning) => ({
  label: `Van`,
  content: vergunning.dateStartFormatted,
});

export const dateEnd: VergunningDataListRow<
  VergunningFrontend<DecosZaakBase & WithDateEnd>
> = (vergunning, options = { endDateIncluded: true }) => ({
  label: options?.endDateIncluded ? `Tot en met` : 'Tot',
  content: vergunning.dateEndFormatted,
});

export const timeStart: VergunningDataListRow<VergunningFrontend> = (
  vergunning
) =>
  'timeStart' in vergunning && typeof vergunning.timeStart === 'string'
    ? {
        label: `Van`,
        content: vergunning.timeStart,
      }
    : null;

export const timeEnd: VergunningDataListRow<VergunningFrontend> = (
  vergunning
) =>
  'timeEnd' in vergunning && typeof vergunning.timeEnd === 'string'
    ? {
        label: 'Tot',
        content: vergunning.timeEnd,
      }
    : null;

export const timeRange: VergunningDataListRow<
  VergunningFrontend<DecosZaakBase & WithTimeRange>
> = (vergunning) =>
  'timeStart' in vergunning &&
  'timeEnd' in vergunning &&
  typeof vergunning.timeStart === 'string' &&
  typeof vergunning.timeEnd === 'string'
    ? {
        label: 'Tussen',
        content: `${vergunning.timeStart} - ${vergunning.timeEnd} uur`,
      }
    : null;

export const description: VergunningDataListRow<
  VergunningFrontend<DecosZaakBase & { description: string }>
> = (vergunning) => {
  return {
    label: 'Omschrijving',
    content: vergunning.description,
  };
};

export const commonTransformers = {
  dateEnd,
  dateRange,
  dateStart,
  dateStartedOn,
  dateTimeRange,
  dateTimeRangeBetween,
  decision,
  description,
  identifier,
  kentekens,
  location,
  onFromTo,
  timeEnd,
  timeRange,
  timeStart,
} as const;

// Eplicit type because we cannot? type the keys of a Record<string, xxx>
type TransformerKey = keyof typeof commonTransformers;

export function getRows<T extends VergunningFrontend>(
  vergunning: T,
  keysOrTransformers: (TransformerKey | VergunningDataListRow<T>)[]
): DatalistProps['rows'] {
  const rows = keysOrTransformers
    .map((keyOrTransformer) => {
      if (typeof keyOrTransformer === 'string') {
        // Check if the key has a common transformer attached to it
        // If the key has a common transformer attached to it, return the key and the transformed value.
        return commonTransformers[keyOrTransformer]?.(vergunning) ?? null;
      }

      // KeyOrTransformer is a transformer object
      return keyOrTransformer(vergunning);
    })
    .filter((row) => row !== null);

  return rows;
}
