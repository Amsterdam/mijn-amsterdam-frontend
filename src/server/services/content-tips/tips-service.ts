import { ServiceResults, ContentTipSource } from './tip-types';
import { contentTips } from './tips-content';
import { MIJN_AMSTERDAM } from '../../../universal/config/app';
import { MyNotification } from '../../../universal/types/App.types';

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
      return t.predicates.every((p) => p(serviceResults, now));
    }

    return true;
  };
}

export function fetchContentTips(
  serviceResults: ServiceResults,
  compareDate: Date,
  profileType?: ProfileType
): MyNotification[] {
  /**
   * Iterate over tips database and filter out requested tips based on props:
   * - date period
   * - profileTypes
   * - predicates
   *   ...
   */

  let filteredTips = contentTips;

  // If a profileType is provided, use it to filter the tips.
  if (profileType) {
    filteredTips = filteredTips.filter((t) =>
      t.profileTypes.includes(profileType)
    );
  }

  filteredTips = filteredTips.filter(tipsFilter(serviceResults, compareDate));

  return filteredTips.map((t) => {
    const tip: MyNotification = {
      id: t.id,
      datePublished: t.datePublished,
      title: t.title,
      description: t.description,
      link: t.link,
      themaID: t.themaID,
      themaTitle: t.themaTitle ?? MIJN_AMSTERDAM,
      tipReason: t.reason,
      isTip: true,
    };
    return tip;
  });
}
