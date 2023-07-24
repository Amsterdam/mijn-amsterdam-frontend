import { apiSuccessResult } from '../../../universal/helpers';
import { MyTip } from '../../../universal/types';
import { collectTips } from './collect-tips';
import { ServiceResults, TipAudience } from './tip-types';

function prioritySort(a: MyTip, b: MyTip) {
  const prioA = a.priority ?? 0;
  const prioB = b.priority ?? 0;

  if (prioA < prioB) {
    return 1;
  }

  if (prioA > prioB) {
    return -1;
  }

  return 0;
}

function getTipsAudience(queryParams: Record<string, string>): TipAudience {
  let audience = 'persoonlijk';

  switch (queryParams.profileType) {
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

export async function createTipsFromServiceResults(
  queryParams: Record<string, string>,
  {
    serviceResults,
    tipsDirectlyFromServices,
  }: {
    serviceResults: ServiceResults | null;
    tipsDirectlyFromServices: MyTip[];
  }
) {
  const { optIn, audience } = getTipsQueryParams(queryParams);

  let tips = serviceResults ? collectTips(serviceResults, optIn, audience) : [];

  if (optIn) {
    tips = tips.concat(tipsDirectlyFromServices);
  }

  tips.sort(prioritySort);

  return apiSuccessResult(tips);
}
