import { UnorderedList } from '@amsterdam/design-system-react';

import styles from './fields-config.module.scss';
import type {
  DecosZaakBase,
  WithDateTimeRange,
  WithDateRange,
  WithLocation,
  WithKentekens,
  WithDateStart,
  WithDateEnd,
  WithTimeRange,
} from '../../../../../server/services/decos/decos-types.ts';
import { VergunningFrontend } from '../../../../../server/services/vergunningen/config-and-types.ts';
import { dateTimeFormatYear } from '../../../../../universal/helpers/date.ts';
import {
  Row,
  RowSet,
  WrappedRow,
  type DatalistProps,
} from '../../../../components/Datalist/Datalist.tsx';
import { AddressDisplayAndModal } from '../../../../components/LocationModal/LocationModal.tsx';

type DataListRowOptions = {
  endDateIncluded?: boolean;
};

type VergunningDataListRow<T extends VergunningFrontend = VergunningFrontend> =
  (
    vergunning: T,
    options?: DataListRowOptions
  ) => Row | RowSet | null | Array<Row | RowSet | null>;

export type RowTransformer<T extends VergunningFrontend = VergunningFrontend> =
  Record<string, VergunningDataListRow<T>>;

export const identifier: VergunningDataListRow = (vergunning) => {
  return {
    label: 'Zaaknummer',
    content: vergunning.identifier,
  };
};

export const onFromTo: VergunningDataListRow<
  VergunningFrontend<DecosZaakBase & WithDateTimeRange>
> = (vergunning) => {
  if (!('timeStart' in vergunning && 'timeEnd' in vergunning)) {
    return null;
  }
  const on: WrappedRow | null = vergunning.dateStartFormatted
    ? {
        label: 'Op',
        content: vergunning.dateStartFormatted,
        span: 4,
      }
    : null;

  const from: WrappedRow | null = vergunning.timeStart
    ? {
        label: 'Van',
        content: `${vergunning.timeStart} uur`,
        span: 4,
      }
    : null;

  const to: WrappedRow | null = vergunning.timeEnd
    ? {
        label: 'Tot',
        content: `${vergunning.timeEnd} uur`,
        span: 4,
      }
    : null;

  const rows = [on, from, to].filter((row) => row !== null);

  return rows.length ? { rows } : null;
};

export const dateTimeRange: VergunningDataListRow<
  VergunningFrontend<DecosZaakBase & WithDateTimeRange>
> = (vergunning) => {
  if (!('timeStart' in vergunning && 'timeEnd' in vergunning)) {
    return null;
  }

  const from: WrappedRow | null = vergunning.dateStart
    ? {
        label: 'Van',
        content: vergunning.timeStart
          ? dateTimeFormatYear(
              `${vergunning.dateStart.split('T')[0]}T${vergunning.timeStart}`
            )
          : vergunning.dateStartFormatted,
        span: 4,
      }
    : null;

  const to: WrappedRow | null = vergunning.dateEnd
    ? {
        label: 'Tot en met',
        content: vergunning.timeEnd
          ? dateTimeFormatYear(
              `${vergunning.dateEnd.split('T')[0]}T${vergunning.timeEnd}`
            )
          : vergunning.dateEndFormatted,
        span: 4,
      }
    : null;

  const rows = [from, to].filter((row) => row !== null);

  return rows.length ? { rows } : null;
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
  const dateTimeRangeRowSet = dateRange(vergunning);
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
    rowSet.rows.push(timeRange as WrappedRow);
  }

  return rowSet;
};

export const location: VergunningDataListRow<
  VergunningFrontend<DecosZaakBase & WithLocation>
> = (vergunning) =>
  'location' in vergunning && typeof vergunning.location === 'string'
    ? {
        label: 'Locatie',
        content: <AddressDisplayAndModal address={vergunning.location} />,
      }
    : null;

export const address: VergunningDataListRow<
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
          <UnorderedList className={styles.LicensePlatesList}>
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
  VergunningFrontend<DecosZaakBase & { description: string | null }>
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
  address,
  onFromTo,
  timeEnd,
  timeRange,
  timeStart,
} as const;

export function getRows<T extends VergunningFrontend>(
  vergunning: T,
  keysOrTransformers: (VergunningDataListRow<T> | Row | RowSet)[]
): DatalistProps['rows'] {
  const rows = keysOrTransformers
    .map((transformerOrRowType) => {
      if (typeof transformerOrRowType === 'function') {
        // transformerOrRowType is a transformer object
        return transformerOrRowType(vergunning);
      }
      return transformerOrRowType;
    })
    .flat()
    .filter((row) => row !== null);

  return rows;
}
