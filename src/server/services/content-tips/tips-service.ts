import { TipFrontend, ServiceResults, ContentTipSource } from './tip-types';
import { tips } from './tips-content';
import { apiSuccessResult } from '../../../universal/helpers/api';
import { pick } from '../../../universal/helpers/utils';
import { MyNotification } from '../../../universal/types';

export function convertTipToNotication(tip: TipFrontend): MyNotification {
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

function tipsFilter(serviceResults: ServiceResults, now: Date = new Date()) {
  return (t: ContentTipSource) => {
    // We want only active tips.
    if (!t.active) {
      return false;
    }

    // If there is a dateStart exclude the tip if the start date is in the future.
    // If there is a dateEnd exclude the tip if the date end is in the past.
    if (
      (t.dateActiveStart && new Date(t.dateActiveStart) > now) ||
      (t.dateActiveEnd && new Date(t.dateActiveEnd) < now)
    ) {
      return false;
    }

    // Run all predicates, check if any of them is false.
    if (t.predicates) {
      return !t.predicates
        .map((p) => p(serviceResults, now))
        .some((r) => r === false);
    }

    return true;
  };
}

export function getFilteredTips(
  serviceResults: ServiceResults,
  profileType?: ProfileType,
  compareDate?: Date
): TipFrontend[] {
  /**
   * Iterate over tips database and filter out requested tips based on props:
   * - date period
   * - profileTypes
   * - predicates
   *   ...
   */

  let filteredTips = tips;

  // If a profileType is provided, use it to filter the tips.
  if (profileType) {
    filteredTips = filteredTips.filter((t) =>
      t.profileTypes.includes(profileType)
    );
  }

  filteredTips = filteredTips.filter(tipsFilter(serviceResults, compareDate));

  return filteredTips.map((t) => {
    const tip: TipFrontend = {
      id: t.id,
      datePublished: t.datePublished,
      title: t.title,
      description: t.description,
      link: t.link,
      thema: t.thema,
      reason: t.reason,
    };
    return tip;
  });
}

export async function fetchContentTips(
  profileType: ProfileType,
  {
    serviceResults,
    compareDate,
  }: {
    serviceResults: ServiceResults | null;
    compareDate?: Date;
  }
) {
  const tips = serviceResults
    ? getFilteredTips(serviceResults, profileType, compareDate)
    : [];

  return apiSuccessResult(tips);
}
