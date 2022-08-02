import { AppState } from '../../../client/AppState';
import { ApiResponse, apiSuccessResult } from '../../../universal/helpers';
import { MyTip } from '../../../universal/types';
import { collectSourceTips } from './collect-source-tips';
import { collectTips } from './collect-tips';
import { ServiceResults, TipAudience } from './tip-types';

function prioritySort(a: MyTip, b: MyTip) {
  const prioA = a.priority ?? 0;
  const prioB = b.priority ?? 0;

  if (prioA < prioB) {
    return -1;
  }

  if (prioA > prioB) {
    return 1;
  }

  return 0;
}

function getTipsAudience(queryParams: Record<string, string>): TipAudience {
  let audience = 'persoonlijk';

  switch (queryParams.profileType) {
    case 'private-commercial':
    case 'commercial':
      audience = 'zakelijk';
      break;
  }

  return audience as TipAudience;
}

function getTipsOptin(queryParams: Record<string, string>): boolean {
  return queryParams.optin === 'true';
}

function getTipsQueryParams(queryParams: Record<string, string>) {
  const optIn = getTipsOptin(queryParams);
  const audience = getTipsAudience(queryParams);

  return {
    optIn,
    audience,
  };
}

function getTips(
  appState: ServiceResults | null,
  optIn: boolean,
  audience: TipAudience
) {
  const tips1 = collectTips(appState as Partial<AppState>, optIn, audience);
  const tips2 = collectSourceTips(appState);
  const tips = tips1.concat(tips2);

  tips.sort(prioritySort);

  return tips;
}

export async function fetchTIPS(
  queryParams: Record<string, string>,
  serviceResults: ServiceResults | null
) {
  const parsedParams = getTipsQueryParams(queryParams);

  const tips = getTips(
    serviceResults as AppState,
    parsedParams.optIn,
    parsedParams.audience
  );

  return new Promise<ApiResponse<MyTip[]>>((resolve) => {
    return resolve(apiSuccessResult(tips));
  });
}

export function createTipsRequestData(
  queryParams: Record<string, string>,
  serviceResults: ServiceResults | null
) {
  const parsedParams = getTipsQueryParams(queryParams);
  const serviceTips = collectSourceTips(serviceResults);

  return {
    ...parsedParams,
    tips: serviceTips,
  };
}
