import { VergunningFrontendV2 } from '../../../../server/services/vergunningen/config-and-types';
import { entries } from '../../../../universal/helpers/utils';
import { Row, RowSet } from '../../../components/Datalist/Datalist';
import { AddressDisplayAndModal } from '../../../components/LocationModal/LocationModal';

type DataListRowOptions = {
  endDateIncluded?: boolean;
};

type VergunningDataListRow<
  T extends VergunningFrontendV2 = VergunningFrontendV2,
> = (vergunning: T, options?: DataListRowOptions) => Row | RowSet | null;

export const commonRows: Record<string, VergunningDataListRow> = {
  identifier: (vergunning) => ({
    label: 'Kenmerk',
    content: vergunning.identifier,
  }),
  location: (vergunning) =>
    'location' in vergunning && typeof vergunning.location === 'string'
      ? {
          label: 'Adres',
          content: <AddressDisplayAndModal address={vergunning.location} />,
        }
      : null,
  location2: (vergunning) =>
    'location' in vergunning && typeof vergunning.location !== 'string'
      ? {
          label: 'Adres',
          content: JSON.stringify(vergunning.location),
        }
      : null,
  decision: (vergunning) =>
    vergunning.decision
      ? {
          label: 'Resultaat',
          content: vergunning.decision,
        }
      : null,
  kentekens: (vergunning) =>
    'kentekens' in vergunning && typeof vergunning.kentekens === 'string'
      ? {
          label: `Kenteken${vergunning?.kentekens?.includes('|') ? 's' : ''}`,
          content: vergunning.kentekens,
        }
      : null,
  theDate: (vergunning) => ({
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
};

export function getRowsByKey<T extends VergunningFrontendV2>(
  vergunning: T,
  keys: string[]
): Record<string, Row | RowSet> {
  const rows = entries(commonRows)
    .filter(([key]) => keys.includes(key))
    .map(([key, getRow]) => {
      return [key, getRow(vergunning as T)];
    })
    .filter(([_, row]) => row !== null);
  return Object.fromEntries(rows);
}

export function getRows<T extends VergunningFrontendV2>(
  vergunning: T,
  keys: string[]
): Array<Row | RowSet> {
  return Object.values(getRowsByKey(vergunning, keys));
}
