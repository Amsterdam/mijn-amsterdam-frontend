import { MyTip } from '../../../universal/types';
import { ServiceResults, Tip } from './tip-types';
import { tips } from './tips';

function tipsFilter(serviceResults: ServiceResults, optIn: boolean) {
  const now = new Date();

  return (t: Tip) => {
    // We want only active tips.
    if (!t.active) {
      return false;
    }

    // If user doesn't want personalized tips filter those.
    if (optIn !== t.isPersonalized) {
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

export function collectTips(
  serviceResults: ServiceResults,
  optIn: boolean,
  isNotification?: boolean,
  profileType?: ProfileType
): MyTip[] {
  /**
   * Iterate over tips database and filter out requested tips based on props:
   * - date period
   * - profileTypes
   * - personalized
   * - predicates
   *   ...
   */

  let filteredTips = tips;

  filteredTips = tips.filter((tip) =>
    typeof isNotification === 'boolean'
      ? tip.isNotification === isNotification
      : false
  );

  // If we get a profileType first filter all tips using it.
  if (profileType) {
    filteredTips = filteredTips.filter((t) =>
      t.profileTypes.includes(profileType)
    );
  }

  filteredTips = filteredTips.filter(tipsFilter(serviceResults, optIn));

  return filteredTips.map((t) => ({
    id: t.id,
    datePublished: t.datePublished,
    title: t.title,
    description: t.description,
    link: t.link,
    imgUrl: t.imgUrl,
    isPersonalized: t.isPersonalized,
    isNotification: t.isNotification ?? false,
    chapter: t.chapter ?? null,
    priority: t.priority,
    reason: t.reason ? [t.reason] : [],
  })) as MyTip[];
}
