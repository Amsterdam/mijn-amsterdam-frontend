import { ApiResponse, deepOmitKeys } from '../../../universal/helpers';
import { MyTip } from '../../../universal/types';
import { ServiceResults } from './tip-types';

export function collectSourceTips(
  serviceResults: ServiceResults | null
): MyTip[] {
  if (!serviceResults) {
    return [];
  }

  const tips = [];
  const userData = {};
  const data = extractSuccessResponseContent(serviceResults);
  // Omit all description keys, these are not needed for the Tips service.
  Object.assign(userData, deepOmitKeys(data, ['description']));
  const tipsFromSource = Object.values(data).flatMap((data) =>
    data && 'tips' in data ? data['tips'] : []
  );
  if (tipsFromSource.length) {
    tips.push(...tipsFromSource);
  }

  return tips;
}

function extractSuccessResponseContent(
  serviceResult: Record<string, ApiResponse<any>>
) {
  const responseContent: Record<string, any> = {};

  for (const [apiStateKey, response] of Object.entries(serviceResult)) {
    if (response.status === 'OK') {
      responseContent[apiStateKey] = response.content;
    }
  }

  return responseContent;
}
