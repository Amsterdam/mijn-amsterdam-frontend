import type { GridColumnNumber } from '@amsterdam/design-system-react';

import { LabelMap } from './Varen-thema-config';
import { VarenFrontend } from '../../../server/services/varen/config-and-types';
import { entries } from '../../../universal/helpers/utils';
import type { RowSet } from '../../components/Datalist/Datalist';

const thirdOfGrid: GridColumnNumber = 4;
export function transformDetailsIntoRowSet<T extends VarenFrontend>(
  vergunning: T,
  labelMap: LabelMap<T>,
  gridColumnNumber: GridColumnNumber = thirdOfGrid
): RowSet {
  return {
    rows: entries(labelMap)
      .map(([key, label]) => ({
        label,
        content: `${vergunning[key]}`,
        span: gridColumnNumber,
      }))
      .filter(({ content }) => !!content),
  };
}
