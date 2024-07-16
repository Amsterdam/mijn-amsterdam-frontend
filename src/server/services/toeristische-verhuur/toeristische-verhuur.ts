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
import { DEFAULT_API_CACHE_TTL_MS } from '../../config';
import { AuthProfileAndToken } from '../../helpers/app';
import { BBVergunning, fetchBBVergunning } from './bb-vergunning';
import {
  ToeristischeVerhuurRegistratieDetail,
  fetchRegistraties,
} from './lvv-registratie';
import {
  VakantieverhuurVergunning,
  fetchVakantieverhuurVergunningen,
} from './vakantieverhuur-vergunning';

export function hasOtherActualVergunningOfSameType(
  items: Array<VakantieverhuurVergunning | BBVergunning>,
  item: VakantieverhuurVergunning | BBVergunning,
  dateNow: Date = new Date()
): boolean {
  return items.some(
    (otherVergunning: VakantieverhuurVergunning | BBVergunning) =>
      otherVergunning.titel === item.titel &&
      otherVergunning.zaaknummer !== item.zaaknummer &&
      !isDateInPast(otherVergunning.datumTot, dateNow)
  );
}

async function fetchAndTransformToeristischeVerhuur(
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken,
  profileType: ProfileType = 'private'
) {
  if (!FeatureToggle.toeristischeVerhuurActive) {
    return apiSuccessResult({
      vakantieverhuurVergunningen: [],
      bbVergunningen: [],
      lvvRegistraties: [],
    });
  }
  const lvvRegistratiesRequest =
    profileType === 'commercial'
      ? Promise.resolve(apiSuccessResult([]))
      : fetchRegistraties(requestID, authProfileAndToken);

  const bbVergunningenRequest = fetchBBVergunning(
    requestID,
    authProfileAndToken
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
      ).sort(dateSort('datumAanvraag', 'desc')),
      bbVergunningen: (bbVergunningen.content ?? []).sort(
        dateSort('datumAanvraag', 'desc')
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
  const vergunningTitleLower = item.titel.toLowerCase();

  let title = `Aanvraag ${vergunningTitleLower} in behandeling`;
  let description = `Wij hebben uw aanvraag voor een ${vergunningTitleLower} met gemeentelijk zaaknummer ${item.zaaknummer} in behandeling.`;
  let datePublished = item.datumAanvraag;
  let cta = 'Bekijk uw aanvraag';
  let linkTo: string = AppRoutes.TOERISTISCHE_VERHUUR;

  if (
    item.titel === 'Vergunning bed & breakfast' ||
    item.titel === 'Vergunning vakantieverhuur'
  ) {
    const ctaLinkToDetail = generatePath(
      AppRoutes['TOERISTISCHE_VERHUUR/VERGUNNING'],
      {
        id: item.id,
      }
    );
    const ctaLinkToAanvragen =
      item.titel === 'Vergunning bed & breakfast'
        ? 'https://www.amsterdam.nl/wonen-leefomgeving/wonen/bedandbreakfast/vergunning/'
        : 'https://www.amsterdam.nl/wonen-leefomgeving/wonen/vakantieverhuur/vergunning/';

    linkTo = ctaLinkToDetail;

    switch (true) {
      // B&B + Vakantieverhuurvergunning
      case item.resultaat === 'Verleend' &&
        isNearEndDate(item.datumTot) &&
        !hasOtherActualVergunningOfSameType(items, item):
        title = `Uw ${vergunningTitleLower} loopt af`;
        description = `Uw ${vergunningTitleLower} met gemeentelijk zaaknummer ${item.zaaknummer} loopt binnenkort af. Vraag op tijd een nieuwe vergunning aan.`;
        cta = `Vergunning aanvragen`;
        linkTo = ctaLinkToAanvragen;
        datePublished = item.datumAfhandeling
          ? dateFormat(
              subMonths(
                new Date(item.datumAfhandeling),
                NOTIFICATION_REMINDER_FROM_MONTHS_NEAR_END
              ),
              'yyyy-MM-dd'
            )
          : datePublished;
        break;
      // B&B + Vakantieverhuurvergunning
      case item.resultaat === 'Verleend' &&
        isDateInPast(item.datumTot, dateNow) &&
        !hasOtherActualVergunningOfSameType(items, item):
        title = `Uw ${vergunningTitleLower} is verlopen`;
        description = `Uw ${vergunningTitleLower} met gemeentelijk zaaknummer ${item.zaaknummer} is verlopen. U kunt een nieuwe vergunning aanvragen.`;
        cta = 'Vergunning aanvragen';
        linkTo = ctaLinkToAanvragen;
        datePublished = item.datumTot;
        break;
      // B&B only
      case item.status === 'Ontvangen':
        title = `Aanvraag ${vergunningTitleLower} ontvangen`;
        description = `Wij hebben uw aanvraag voor een ${vergunningTitleLower} met gemeentelijk zaaknummer ${item.zaaknummer} ontvangen.`;
        cta = 'Bekijk uw aanvraag';
        linkTo = ctaLinkToDetail;
        datePublished = item.datumAanvraag;
        break;
      // B&B + Vakantieverhuurvergunning
      case !!item.resultaat:
        const resultaat = item.resultaat?.toLowerCase() || 'afgehandeld';
        title = `Aanvraag ${vergunningTitleLower} ${resultaat}`;
        description = `Wij hebben uw aanvraag voor een ${vergunningTitleLower} met gemeentelijk zaaknummer ${item.zaaknummer} ${resultaat}.`;
        cta = 'Bekijk uw aanvraag';
        linkTo = ctaLinkToDetail;
        datePublished = item.datumAfhandeling || item.datumAanvraag;
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

function createRegistratieNotification(
  item: ToeristischeVerhuurRegistratieDetail
): MyNotification {
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
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken,
  compareDate?: Date,
  profileType?: ProfileType
) {
  const TOERISTISCHE_VERHUUR = await fetchToeristischeVerhuur(
    requestID,
    authProfileAndToken,
    profileType
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
