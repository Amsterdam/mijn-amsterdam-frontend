import { apiSuccessResult, pick } from '../../../universal/helpers';
import { MyNotification, MyTip } from '../../../universal/types';
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

export function convertTipToNotication(tip: MyTip): MyNotification {
  return {
    ...pick(tip, [
      'thema',
      'datePublished',
      'description',
      'id',
      'title',
      'link',
    ]),
    tipReason: tip.reason,
    isTip: true,
    isAlert: false,
  } as MyNotification;
}

export function prefixTipNotification(
  notification: MyNotification
): MyNotification {
  const pattern = /^(\s*tip\s*:?\s*)/i;
  const matches = notification.title.match(pattern);
  return {
    ...notification,
    title:
      matches && matches?.length > 0
        ? notification.title.replace(pattern, 'Tip: ')
        : 'Tip: ' + notification.title,
  };
}

export async function createTipsFromServiceResults(
  profileType: ProfileType,
  {
    serviceResults,
    tipsDirectlyFromServices,
    compareDate,
  }: {
    serviceResults: ServiceResults | null;
    tipsDirectlyFromServices: MyTip[];
    compareDate?: Date;
  }
) {
  let tips = serviceResults
    ? collectTips(serviceResults, profileType, compareDate)
    : [];
  tips = tips.concat(tipsDirectlyFromServices);
  tips.sort(prioritySort);

  return apiSuccessResult(tips);
}
