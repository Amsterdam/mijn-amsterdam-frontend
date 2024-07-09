import {
  VergunningBase,
  VergunningFrontendV2,
} from '../../../../server/services/vergunningen-v2/config-and-types';
import {
  DatalistProps,
  Row,
  RowSet,
} from '../../../components/Datalist/Datalist';
import { LocationModal } from '../../../components/LocationModal/LocationModal';

type DataListRowOptions = {
  endDateIncluded?: boolean;
};

type VergunningDataListRow<
  T extends VergunningFrontendV2 = VergunningFrontendV2,
> = (vergunning: T, options?: DataListRowOptions) => Row | RowSet | null;

export const commonRows: Record<string, VergunningDataListRow> = {
  identifier: (vergunning: VergunningBase) => ({
    label: 'Kenmerk',
    content: vergunning.identifier,
  }),
  location: (vergunning) =>
    'location' in vergunning && typeof vergunning.location === 'string'
      ? {
          label: 'Adres',
          content: (
            <LocationModal location={vergunning.location as string}>
              {vergunning.location}
            </LocationModal>
          ),
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
    !!vergunning.decision
      ? {
          label: 'Resultaat',
          content: vergunning.decision,
        }
      : null,
  kentekens: (vergunning) =>
    'kentekens' in vergunning && vergunning.kentekens
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
    'timeStart' in vergunning && vergunning.timeStart
      ? {
          label: `Van`,
          content: vergunning.timeStart,
        }
      : null,
  timeEnd: (vergunning) =>
    'timeEnd' in vergunning && vergunning.timeEnd
      ? {
          label: 'Tot',
          content: vergunning.timeEnd,
        }
      : null,
  timeRange: (vergunning) =>
    'timeStart' in vergunning && vergunning.timeStart
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
  const rows = Object.entries(commonRows)
    .filter(([key, row]) => keys.includes(key))
    .map(([key, getRow]) => {
      return [key, getRow(vergunning as T)];
    })
    .filter(([key, row]) => row !== null);
  return Object.fromEntries(rows);
}

export function getRows<T extends VergunningFrontendV2>(
  vergunning: T,
  keys: string[]
): Array<Row | RowSet> {
  return Object.values(getRowsByKey(vergunning, keys));
}
