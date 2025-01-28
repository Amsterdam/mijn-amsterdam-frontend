import { VergunningFrontend } from '../../../../server/services/vergunningen/config-and-types';
import { entries } from '../../../../universal/helpers/utils';
import { Row, RowSet } from '../../../components/Datalist/Datalist';
import { AddressDisplayAndModal } from '../../../components/LocationModal/LocationModal';

type DataListRowOptions = {
  endDateIncluded?: boolean;
};

type VergunningDataListRow<T extends VergunningFrontend> = (
  vergunning: T,
  options?: DataListRowOptions
) => Row | RowSet | null;

type RowTransformer<T extends VergunningFrontend> = Record<
  string,
  VergunningDataListRow<T>
>;

export const commonTransformers: RowTransformer<VergunningFrontend> = {
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

export function getRowsByKey<T extends VergunningFrontend>(
  vergunning: T,
  keysOrTransformers: (string | RowTransformer<T>)[]
): Record<string, Row | RowSet> {
  const rows = keysOrTransformers
    .map((keyOrTransformer) => {
      if (typeof keyOrTransformer === 'string') {
        // Check if the key has a common transformer attached to it
        const commonTransformer = commonTransformers[keyOrTransformer];
        // Cast the key to a keyof T to check if it exists in the vergunning object.
        const key = keyOrTransformer as keyof T;
        // In advance construct a default row object with the key and the value from the vergunning object.
        const defaultRow =
          key in vergunning
            ? {
                label: key,
                content: vergunning[key],
              }
            : null;
        // If the key has a common transformer attached to it, return the key and the transformed value.
        return [
          keyOrTransformer,
          typeof commonTransformer === 'function'
            ? commonTransformer(vergunning)
            : defaultRow,
        ];
      }

      // KeyOrTransformer is a transformer object
      const [key, transformer] = entries(
        keyOrTransformer as RowTransformer<T>
      )[0] as [keyof T, VergunningDataListRow<T>];

      return [key, transformer(vergunning)];
    })
    .filter(([_, row]) => row !== null);

  return Object.fromEntries(rows);
}

export function getRows<T extends VergunningFrontend>(
  vergunning: T,
  keysOrTransformers: (string | RowTransformer<T>)[]
): Array<Row | RowSet> {
  const rowsByKey = getRowsByKey(vergunning, keysOrTransformers);
  return Object.values(rowsByKey);
}
