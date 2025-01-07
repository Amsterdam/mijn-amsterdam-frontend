import { useMemo } from 'react';

import { Vergunning } from '../../../server/services';
import { defaultDateFormat } from '../../../universal/helpers/date';
import { getCustomTitleForVergunningWithLicensePlates } from '../../../universal/helpers/vergunningen';
import { AppState } from '../../../universal/types';
import { CaseType } from '../../../universal/types/vergunningen';
import { addTitleLinkComponent } from '../../components/Table/Table';

const titleTransformMap: Record<string, unknown> = {
  [CaseType.TouringcarJaarontheffing]:
    getCustomTitleForVergunningWithLicensePlates,
  [CaseType.TouringcarDagontheffing]:
    getCustomTitleForVergunningWithLicensePlates,
  [CaseType.EigenParkeerplaats]: getCustomTitleForVergunningWithLicensePlates,
  [CaseType.EigenParkeerplaatsOpheffen]:
    getCustomTitleForVergunningWithLicensePlates,
};

export function useVergunningenTransformed(
  VERGUNNINGEN: AppState['VERGUNNINGEN']
) {
  const vergunningen: Vergunning[] = useMemo(() => {
    if (!VERGUNNINGEN.content?.length) {
      return [];
    }
    const items: Vergunning[] = VERGUNNINGEN.content.map((item) => {
      const transformer = titleTransformMap[item.caseType];
      return {
        ...item,
        title:
          typeof transformer === 'function' ? transformer(item) : item.title,
        dateRequest: defaultDateFormat(item.dateRequest),
      };
    });
    return items;
  }, [VERGUNNINGEN.content]);

  return vergunningen;
}
