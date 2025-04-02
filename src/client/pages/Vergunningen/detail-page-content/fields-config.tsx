import styles from './fields-config.module.scss';
import { VergunningFrontend } from '../../../../server/services/vergunningen/config-and-types';
import {
  defaultDateFormat,
  defaultDateTimeFormat,
} from '../../../../universal/helpers/date';
import { entries } from '../../../../universal/helpers/utils';
import { Row, RowSet, WrappedRow } from '../../../components/Datalist/Datalist';
import { AddressDisplayAndModal } from '../../../components/LocationModal/LocationModal';

type DataListRowOptions = {
  endDateIncluded?: boolean;
};

type VergunningDataListRow<T extends VergunningFrontend = VergunningFrontend> =
  (
    vergunning: T,
    options?: DataListRowOptions
  ) => Row | RowSet | WrappedRow | Row[] | RowSet[] | WrappedRow[] | null;

export type RowTransformer<T extends VergunningFrontend = VergunningFrontend> =
  Record<string, VergunningDataListRow<T>>;

export const identifier: VergunningDataListRow = (vergunning) => {
  return {
    label: 'Kenmerk',
    content: vergunning.identifier,
  };
};

export const onFromTo: VergunningDataListRow<VergunningFrontend> = (
  vergunning
) => {
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

export const dateTimeRange: VergunningDataListRow<VergunningFrontend> = (
  vergunning
) => {
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

export const dateRange: VergunningDataListRow<VergunningFrontend> = (
  vergunning,
  options: DataListRowOptions = { endDateIncluded: true }
) => {
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

export const dateTimeRangeBetween: VergunningDataListRow<VergunningFrontend> = (
  vergunning
) => {
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

const location: VergunningDataListRow<VergunningFrontend> = (vergunning) =>
  'location' in vergunning && typeof vergunning.location === 'string'
    ? {
        label: 'Adres',
        content: <AddressDisplayAndModal address={vergunning.location} />,
      }
    : null;

const location2: VergunningDataListRow<VergunningFrontend> = (vergunning) =>
  'location' in vergunning && typeof vergunning.location !== 'string'
    ? {
        label: 'Adres',
        content: JSON.stringify(vergunning.location),
      }
    : null;

export const commonTransformers: RowTransformer<VergunningFrontend> = {
  identifier,
  location,
  location2,
  decision: (vergunning) =>
    vergunning.decision && vergunning.processed
      ? {
          label: 'Resultaat',
          content: vergunning.decision,
        }
      : null,
  kentekens: (vergunning) => {
    const hasMultipleKentekens = vergunning?.kentekens?.includes('|');
    return 'kentekens' in vergunning && typeof vergunning.kentekens === 'string'
      ? {
          label: `Kenteken${hasMultipleKentekens ? 's' : ''}`,
          content: hasMultipleKentekens ? (
            <ul className={styles.Kentekens}>
              {vergunning.kentekens.split('|').map((kenteken) => (
                <li key={kenteken}>{kenteken.trim()}</li>
              ))}
            </ul>
          ) : (
            vergunning.kentekens
          ),
        }
      : null;
  },
  dateStartedOn: (vergunning) => ({
    label: `Op`,
    content: vergunning.dateStartFormatted,
  }),
  dateStart: (vergunning) => ({
    label: `Van`,
    content: vergunning.dateStartFormatted,
  }),
  dateEnd: (vergunning, options = { endDateIncluded: true }) => ({
    label: options?.endDateIncluded ? `Tot en met` : 'Tot',
    content: vergunning.dateEndFormatted,
  }),
  dateRange,
  dateTimeRange,
  dateTimeRangeBetween,
  onFromTo,
  timeStart: (vergunning) =>
    'timeStart' in vergunning && typeof vergunning.timeStart === 'string'
      ? {
          label: `Van`,
          content: vergunning.timeStart,
        }
      : null,
  timeEnd: (vergunning) =>
    'timeEnd' in vergunning && typeof vergunning.timeEnd === 'string'
      ? {
          label: 'Tot',
          content: vergunning.timeEnd,
        }
      : null,
  timeRange: (vergunning) =>
    'timeStart' in vergunning &&
    'timeEnd' in vergunning &&
    typeof vergunning.timeStart === 'string' &&
    typeof vergunning.timeEnd === 'string'
      ? {
          label: 'Tussen',
          content: `${vergunning.timeStart} - ${vergunning.timeEnd} uur`,
        }
      : null,
  description: (vergunning) => {
    return {
      label: 'Omschrijving',
      content: vergunning.description,
    };
  },
};

// Eplicit type because we cannot? type the keys of a Record<string, xxx>
type TransformerKey =
  | 'description'
  | 'identifier'
  | 'location'
  | 'location2'
  | 'decision'
  | 'kentekens'
  | 'dateStartedOn'
  | 'dateStart'
  | 'dateRange'
  | 'dateEnd'
  | 'onFromTo'
  | 'dateTimeRangeBetween'
  | 'dateTimeRange'
  | 'timeStart'
  | 'timeEnd'
  | 'timeRange';

export function getRowsByKey<T extends VergunningFrontend>(
  vergunning: T,
  keysOrTransformers: (TransformerKey | RowTransformer<T>)[]
): Record<string, Row | RowSet | Row[] | RowSet[]> {
  const rows = keysOrTransformers
    .map((keyOrTransformer) => {
      if (typeof keyOrTransformer === 'string') {
        // Check if the key has a common transformer attached to it
        const commonTransformer = commonTransformers[keyOrTransformer];
        // If the key has a common transformer attached to it, return the key and the transformed value.
        return [keyOrTransformer, commonTransformer(vergunning)];
      }

      // KeyOrTransformer is a transformer object
      const [key, transformer] = entries(keyOrTransformer)[0];
      return [key, transformer(vergunning)];
    })
    .filter(([_, row]) => row !== null);

  return Object.fromEntries(rows);
}

export function getRows<T extends VergunningFrontend>(
  vergunning: T,
  keysOrTransformers: (TransformerKey | RowTransformer<T>)[]
): Array<Row | RowSet> {
  const rowsByKey = getRowsByKey(vergunning, keysOrTransformers);
  return Object.values(rowsByKey).flat();
}
