import { IS_TEST } from '../../../universal/config';
import { MyTip } from '../../../universal/types';
import { ServiceResults, Tip } from './tip-types';
import { tips } from './tips-content';

function tipsFilter(serviceResults: ServiceResults, now: Date = new Date()) {
  return (t: Tip) => {
    // We want only active tips.
    if (!t.active) {
      return false;
    }

    console.log(now);

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

export function collectTips(
  serviceResults: ServiceResults,
  profileType?: ProfileType,
  compareDate?: Date
): MyTip[] {
  /**
   * Iterate over tips database and filter out requested tips based on props:
   * - date period
   * - profileTypes
   * - predicates
   *   ...
   */

  let filteredTips = tips;

  // If we get a profileType first filter all tips using it.
  if (profileType) {
    filteredTips = filteredTips.filter((t) =>
      t.profileTypes.includes(profileType)
    );
  }

  if (IS_TEST) {
    compareDate;
  }

  filteredTips = filteredTips.filter(tipsFilter(serviceResults, compareDate));

  return filteredTips.map((t) => ({
    id: t.id,
    datePublished: t.datePublished,
    title: t.title,
    description: t.description,
    link: t.link,
    profileTypes: t.profileTypes,
    chapter: t.chapter ?? null,
    priority: t.priority,
    reason: t.reason,
  })) as MyTip[];
}
