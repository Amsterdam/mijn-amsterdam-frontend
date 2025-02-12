import type { GridColumnNumbers } from '@amsterdam/design-system-react';

import { LabelMap } from './Varen-thema-config';
import styles from './Varen.module.scss';
import { VarenFrontend } from '../../../server/services/varen/config-and-types';
import { entries } from '../../../universal/helpers/utils';
import type { RowSet } from '../../components/Datalist/Datalist';

const defaultGridColumnSpans: GridColumnNumbers = {
  narrow: 4,
  medium: 4,
  wide: 4,
};
export function transformDetailsIntoRowSet<T extends VarenFrontend>(
  vergunning: T,
  labelMap: LabelMap<T>,
  gridColumnNumber: GridColumnNumbers = defaultGridColumnSpans
): RowSet {
  return {
    rows: entries(labelMap)
      .map(([key, label]) => ({
        label,
        content: `${vergunning[key]}`,
        span: gridColumnNumber,
      }))
      .filter(({ content }) => !!content),
    className: styles.VarenGridWithoutRowGap,
  };
}
