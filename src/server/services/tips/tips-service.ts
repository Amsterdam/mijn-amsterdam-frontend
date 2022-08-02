import { AppState } from '../../../client/AppState';
import { MyTip } from '../../../universal/types';
import { tips } from './tips';

function collectTips(
  appState: Partial<AppState>,
  optIn: boolean,
  audience: string
): MyTip[] {
  /**
   * Iterate over tips database and filter out requested tips based on props:
   * - date period
   * - audience
   * - personalized
   * - predicates
   *   ...
   */

  const now = new Date();

  let filteredTips = tips;
  // If we get an audience first filter all tips using it.
  if (audience) {
    filteredTips = tips.filter((t) => t.audience.includes(audience));
  }

  filteredTips = filteredTips.filter((t) => {
    // We want only active tips.
    if (!t.active) {
      return false;
    }

    // If user doesn't want personalized tips filter those.
    if (!optIn && t.isPersonalized) {
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
        .map((p) => p(appState, now))
        .some((r) => r === false);
    }

    return true;
  });

  return filteredTips.map((t) => ({
    id: t.id,
    datePublished: t.datePublished,
    title: t.title,
    description: t.description,
    link: t.link,
    imgUrl: t.imgUrl,
    isPersonalized: t.isPersonalized,
    priority: t.priority,
    reason: [t.reason],
    audience: t.audience,
  })) as MyTip[];
}

function collectSourceTips(sourceTips: MyTip[] | undefined): MyTip[] {
  return [];
}

// TODO: is this sorting in the right order?
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

export function getTips(
  appState: Partial<AppState>,
  sourceTips: MyTip[] | undefined,
  optIn: boolean,
  audience: string
) {
  const tips1 = collectTips(appState, optIn, audience);
  const tips2 = collectSourceTips(sourceTips);
  const tips = tips1.concat(tips2);

  tips.sort(prioritySort);

  return tips;
}
