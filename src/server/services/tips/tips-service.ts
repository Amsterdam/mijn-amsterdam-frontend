import { apiSuccessResult } from '../../../universal/helpers';
import { MyTip } from '../../../universal/types';
import { collectTips } from './collect-tips';
import { ServiceResults } from './tip-types';

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

function getTipsProfileType(queryParams: Record<string, string>): ProfileType {
  let profileType = 'private';

  switch (queryParams.profileType) {
    case 'commercial':
      profileType = 'commercial';
      break;
  }

  return profileType as ProfileType;
}

function getTipsOptin(queryParams: Record<string, string>): boolean {
  return queryParams.optin === 'true';
}

function getTipsQueryParams(queryParams: Record<string, string>) {
  const optIn = getTipsOptin(queryParams);
  const profileType = getTipsProfileType(queryParams);

  return {
    optIn,
    profileType,
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
  },
  isNotification: boolean = false
) {
  const { optIn, profileType } = getTipsQueryParams(queryParams);

  let tips = serviceResults
    ? collectTips(
        serviceResults,
        optIn,
        isNotification ? true : undefined,
        profileType
      )
    : [];

  if (optIn) {
    tips = tips.concat(tipsDirectlyFromServices);
  }

  tips.sort(prioritySort);

  return apiSuccessResult(tips);
}
