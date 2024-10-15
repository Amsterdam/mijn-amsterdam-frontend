import { subMonths } from 'date-fns';
import memoize from 'memoizee';
import { generatePath } from 'react-router-dom';
import { FeatureToggle } from '../../../universal/config/feature-toggles';
import { AppRoutes } from '../../../universal/config/routes';
import { Themas } from '../../../universal/config/thema';
import {
  apiDependencyError,
  apiSuccessResult,
  getFailedDependencies,
  getSettledResult,
} from '../../../universal/helpers/api';
import {
  dateFormat,
  dateSort,
  isDateInPast,
} from '../../../universal/helpers/date';
import { isRecentNotification } from '../../../universal/helpers/utils';
import {
  NOTIFICATION_REMINDER_FROM_MONTHS_NEAR_END,
  isNearEndDate,
} from '../../../universal/helpers/vergunningen';
import { MyNotification } from '../../../universal/types';
import { AuthProfileAndToken } from '../../auth/auth-types';
import { DEFAULT_API_CACHE_TTL_MS } from '../../config/source-api';
import {
  BBVergunning,
  LVVRegistratie,
  VakantieverhuurVergunning,
} from './toeristische-verhuur-types';
import { fetchRegistraties } from './tv-lvv-registratie';
import { fetchBBVergunningen } from './tv-powerbrowser-bb-vergunning';
import { fetchVakantieverhuurVergunningen } from './tv-vakantieverhuur-vergunning';

export function hasOtherActualVergunningOfSameType(
  items: Array<VakantieverhuurVergunning | BBVergunning>,
  item: VakantieverhuurVergunning | BBVergunning,
  dateNow: Date = new Date()
): boolean {
  return items.some(
    (otherVergunning: VakantieverhuurVergunning | BBVergunning) =>
      otherVergunning.title === item.title &&
      otherVergunning.zaaknummer !== item.zaaknummer &&
      !!otherVergunning.dateEnd &&
      !isDateInPast(otherVergunning.dateEnd, dateNow)
  );
}

async function fetchAndTransformToeristischeVerhuur(
  requestID: RequestID,
  authProfileAndToken: AuthProfileAndToken
) {
  if (!FeatureToggle.toeristischeVerhuurActive) {
    return apiSuccessResult({
      vakantieverhuurVergunningen: [],
      bbVergunningen: [],
      lvvRegistraties: [],
    });
  }
  const lvvRegistratiesRequest =
    authProfileAndToken.profile.profileType === 'commercial'
      ? Promise.resolve(apiSuccessResult([]))
      : fetchRegistraties(requestID, authProfileAndToken);

  const bbVergunningenRequest = fetchBBVergunningen(
    requestID,
    authProfileAndToken.profile
  );

  const vakantieverhuurVergunningenRequest = fetchVakantieverhuurVergunningen(
    requestID,
    authProfileAndToken
  );

  const [
    lvvRegistratiesResponse,
    vakantieverhuurVergunningenResponse,
    bbVergunningenResponse,
  ] = await Promise.allSettled([
    lvvRegistratiesRequest,
    vakantieverhuurVergunningenRequest,
    bbVergunningenRequest,
  ]);

  const lvvRegistraties = getSettledResult(lvvRegistratiesResponse);

  const vakantieverhuurVergunningen = getSettledResult(
    vakantieverhuurVergunningenResponse
  );

  const bbVergunningen = getSettledResult(bbVergunningenResponse);

  const failedDependencies = getFailedDependencies({
    lvvRegistraties,
    vakantieverhuurVergunningen,
    bbVergunningen,
  });

  return apiSuccessResult(
    {
      lvvRegistraties: lvvRegistraties.content ?? [],
      vakantieverhuurVergunningen: (
        vakantieverhuurVergunningen.content ?? []
      ).sort(dateSort('dateReceived', 'desc')),
      bbVergunningen: (bbVergunningen.content ?? []).sort(
        dateSort('dateReceived', 'desc')
      ),
    },
    failedDependencies
  );
}

export const fetchToeristischeVerhuur = memoize(
  fetchAndTransformToeristischeVerhuur,
  {
    maxAge: DEFAULT_API_CACHE_TTL_MS,
    normalizer: function (args) {
      return args[0] + JSON.stringify(args[1]);
    },
  }
);

export function createToeristischeVerhuurNotification(
  item: BBVergunning | VakantieverhuurVergunning,
  items: Array<BBVergunning | VakantieverhuurVergunning>,
  dateNow: Date = new Date()
): MyNotification {
  const vergunningTitleLower = item.title.toLowerCase();

  let title = `Aanvraag ${vergunningTitleLower} in behandeling`;
  let description = `Wij hebben uw aanvraag voor een ${vergunningTitleLower} met gemeentelijk zaaknummer ${item.zaaknummer} in behandeling.`;
  let datePublished = item.dateReceived ?? '';
  let cta = 'Bekijk uw aanvraag';
  let linkTo: string = AppRoutes.TOERISTISCHE_VERHUUR;

  if (
    item.title === 'Vergunning bed & breakfast' ||
    item.title === 'Vergunning vakantieverhuur'
  ) {
    const ctaLinkToDetail = generatePath(
      AppRoutes['TOERISTISCHE_VERHUUR/VERGUNNING'],
      {
        id: item.id,
        casetype:
          item.title === 'Vergunning vakantieverhuur'
            ? 'vakantieverhuur'
            : 'bed-and-breakfast',
      }
    );
    const ctaLinkToAanvragen =
      item.title === 'Vergunning bed & breakfast'
        ? 'https://www.amsterdam.nl/wonen-leefomgeving/wonen/bedandbreakfast/vergunning/'
        : 'https://www.amsterdam.nl/wonen-leefomgeving/wonen/vakantieverhuur/vergunning/';

    linkTo = ctaLinkToDetail;

    switch (true) {
      // B&B + Vakantieverhuurvergunning
      case item.result === 'Verleend' &&
        isNearEndDate(item.dateEnd) &&
        !hasOtherActualVergunningOfSameType(items, item):
        title = `Uw ${vergunningTitleLower} loopt af`;
        description = `Uw ${vergunningTitleLower} met gemeentelijk zaaknummer ${item.zaaknummer} loopt binnenkort af. Vraag op tijd een nieuwe vergunning aan.`;
        cta = `Vergunning aanvragen`;
        linkTo = ctaLinkToAanvragen;
        datePublished = item.dateDecision
          ? dateFormat(
              subMonths(
                new Date(item.dateDecision),
                NOTIFICATION_REMINDER_FROM_MONTHS_NEAR_END
              ),
              'yyyy-MM-dd'
            )
          : datePublished;
        break;
      // B&B + Vakantieverhuurvergunning
      case item.result === 'Verleend' &&
        !!item.dateEnd &&
        isDateInPast(item.dateEnd, dateNow) &&
        !hasOtherActualVergunningOfSameType(items, item):
        title = `Uw ${vergunningTitleLower} is verlopen`;
        description = `Uw ${vergunningTitleLower} met gemeentelijk zaaknummer ${item.zaaknummer} is verlopen. U kunt een nieuwe vergunning aanvragen.`;
        cta = 'Vergunning aanvragen';
        linkTo = ctaLinkToAanvragen;
        datePublished = item.dateEnd;
        break;
      // B&B only
      case item.status === 'Ontvangen':
        title = `Aanvraag ${vergunningTitleLower} ontvangen`;
        description = `Wij hebben uw aanvraag voor een ${vergunningTitleLower} met gemeentelijk zaaknummer ${item.zaaknummer} ontvangen.`;
        cta = 'Bekijk uw aanvraag';
        linkTo = ctaLinkToDetail;
        datePublished = item.dateReceived ?? '';
        break;
      // B&B + Vakantieverhuurvergunning
      case !!item.result:
        const result = item.result?.toLowerCase() || 'afgehandeld';
        title = `Aanvraag ${vergunningTitleLower} ${result}`;
        description = `Wij hebben uw aanvraag voor een ${vergunningTitleLower} met gemeentelijk zaaknummer ${item.zaaknummer} ${result}.`;
        cta = 'Bekijk uw aanvraag';
        linkTo = ctaLinkToDetail;
        datePublished = (item.dateDecision || item.dateReceived) ?? '';
        break;
    }
  }

  return {
    id: `vergunning-${item.id}-notification`,
    datePublished,
    thema: Themas.TOERISTISCHE_VERHUUR,
    title,
    description: description,
    link: {
      to: linkTo,
      title: cta,
    },
  };
}

function createRegistratieNotification(item: LVVRegistratie): MyNotification {
  const title = 'Aanvraag landelijk registratienummer toeristische verhuur';
  const description = `Uw landelijke registratienummer voor toeristische verhuur is toegekend. Uw registratienummer is ${item.registrationNumber}.`;
  const datePublished = !!item.agreementDate ? item.agreementDate : '';
  const cta = 'Bekijk uw overzicht toeristische verhuur';
  const linkTo = AppRoutes.TOERISTISCHE_VERHUUR;

  return {
    id: `toeristiche-verhuur-registratie-${item.registrationNumber}-notification`,
    datePublished,
    thema: Themas.TOERISTISCHE_VERHUUR,
    title,
    description,
    link: {
      to: linkTo,
      title: cta,
    },
  };
}

export async function fetchToeristischeVerhuurNotifications(
  requestID: RequestID,
  authProfileAndToken: AuthProfileAndToken,
  compareDate?: Date
) {
  const TOERISTISCHE_VERHUUR = await fetchToeristischeVerhuur(
    requestID,
    authProfileAndToken
  );

  if (TOERISTISCHE_VERHUUR.status === 'OK') {
    const compareToDate = compareDate || new Date();

    const vakantieverhuurVergunningen =
      TOERISTISCHE_VERHUUR.content.vakantieverhuurVergunningen ?? [];
    const vakantieverhuurVergunningNotifications =
      vakantieverhuurVergunningen.map((vergunning) =>
        createToeristischeVerhuurNotification(
          vergunning,
          vakantieverhuurVergunningen
        )
      );
    const bbVergunningen = TOERISTISCHE_VERHUUR.content.bbVergunningen ?? [];
    const vergunningNotifications = bbVergunningen.map((vergunning) =>
      createToeristischeVerhuurNotification(vergunning, bbVergunningen)
    );

    const registrationsNotifications =
      TOERISTISCHE_VERHUUR.content.lvvRegistraties?.map(
        createRegistratieNotification
      ) ?? [];

    const notifications = [
      ...vakantieverhuurVergunningNotifications,
      ...vergunningNotifications,
      ...registrationsNotifications,
    ];

    const actualNotifications = notifications.filter(
      (notification) =>
        !!notification.datePublished &&
        isRecentNotification(notification.datePublished, compareToDate)
    );

    return apiSuccessResult({
      notifications: actualNotifications,
    });
  }

  return apiDependencyError({ TOERISTISCHE_VERHUUR });
}
